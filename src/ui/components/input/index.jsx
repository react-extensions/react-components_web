import React from 'react'
import './style.css'


class PlainInput extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      proxyProps: this.proxyProps(props),
      value: ''
    }

  }
  /**
  * 
  * @function
  * 代理props
  */
  proxyProps(props) {
    const subProps = Object.assign({}, props)
    delete subProps.value
    return subProps
  }
  /**
   * 
   * @function lifeHook
   * 
   * 监听父组件 数据变化, 
   */
  UNSAFE_componentWillReceiveProps(nextP) {
    const newState = { proxyProps: this.proxyProps(nextP) }


    if (nextP.value !== this.props.value) {
      newState.value = nextP.value
    }

    this.setState(newState)
  }

  render() {
    const props = this.props
    const state = this.state

    return (
      <input
        {...state.proxyProps}
        value={state.value}
        className={'i-plain-input ' + (props.className || '')}
      />
    )
  }
}

PlainInput.defaultProps = {
  value: ''
}

export default PlainInput