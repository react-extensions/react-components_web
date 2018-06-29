import React, { Component } from 'react'
import { Cell } from '@ui/index'

class FilterItem extends Component {
  constructor(props) {
    super(props)
    this.state = {
      
    }
  }
  render() { 
    return (
      <Cell title='缴款书编号' value={
              <Input placeholder='请输入缴款书编号' onInput={e => this.onInput(e, 'jksbh')} />
            } />
    )
  }
}
 
export default FilterItem