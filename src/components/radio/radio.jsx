import React, { Component } from 'react';
import './radio.scss'
import Icon from '../icon/icon'
import PropTypes from 'prop-types'

class Radio extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: false
    }
  }
  toggleCheck(e) {
    this.setState({value: e.target.checked})
  }
  // props更新值, 默认值
  componentWillReceiveProps(nextProps){
    this.setState({value: nextProps.checked})
  }
  // 初始化, 默认值
  componentWillMount() {
    this.setState({value: this.props.checked})
  }
  shouldComponentUpdate() {
    return true
  }
  render() {
    const {label, className} = this.props
    const {value} = this.state
    return (
      <label className={'radio ' + (className || '')}>
        <input type='radio'
        className='radio__exact'
        onChange={e => this.toggleCheck(e)}
        checked = {value}
        />
        <Icon type={value ? 'radio-fill' : 'radio'} />
        <span className='radio-label'>{label}</span>
      </label>
    )
  }
}

Radio.propTypes = {
  label: PropTypes.string,  // label
  checked: PropTypes.bool,  //初始默认选中
  className: PropTypes.string //自定义类名
}

Radio.defaultProps = {
  checked: false
}

export default Radio
