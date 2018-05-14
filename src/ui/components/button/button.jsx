import React, {Component} from 'react'
import './button.scss'

/* 
* type:  light   success  warning  danger
*
*/

class Button extends Component {
  emitClick(e) {
    const {onClick} = this.props
    onClick && onClick(e)
  }
  render() {
    const {children, type, label} = this.props
    return (
      <button type= 'button' className={'btn ' + type } onClick={this.emitClick.bind(this)} >
        {children || label}
      </button>
    )
  }
}

export default Button