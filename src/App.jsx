import React, { Component } from 'react';
import { Cell, Input } from '@ui'
import Pattern from '@ui/function-ui/form-pattern'
import Form from '@ui/function-ui/form'

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

class App extends Component {
  constructor() {
    super()

  }

  render() {
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

    return (
      <div>

        <Form renderList={renderList} />

      </div>
    )
  }
}

export default App;
