import React from 'react'
import './transition.scss'

/**
 * 根据 props.children 判断是显示 还是隐藏
 * 如果有 就是显示, 没有 就是隐藏
 * 
 * 一 . 显示时
 * 1. 将高度设置成 0, 待渲染完成取消高度设置
 * 2. 缓存该元素, 供隐藏时使用
 * 
 * 二 . 隐藏时, 因为没有props.children, 此时使用缓存元素代替渲染
 * 1. 将高度设置成 0, 待动画过渡完成, 移除元素
 * 
 */
/**
 * 有四种状态
 *  1. 开启   2. 关闭   3. transition 组件state引起的更新   4.  transition外部组件引起的 children 内部更新
 *  
 */
class transition extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      className: 'transition-height',
      children: props.children,
      toggle: { height: '0' },

    }
    
    this.isOn = true
    
  }
 
  /**
   * 前置操作
   */
  componentWillReceiveProps(newP) {
    const newC = !!newP.children
    const oldC = !! this.props.children
    const isOn = this.isOn = newC && !oldC
    const isOff = this.isOff = !newC && oldC


    if(isOn || isOff) {

      clearTimeout(this.onTimer)
      clearTimeout(this.offTimer)

      const newState = { toggle: { height: 0 } }

      if (isOn) {
        newState.children = newP.children
      }

      this.setState(newState)
    } else {
      const children = this.state.children
      if(!(!!children)) return
      //transition外部组件引起的 children 内部更新, 此时 合并新的属性进来
      this.setState({
        children: React.cloneElement(
          children,
          Object.assign({}, children.props,newP.children.props)
        )
      })
    }

  }

  /**
   * 后置操作
   */
  componentDidMount() {
    this.doNext()
  }
  componentDidUpdate() {
    this.doNext()
  }
  doNext() {

    if(this.isOn) {
      this.onTimer = setTimeout(() => {
        this.setState({ toggle: {} })
      }, 20) // 这里必须一些延迟
    } else if(this.isOff){
      this.offTimer = setTimeout(() => {
        this.setState({ children: null })
      }, 300)
    }

    this.isOn = this.isOff = false

  }

  render() {
    const { toggle, className, children} = this.state

    if(!children) return false

    const mergeStyle = Object.assign({}, children.props.style || {}, toggle)
    const mergeClass = (children.props.className + ' ' || '' )+ className

    return (
      <React.Fragment>
        {
          React.cloneElement(
            children,
            Object.assign(
              {}, children.props,
              {
                className: mergeClass ,
                style: mergeStyle
              }
            )
          )
        }
      </React.Fragment>
    )

  } // End render
}

export default transition
