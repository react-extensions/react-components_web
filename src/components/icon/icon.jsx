import React, { Component } from 'react'
import classname from 'classname'
import './iconfont.css'

class Icon extends Component {
  render() {
    const {type} = this.props
    return (<i className={classname('iconfont', 'icon-'+type)}></i>)
  }
}

export default Icon
