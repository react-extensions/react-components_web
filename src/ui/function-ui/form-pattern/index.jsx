import React from 'react'
import './style.css'


/**
 * options 为 对象格式, 键有:
 * 
 * @key {function} filter  用于在onChange时 拦截输入数据, 需要返回一个处理过的新值
 *  例: v => v.replace(/\d/g, '')
 * @key {RegExp | function} pattern 
 * @key {object} tip 
 *  例: {success: <func|string>, error: <>, required: <>}
 * @key {bool} required 
 */

function extendFunc(
  Component, 
  options,
   getRealValue
   ) {


  class FormPattern extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        value: props.value,     //* form 的值
        tip: null               //* form 验证提示
      }

      this.handleBlur = this.handleBlur.bind(this)
      this.handleChange = this.handleChange.bind(this)
    }
    /**
     * @function componentDidMount 
     * 1. 将验证函数发送到外部, 给父组件调用
     */
    componentDidMount() {
      this.props.emitChildApi(() => {
        return this.pattern.call(this, this.state.value, 'blur')
      })
    }

    /**
     * 
     * @function lifeHook
     * 
     * 监听父组件 数据变化, 
     */
    UNSAFE_componentWillReceiveProps(nextP) {

      if (nextP.value !== this.props.value) {
        this.setState({ value: nextP.value })
      }
      // 清除提示状态
      const nShould = nextP.shouldCleanState
      if (nShould !== this.props.shouldCleanState) {
        this.setState({ tip: null })
      }

    }


    /**
     * 
     * @function
     *    处理Change事件
     * @param {event} e 
     */
    handleChange(e, ...args) {
      let value = getRealValue(e, ...args)

      const filter = options && options.filter
      if (filter && typeof filter === 'function') value = filter(value);

      this.pattern(value, 'change')
      
      this.setState({ value })

      this.props.onChange(value)
    }

    /**
     * 
     * @function
     *    处理 blur事件
     * 
     */
    handleBlur() {
      const onBlur = this.props.onBlur
      onBlur && onBlur(...arguments)
      this.pattern(this.state.value, 'blur')
    }

    /**
     * 
     * @function pattern 验证表单的值, 并返回新的state, 以更新组件
     * 默认只在表单控件失去焦点时,进行检查. 如果检查出错, 则在表单控件 onChange时 也会进行检查, 直到正确
     * 
     * @param {*} value 
     * @param {string} type change | blur
     */
    pattern(value, type) {
      
      if(!options) return

      const newState = { tip: null }
      // 1. 在表单控件有错误提示之后, onChange事件也会触发检查, 直到输入正确
      if (type === 'change' && ((this.state.tip && this.state.tip.type !== 'error') || !this.state.tip)) {
        this.setState(newState)
        return true
      }

      const tip = options.tip

      // 2. 如果输入框没有值， 只需 验证是否必填项, 
      //    如果必填， 则给出错误提示， 否则直接返回， 不再执行下面的验证
      if (!value) {
        if (options.required) {
          const requiredTip = tip && tip.required
          if (typeof requiredTip === 'function') {
            requiredTip()
            return false
          }
          newState.tip = { text: requiredTip || '此项为必填项', type: 'error' }
          this.setState(newState)
          return false
        }
        this.setState(newState)
        return true
      }

      // 3. 如果有pattern 配置, 根据 pattern 验证， 否则直接返回 {tip： null}
      const pattern = options.pattern
      // 扁平化， 减少嵌套
      if (!pattern || typeof pattern !== 'function') {
        this.setState(newState)
        return true
      }
      // 3.1 验证
      const patternResult = pattern(value)
      if (patternResult && (patternResult === true || patternResult.result === true)) {
        // 没有 success 配置  且 当前处于  success状态
        const successTip = tip && tip.success
        if (!successTip) {
          this.setState(newState)
          return true
        }
        if (typeof successTip === 'function') {
          successTip()
          return true
        }

        newState.tip = { type: 'success', text: successTip }
        this.setState(newState)
        return true
      } else {
        // pattern 函数验证错误, 如果返回的是 {result: false, failTip: ''}
        // 根据failTip 给出提示
        if (patternResult && patternResult.tip) {
          newState.tip = { text: patternResult.tip, type: 'error' }
          this.setState(newState)
          return false
        }

        const errorTip = tip && tip.error

        if (!errorTip) {
          this.setState(newState)
          return false
        }

        if (typeof errorTip === 'function') {
          errorTip()
          return false
        }

        newState.tip = { text: errorTip, type: 'error' }
        this.setState(newState)
        return false
      }
    }

    render() {
      const state = this.state
      const { emitChildApi, shouldCleanState, ...proxyProps } = this.props
      
      return (
        <div className={'input-pattern-wrap' + (state.tip ? (' ' + state.tip.type) : '')}>
          <Component
            {...proxyProps}
            value={state.value}
            onChange={this.handleChange}
            onBlur={this.handleBlur}
          />
          {state.tip &&
            (<span className={'input-tip ' + state.tip.type}>{state.tip.text}</span>)
          }
        </div>
      )
    }
  }

  FormPattern.defaultProps = {
    onChange: () => { },
    emitChildApi: () => { }
  }
  return FormPattern
}

export default extendFunc