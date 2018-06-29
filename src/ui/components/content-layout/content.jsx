import React, { Component } from 'react'
import './content.scss'

class Content extends Component {
 /*  constructor(props) {
    super(props);
    this.state = {  }
  } */
  render() { 
    const {header, body, footer} = this.props
    return (
      <div className='content-container' ref = {el => this.container = el}>
        <div className="content-header" >
          {header}
        </div>
        <div className="content-body" >
          {body}
        </div>
        <div className="content-footer">
          {footer}
        </div>
      </div>
    )
  }
}
 
export default Content