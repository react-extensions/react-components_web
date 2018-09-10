import React, { Component } from 'react'
import Pattern from '../form-pattern/index'
import {Input, Cell} from '@ui'

/**
 * @prop {array} renderList
 */
class Form extends Component {
  constructor(props) {
    super(props)
    
  }
  handleChange(v) {
    console.log(...arguments)
  }
  renderFormItem(item) {
    let Comp = null
    switch(item.type) {
      case 'input':
        Comp = Pattern(Input, item.rules)
    }
    // 不要在 render中使用 hoc
    return <Comp onChange={this.handleChange.bind(this, item)} disabled={true}/>
  }
  render() {
    return (
      <div>
        {
          this.props.renderList.map(item => (
            <Cell key='item.label' title={item.label} value={this.renderFormItem(item)}/>
          ))
        }
      </div>
    )
  }
}

export default Form