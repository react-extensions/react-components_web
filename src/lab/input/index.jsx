import React from 'react'
import './style.less'


class PlainInput extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      value: props.value || ''
    }
  }

  /**
   * 
   * @function lifeHook
   * 
   * 监听父组件 数据变化, 
   */
  UNSAFE_componentWillReceiveProps(nextP) {
    if (nextP.value !== this.props.value) {
      this.setState({ value: nextP.value })
    }
  }

  render() {
    const props = this.props
    const state = this.state
    const {htmlType, ...proxyProps} = props

    return (
      <input
        {...proxyProps}
        type = {htmlType || 'text'}
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