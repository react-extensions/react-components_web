import React, { Component } from 'react'
import classname from 'classname'
import './iconfont.css'

class Icon extends Component {
  render() {
    const {type, className} = this.props
    return (<i className={'iconfont '+ (className || '') + (' icon-'+ type)}></i>)
  }
}

export default Icon
