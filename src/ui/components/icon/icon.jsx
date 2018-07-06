import React, { Component } from 'react'
import './iconfont.css'

class Icon extends Component {
  
  render() {
    const {type, className, onClick} = this.props

    return (<i className={'iconfont '+ (className || '') + (' icon-'+ type)} onClick={onClick}></i>)
  }
}

export default Icon
