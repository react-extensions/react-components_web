import React from 'react'
import Context from './context'

class FormMiddleware extends React.PureComponent {
  render() {
    const children = this.props.children
    return (
      <Context.Consumer>
        {
          getInterfaces => React.cloneElement(children, Object.assign({},children.props || {}, {interfaces: getInterfaces}))
        }
      </Context.Consumer>
    )
  }

}
export default FormMiddleware