import React, { Component } from 'react'
import './iconfont.css'

class Icon extends Component {
  
  render() {
    const {type, className, onClick, style} = this.props

    return (<i style = {style} className={'iconfont '+ (className || '') + (' icon-'+ type)} onClick={onClick}></i>)
  }
}

export default Icon
