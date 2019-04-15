import React, { Component } from 'react';
import './radio.scss'
import Icon from '../icon/icon'
import PropTypes from 'prop-types'

class Radio extends Component {
  toggleRadio(label) {
    const parent = this.context.radioGroup
    parent.setState({checked: label})
    const change = parent.props.onChange
    change && change(label)
  }
  componentWillMount() {
    this.checked = (this.props.label === this.context.radioGroup.state.checked)
  }
  shouldComponentUpdate(nP) {
    const oldV = this.checked
    const newV = this.checked = (nP.label === this.context.radioGroup.state.checked)
    return oldV ^ newV
  }
 /*  componentDidUpdate() {
    console.log('更新了', this.props.label)
  } */
  render() {
    const {children, className, label} = this.props
    const checked = this.checked
    return (
      <span className={'radio ' + (checked ? 'is-checked ' : '') + (className || '')}
            onClick = {this.toggleRadio.bind(this, label)}
      >
        { children || 
          <span className='radio-label'>
            <Icon type={checked ? 'radio-fill' : 'radio'} className='radio-icon'/>
            {label}
          </span>
        }
      </span>
    )
  }
}

class Group extends Component {
  constructor(props) {
    super(props)
    this.state = {
      checked: ''
    }
  }
  getChildContext() {
    return {radioGroup: this}
  }
  componentWillMount() {
    this.setState({checked: this.props.checked})
  }
  shouldComponentUpdate(nP, nS) {
    // console.log('要不要更新')
    return nS.checked !== this.state.checked //|| (nS.checked !== nP.checked && nP.checked !== this.props.checked)
  }
/*   componentDidUpdate() {
    console.log('已更新RadioGroup')
  } */
  render() {
    const {children, className} = this.props
    return (
      <div className={'radio-group ' + (className || '')}> { children } </div>
    )
  }
}

Radio.propTypes = {
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),  // label
  className: PropTypes.string //自定义类名
}
Group.propTypes = {
  checked: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  className: PropTypes.string //自定义类名
  
}


Group.childContextTypes =
Radio.contextTypes = {
  radioGroup: PropTypes.any
}

Radio.Group = Group
export default Radio
