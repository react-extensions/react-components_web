import React from 'react'
import './style.css'

/**
 * @options {object} 
 *    ||
 * @key filter {function}
 * @key pattern {RegExp | function}
 * @key tip {object}  {success: <func|string>, error: <>, required: <>}
 * @key required {bool} 
 */

const extendFunc = function (Component, options) {

  class FormPattern extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        value: props.value,     //* form 的值
        tip: null                            //* form 验证提示
      }


      this.handleBlur = this.handleBlur.bind(this)
      this.handleChange = this.handleChange.bind(this)
    }
    

    /**
     * 
     * @function lifeHook
     * 
     * 监听父组件 数据变化, 
     */
    UNSAFE_componentWillReceiveProps(nextP) {

      if (nextP.value !== this.props.value) {
        this.setState({value: nextP.value})
      }

    }


    /**
     * 
     * @function
     *    处理Change事件
     * @param {event} e 
     */
    handleChange(e) {
      let value = e.nativeEvent ? e.target.value : e

      const filter = options.filter

      if (filter && typeof filter === 'function') {
        value = filter(value)
      }


      this.check(value)

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

      this.check(this.state.value)

    }
    /**
     * 
     * @function
     *    验证表单的值
     * 
     * @param {*} value 
     */
    check(value) {
      const newState = this.getNewState(value)
      newState && this.setState(newState)
    }

    /**
     * 验证表单的值, 并返回新的state, 以更新组件
     * @param {*} value 
     */
    getNewState(value) {
      const tip = options.tip

      //验证必填项
      if (!value) {
        if (options.required && this.tipType !== 3) {
          this.tipType = 3
          const required = tip.required

          if (typeof required === 'function') {
            required()
            return
          }
          return { tip: { text: required || '此项为必填项', type: 'error' } }
        }
        return
      }

      //根据 pattern 验证
      const pattern = options.pattern

      if (pattern && typeof pattern === 'function' && tip) {

        // 验证通过
        if (pattern(value)) {

          const success = tip.success

          // 没有 success 配置  且 当前处于  success状态
          if (this.tipType === 1) return

          this.tipType = 1

          if (!success) return {tip: null}


          if (typeof success === 'function') {
            success()
            return
          }

         return { tip: { text: success, type: 'success' } }

        } else {

          const error = tip.error

          if(this.tipType === 2) return

          this.tipType = 2

          if (!error) return {tip: null}

          if (typeof error === 'function') {
            error()
            return
          }

          return { tip: { text: error, type: 'error' } }
        }

      }
      
    }

    render() {
      const state = this.state


      return (
        <div className={'input-pattern-wrap' + (state.tip ? (' ' + state.tip.type):'')}>
          <Component
            {...this.props}
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
  }
  return FormPattern
}

export default extendFunc