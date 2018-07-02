import React, { Component } from 'react'


class Transition extends Component {
  constructor(props) {
    super(props)
    const {children, name} = props
    this.state = {
      children: children || null,
      className: children ? name + '-enter-active ' + name + '-enter' : '',
    }

  }
  getDuration() {
    const elem = this.el
    if(!elem) return 0
    const style = document.defaultView.getComputedStyle(elem, null)

    let duration = style.animationDuration

    if(duration === '0s' || duration === '0ms') {
      duration = style.transitionDuration
    }

    if(duration.indexOf('ms') > -1) {
      return parseFloat(duration.slice(0,-2))
    } else{
      return parseFloat(duration.slice(0,-1)) * 1000
    }
    
  }

  toggleON() {
    const name = this.props.name
    setTimeout(()=> {
      this.setState({ className: name + '-enter-active ' + name + '-enter-to' })
    }, 0)

    setTimeout(() => {
      this.setState({className: ''})
    }, this.getDuration())

  }

  toggleOFF() {
  
    setTimeout(() => {
      this.setState({children: null})
    }, this.getDuration() - 30)

  }

  componentWillReceiveProps(nextP) {

    // 显示
    if(nextP.children && !this.props.children) {
      this.setState({className: nextP.name + '-enter-active ' + nextP.name + '-enter', children: nextP.children})
      // 隐藏
    } else if(!nextP.children && this.props.children){
      this.setState({className: nextP.name + '-leave-active'})
    }

  }

  componentDidMount(){
    this.toggleON()
  }

  componentDidUpdate(prevP) {

    if(!prevP.children && this.props.children) {
      this.toggleON()
    } else if(prevP.children && !this.props.children){
      this.toggleOFF()
    }

  }
  render() {

    const {className, children} = this.state

    if(!children) return false

    const oldClassName = children.props.className || ''
    return (
      <React.Fragment>
        {
          React.cloneElement(children, Object.assign({}, children.props, {
            className: oldClassName + ' ' + className,
            ref: el => {
              if(!el) return
              this.el = (typeof children.type === 'function' ? el.transitionElem : el)
            }
          }))
        }
      </React.Fragment>
    )
  }
}

export default Transition