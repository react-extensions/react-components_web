import React, { Component } from 'react';
import PropTypes from 'prop-types'
import Context from './context'

/**
 * @component label
 * 1. 验证输入
 * 2. 过滤输入
 * 3. 表单间依赖
 * 
 * 
 * @prop {string} id 表单唯一字段
 * @prop {string} name 表单 name字段
 * @prop {array|string} dependence 依赖表单的name字段组成的数组， 当依赖发生变化时， 会通知此表单， 并执行handler
 * @prop {function} onDepChange 当依赖改变时，会触发此函数
 * @prop {function} filter
 * @prop {function} pattern
 * @prop {function} onValidate
 */
class Label extends Component {
  constructor(props) {
    super(props)
    
    this.childrenProps = props.children.props

    const value = this.childrenProps.value

    this.state = {
      // 优先取 value的值, 其次去defaultValue 的值
      value: value=== undefined || value === null ? this.childrenProps.defaultValue : value
    }

    this.onBlur = this.onBlur.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onKeyPress = this.onKeyPress.bind(this)
    this.onDepChange = this.onDepChange.bind(this)

    // this.patternApi = () => this.pattern.call(this, this.state.value, 'blur')
    // this.clearStateApi = ()=> this.setState({tip: null})

    }

    emit(type) {
      // const emit = this.props.interfaces
      // emit && emit({
      //   pattern: this.patternApi ,
      //   clearState: this.clearStateApi
      // }, type)
    }
  componentDidMount() {
    const props = this.props
    let depQueue = props.dependence
    if(typeof depQueue === 'string' ) {
      depQueue = [depQueue]
    }
    props.interfaces({
      // name: props.name, 
      depQueue: depQueue, 
      subscribeDepChange: this.onDepChange,
    })

  }
  /**
   * @function - 当该组件的依赖项发生改变, 会触发此函数, 
   */
  onDepChange(name, value) {
    const fn = this.props.onDepChange
    if(!fn) {
      if(process.env.NODE_ENV === 'development'){
        console.error(new ReferenceError(`你忘记传入name: ${this.props.name}的onDepChange处理函数`))
      }
      return
    }
    this.setState({value: fn(name, value)})

    // this.changeValue()
  }
  /**
   * @function - 处理表单onChange事件
   * 
   */
  onChange(value) {
    const props = this.props
    const filter = props.filter
    // 1. 如果有rules, 且有rules.filter, 过滤value
    if (filter && typeof filter === 'function') value = filter(value);
    // 2. 验证输入值value, 是否符合rules

    this.validate(value, 'change')


    this.setState({value: value})
    // this.changeValue(v)

    // 通知Form , 表单的值产生了修改, 以执行依赖订阅函数
    props.onChange(props.name, value, props.id)

    // 触发绑定在组件 自身上的 onChange
    const rawOnChange = this.childrenProps.onChange
    rawOnChange && rawOnChange(value)
  }
  /**
   * @function - 在表单上处理onKeyPress, 主要用于处理 点击 enter 提交
   * 
   */
  onKeyPress(e) {
     // 触发绑定在组件 自身上的 onChange
    const rawOnKeyPress = this.childrenProps.onKeyPress
    rawOnKeyPress && rawOnKeyPress(e)
    
    if(e.nativeEvent.keyCode !== 13 || e.ctrlkey || e.altKey) return
    
    this.props.onSubmit()

  }
  /**
   * @function - 失去焦点时进行验证
   */
  onBlur(e) {
    const rawOnBlur = this.childrenProps.onBlur
    rawOnBlur&&rawOnBlur(e)

    this.validate(this.state.value, 'blur')

  }
  /**
   * @function - 验证输入
   * @param {*} value 
   * @param {*} type 
   */
  validate(value, type) {
    const pattern = this.props.pattern
    if(!pattern) return
    pattern(value, type)

  }
  render() {
    const children = this.props.children
    return (
      React.cloneElement(
        children, 
        Object.assign(
          {}, 
          children.props, 
          {
            value: this.state.value,
            onChange: this.onChange,
            onBlur: this.onBlur,
            onKeyPress: this.onKeyPress
          }
        )
      )
    )
  }
}

Label.propTypes = {
  onDepChange: PropTypes.func,
  dependence: PropTypes.oneOfType([ PropTypes.array, PropTypes.string]),
  name: PropTypes.string,

}

function extend (Comp) {
  return class FormItem extends React.PureComponent {
    render() {
      const children = this.props.children
      return (
        <Context.Consumer>
          { obj => React.cloneElement(children, Object.assign({}, children.props, obj)) }
        </Context.Consumer>
      )
    }
  }
}

export default extend(Label)