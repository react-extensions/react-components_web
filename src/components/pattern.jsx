import React from 'react'

export default function (Component) {

  return class Pattern extends React.PureComponent {

    render() {
      const {interfaces, ...proxyProps} = this.props

      return (
        <Component
            {...proxyProps}
            value={state.value}
            onChange={this.handleChange}
            onBlur={this.handleBlur}
          />
      )
    }
  }
}