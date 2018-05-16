import React from 'react'
import './dialog.scss'
import {attachEvent, detachEvent} from '../../libs/utils'
import Icon from '../icon/icon'

// title, content, ft , show, className
// onClose
class Dialog extends React.Component {
  constructor() {
    super()
    this.state = {
      moveStyle: null,
      endStyle: null,
      isMove: false
    }
    this.toastMove = this.toastMove.bind(this)
    this.unSelect =  this.unSelect.bind(this)
    this.detachEvent = this.detachEvent.bind(this)
  }
  close(v) {
    const close = this.props.onClose
    if(close) {
      close(-1)
      this.setState({endStyle: null, moveStyle: null})
      this.detachEvent()
    }
  }

  /* 移动toast */
  selected(e) {
    if(this.hd === e.target) {
      const {top, left, height,width} = e.currentTarget.getBoundingClientRect()
      this.cache = {
        x: left - e.clientX,
        y: top - e.clientY,
        h: height,
        w: width,
        screenX: document.documentElement.clientWidth,
        screenY: document.documentElement.clientHeight
      }
      
      this.setState({
        isMove: true,
        moveStyle: {
          position: 'absolute',
          top: `${top}px`,
          left: `${left}px`,
          width: `${width}px`,
          height: `${height}px`,
          border: '1px dashed #eee',
          zIndex: 123,
          backgroundColor: 'rgba(0,0,0,0.5)'
        }
      })
      attachEvent(window, 'mousemove', this.toastMove)
      attachEvent(window, 'mouseup', this.unSelect)
    }
  } 

  toastMove(e) {
    e = e || window.event
    let {x, y, w, h, screenX, screenY} = this.cache
    x = e.clientX + x
    y = e.clientY + y
    x = x < 0 ? 0 : (x > screenX - w ) ? (screenX - w) : x 
    y = y < 0 ? 0 : (y > screenY - h ) ? (screenY - h) : y 
    this.setState(prev => ({moveStyle: Object.assign({}, prev.moveStyle, {top: `${y}px`,left: `${x}px`})}))
  }
  unSelect(){
    const {left, top} = this.state.moveStyle
    this.setState({
      isMove: false,
      endStyle: {
        position: 'absolute',
        top,
        left,
      }
    })
    this.detachEvent()
  }
  detachEvent() {
    detachEvent(window, 'mousemove', this.toastMove)
    detachEvent(window, 'mouseup', this.unSelect)
  }
  componentWillUnmount(){ this.detachEvent() }
  render() {
    const {className, show ,title, content, children, footer} = this.props
    const {moveStyle, endStyle, isMove} = this.state
      return (
          <div className={ "dialog-wrap " + (show ? 'd-flex' : '') }>
            <div className={"dialog " + (className || '')}
                onMouseDown = {e => this.selected(e)} 
                style={endStyle}
                >
                  <span onClick={this.close.bind(this, -1)} className="dialog-close-btn ">
                    <Icon type='close'  />
                  </span>
                  <div className="dialog-hd" ref = {el => this.hd = el}>{title}</div>
                  <div className="dialog-bd">{children || content}</div>
                  {footer && <div className="dialog-ft">{footer}</div>}   
            </div>
            <div className={isMove ? '' : 'd-none'} style={moveStyle}></div>
          </div>
        )
  }
}
export default Dialog