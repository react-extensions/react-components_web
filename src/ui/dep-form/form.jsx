import React, {Component} from 'react';
import Context from './context'

const clearStateQueue = []
const patternQueue = []
/*
* @function 用于表单的验证
* */
class Form extends Component {
  constructor(props) {
    super(props)
    this.getInterfaces = this.getInterfaces.bind(this)
  }
  getInterfaces(name, dependence) {


  }
  render() {
    return (
      <Context.Provider value={this.getInterfaces}>
        {this.props.children}
      </Context.Provider>
    );
  }
}

Form.doPattern = function() {
  return patternQueue.every(item => item())
}

Form.clearState = function() {
  clearStateQueue.forEach(item => item())
}

export default Form;