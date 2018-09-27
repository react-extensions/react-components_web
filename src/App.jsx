import React, { Component } from 'react';
import { Cell, Input } from '@ui'
import Pattern from '@ui/function-ui/form/pattern'
import Form from '@ui/function-ui/form'
import { DatePicker  } from 'antd'
import Filter from '@ui/function-ui/form/filter'

const { RangePicker } = DatePicker


const renderList = [
  {
    type: 'input',
    disabled: () => { },
    label: 'name',
    rules: {
      required: true,
      filter: v => v.replace(/\D/g, ''),
      pattern: v => {
        // console.log(/\D/g.test(v), v)
        return /\d/g.test(v)
      },

      tip: {
        error: '没有数字',
        // success: 'crract'
        required: 'bixu'
      }
    }

  }
]
const PatternInput = Pattern(Input, {
      required: true,
      filter: v => v.replace(/\D/g, ''),
      pattern: v => {
        // console.log(/\D/g.test(v), v)
        return /\d/g.test(v)
      },

      tip: {
        error: '没有数字',
        // success: 'crract'
        required: 'bixu'
      }
    })

    const Picker = FormItem(RangePicker, v=>v, (v,v2)=>v2)

class App extends Component {
  constructor() {
    super()

    this.state={
      value: []
    }

  }
  handleChange(v) {
    console.log(v)
    this.setState({
      value: v
    })
  }
  render() {
    

    return (
      <div>

        {/* <Form renderList={renderList} /> */}

        {/* <PatternInput/> */}
        <Picker onChange={this.handleChange.bind(this)} value={this.state.value}/>
      </div>
    )
  }
}

export default App;
