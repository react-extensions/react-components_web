import React, { Component } from 'react';
import './style.scss'
import PropTypes from 'prop-types'
import Context from './context'

class Radio extends Component {
  constructor(props) {
    super(props)

    this.init()

    this.toggleRadio = this.toggleRadio.bind(this)
  }

  init() {
    const props = this.props
    const pValue = props.value
    const bool = pValue && (typeof pValue === 'string' || typeof pValue === 'number')
    const id = bool ? pValue : (props.label || props.id)
    const value = props.value || id

    this.value = {
      id: id,
      label: props.label || null,
      value: value
    }
    
  }

  toggleRadio(e) {
    if(!e.target.checked) return
    const fn = this.props.onChange
    fn && fn(this.value)

  }
    // props更新值, 默认值
  // componentWillReceiveProps(nextP, context){
    
  //   if(nextP.checked !== this.props.checked) {
  //     // this.init(nextP)
  //   }
  // }
  shouldComponentUpdate(nP) {
    const id = this.value.id
    return (id === nP.checked) !== (id === this.props.checked)
  }

  render() {
    const props = this.props
    const checked = props.checked === this.value.id
    
    return (
      <label className={'radio ' + (checked ? 'is-checked ' : '') + (props.className || '')}>
        <input type='radio'
               className='radio__exact'
               onChange={this.toggleRadio}
               checked = {checked}
        />
        { props.children ||
        <span className='radio-label'>
          <div className= {'radio-icon' + (checked ? ' radio-fill' : ' radio')}> </div>
          {props.label}
          </span>
        }
      </label>
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

function extend(Comp) {
  return class RadioMiddlware extends React.Component {
    render() {
      return (
        <Context.Consumer>
          {obj => <Comp {...this.props} {...obj} />}
        </Context.Consumer>
      )
    }
  }
}

export default extend(Radio)
