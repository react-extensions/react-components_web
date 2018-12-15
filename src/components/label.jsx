import React, { Component } from 'react';
import PropTypes from 'prop-types'
/**
 * @component 
 * 
 * 
 * @prop {string} name 表单 name字段
 * @prop {array|string} dependence 依赖表单的name字段组成的数组， 当依赖发生变化时， 会通知此表单， 并执行handler
 * @prop {function} onDepChange 当依赖改变时，会触发此函数
 * @prop {}
 */
class Label extends Component {
  constructor(props) {
    super(props)
    const cProps = props.children.props
    const value = cProps.value

    this.state = {
      // 优先取 value的值, 其次去defaultValue 的值
      value: value=== undefined || value === null ? cProps.defaultValue : value
    }

    this.onChange = this.onChange.bind(this)
    this.onKeyPress = this.onKeyPress.bind(this)
    this.onDepChange = this.onDepChange.bind(this)
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
  getChildProps() {
    return this.props.children.props
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
  onChange(v) {

    this.setState({value: v})
    // this.changeValue(v)

    // 通知Form , 表单的值产生了修改, 以执行依赖订阅函数
    this.props.onChange(this.props.name, v, this.props.key)

    // 触发绑定在组件 自身上的 onChange
    const rawOnChange = this.getChildProps().onChange
    rawOnChange && rawOnChange(v)
  }
  /**
   * @function - 在表单上处理onKeyPress, 主要用于处理 点击 enter 提交
   * 
   */
  onKeyPress(e) {
     // 触发绑定在组件 自身上的 onChange
    const rawOnKeyPress = this.getChildProps().rawOnKeyPress
    rawOnKeyPress && rawOnKeyPress(e)
    
    if(e.nativeEvent.keyCode !== 13 || e.ctrlkey || e.altKey) return
    
    this.props.onSubmit()

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
            onChange: this.onChange,
            value: this.state.value,
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
  name: PropTypes.string
}

export default Label