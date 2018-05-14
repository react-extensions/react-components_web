import React, { Component } from 'react';
import './radio.scss'
import Icon from '../icon/icon'
import PropTypes from 'prop-types'

class Radio extends Component {
  toggleRadio(e) {
    if(e.target.checked) {
      const parent = this.context.radioGroup
      const {label} = this.props
      parent.setState({checked: label})
      const change = parent.props.onChange
      change && change(label)
    }
  }
  shouldComponentUpdate(nP, nS) {
    return nP.checked !== this.props.checked
  }
/*   componentDidUpdate() {
    console.log('更新了', this.props.label)
  } */
  render() {
    const {children, className, label, checked} = this.props
    return (
      <label className={'radio ' + (checked ? 'is-checked ' : '') + (className || '')}>
        <input type='radio'
        className='radio__exact'
        onChange={e => this.toggleRadio(e)}
        checked = {checked}
        />
        { children || 
          <span className='radio-label'>
            <Icon type={checked ? 'radio-fill' : 'radio'} className='radio-icon'/>
            {label}
          </span>
        }
      </label>
    )
  }
}

class Group extends Component {
  constructor(props) {
    super(props)
    this.state = {
      checked: false
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
      <div className={'radio-group ' + (className || '')}>
      {
        React.Children.map(children, (radio) => {
          
          return React.cloneElement(radio, Object.assign({}, radio.props, {
            checked: radio.props.label === this.state.checked
          }))
        })
      }
      </div>
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
