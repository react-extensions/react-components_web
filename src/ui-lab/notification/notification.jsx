import React, {Component} from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import './notification.scss'

class Comp extends Component {
  render() {
    const {message, type} = this.props
    return (
      <div className={'notification ' + type}>{message}</div>
    )
  }
}

Comp.propTypes = {
  message: PropTypes.oneOf([PropTypes.number, PropTypes.string]),
  type: PropTypes.oneOf(['success', 'danger', 'warning'])
}

function Notification(option = {}) {
  option = Object.assign({}, {
    duration: 1500,
    message: '通知',
    type: ''
  }, option)

  const element = React.createElement(Comp, option)

  const div = document.createElement('div')
  document.body.appendChild(div)
  ReactDOM.render(element, div)

  setTimeout(((div) => {
    return function () {
      ReactDOM.unmountComponentAtNode(div)
      document.body.removeChild(div)
    }
  })(div), option.duration)
}


export default Notification 