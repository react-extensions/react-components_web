import React, { Component } from 'react'

class Transition extends Component {
  constructor(props) {
    super(props)
    
    this.state = {
      children: props.children || null,
      durationSuffix: '-enter-active',
      temporarySuffix: '-enter'
    }

  }
 
  getDuration() {

    const elem = this.el

    if(!elem) return 0

    const style = document.defaultView.getComputedStyle(elem, null)

    let duration = style.animationDuration

    if(duration === '0s' || duration === '0ms') duration = style.transitionDuration

    return duration.indexOf('ms') > -1 ? parseFloat(duration.slice(0,-2)) : parseFloat(duration.slice(0,-1)) * 1000
    
  }
  nextTick (callback) {
    window.requestAnimationFrame ? window.requestAnimationFrame(callback) : setTimeout(callback, 0)
  }
  // on
  toggleON() {

    this.nextTick(()=> this.setState({ temporarySuffix: '-enter-to' }))

    this.onTimer = setTimeout(()=> this.setState({temporarySuffix: '', durationSuffix: ''}), this.getDuration())

  }
  // off
  toggleOFF() {

    this.nextTick(()=> this.setState({ temporarySuffix: '-leave-to' }))

    this.offTimer = setTimeout(()=> this.setState({ children: null }), this.getDuration() - 34)

  }

  componentWillReceiveProps(nextP) {
    // const nextC = nextP.children

    this.isOn = nextP.children && !this.props.children

    this.isOff = !this.isOn && (!nextP.children && this.props.children)

    // 显示
    if( this.isOn ) {
      clearTimeout(this.offTimer)
      this.setState({durationSuffix: '-enter-active', temporarySuffix: '-enter', children: nextP.children})
      // 隐藏
    } else if( this.isOff ){
      clearTimeout(this.onTimer)
      this.setState({durationSuffix: '-leave-active', temporarySuffix: '-leave'})
    } else {

      const children = this.state.children

      if(!(!!children)) return
      
      //transition外部组件引起的 children 内部更新, 此时 合并新的属性进来
      this.setState({
        children: React.cloneElement(
          children,
          Object.assign({}, children.props, nextP.children.props)
        )
      })

    }
  

  }

  componentDidMount(){
    this.toggleON()
  }

  componentDidUpdate() {

    if( this.isOn ) {
      this.toggleON()
    } else if( this.isOff ){
      this.toggleOFF()
    }
    
    this.isOff = this.isOn = false
  }
  render() {

    const {children, durationSuffix, temporarySuffix} = this.state

    if(!children) return false

    const {name} = this.props

    const durationClass = durationSuffix ? name + durationSuffix : ''

    const temporaryClass = temporarySuffix ? name + temporarySuffix : ''

    return (
      <React.Fragment>
        {
          React.cloneElement(children, Object.assign({}, children.props, {
            className: (children.props.className || '') + ' ' + durationClass + ' ' +  temporaryClass,
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