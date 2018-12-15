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

    const cN = (type ? (' _'+type) : '') + (className ? (' '+className): '')

    return text && (
      <button {...rest} type= 'button' className={'u-btn' + cN }  >
        {text}
      </button>
    )
  }
}

Button.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  label: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
}

export default Button