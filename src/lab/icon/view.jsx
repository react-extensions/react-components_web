import React from 'react'
class View extends React.PureComponent {
  render() {
    const {type,className, ...proxyProps} = this.props
    return (
      <div className={'u-icon u-icon__'+type +(className?(' '+className):'')} {...proxyProps}></div>
    )
  }
}

export default View