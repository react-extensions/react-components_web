import React, { Component } from 'react';
import PropTypes from 'prop-types'
import Context from './context'

class RadioGroup extends Component {
  constructor(props) {
    super(props)

    this.onCheckedChange = this.onCheckedChange.bind(this)

    this.contextObj = {
      onChange: this.onCheckedChange,
      checked: props.checked
    }
  }
  onCheckedChange(obj) {
    this.contextObj = Object.assign({}, this.contextObj, {checked: obj.id})
    this.forceUpdate()
    const fn = this.props.onChange
    fn && fn(obj)
  }
  UNSAFE_componentWillReceiveProps(nextP) {
    if(nextP.checked !== this.props.checked) {
      this.setState({checked: nextP.checked})
    }
  }
  shouldComponentUpdate(nP, nS) {
    return nP.checked !== this.props.checked
  }
  render() {
    return (
      <Context.Provider value={this.contextObj}>
        {this.props.children}
      </Context.Provider>
    )
  }
}


RadioGroup.propTypes = {
  checked: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  className: PropTypes.string //自定义类名
}


export default RadioGroup