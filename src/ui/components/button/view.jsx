import React from 'react'
import PropTypes from 'prop-types'
/* 
* type:  light  success  warning  danger
*
*/

class Button extends React.PureComponent {

  render() {
    const {children, label, type, className, ...rest} = this.props
    const text = children || label

    const cN = (type ? (' _'+type) : ' _normal') + (className ? (' '+className): '')

    return text && (
      <button {...rest} type= 'button' className={'u-btn' + cN }  >
        {text}
      </button>
    )
  }
}

Button.propTypes = {
  children: PropTypes.node,
  label: PropTypes.node,
}

export default Button