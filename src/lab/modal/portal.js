import React from 'react'
import ReactDOM from 'react-dom'

export default function(View) {
  return class Portal extends React.PureComponent{
    constructor(props){
      super(props)
      this.container = props.container || document.body.appendChild(document.createElement('div'))
    }
    componentWillUnmount() {
      if(!this.props.container) {
        document.body.removeChild(this.container)
      }
    }
    render() {
      const {container, ...rest} = this.props
      return (
        ReactDOM.createPortal(<View {...rest}/>, this.container)
      )
    }
  }
}