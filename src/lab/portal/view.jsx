import React from 'react'
import ReactDOM from 'react-dom'

class PortalContent extends React.PureComponent {
  render() {
    const {children,  className, ...rest} = this.props
    return (
      <div {...rest} className={'u-portal ' + (className||'')} >
        {children}
      </div>
    )
  }
}

/* 插槽 */

export default class Portal extends React.PureComponent{
  constructor(props) {
    super(props)

    this.container = document.body.appendChild(document.createElement('div'))

  }
  componentWillUnmount() {
    document.body.removeChild(this.container)
  }
  render() {
    return (
      ReactDOM.createPortal(<PortalContent {...this.props}/>, this.container)
    )
  }
}