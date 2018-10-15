import React, { Component } from 'react';
import Input from '@comps/input'
import Form from '@comps/form'
import Item from '@comps/item'
import Label from '@comps/label'
import {filter} from '@ui'
import InputTwo from '@comps/input-2'
import pattern from '@comps/pattern'

const Finput = filter(Input, {
  formatOutputValue: e=> e.target.value
})

const Pinput = pattern(Finput, {
  required: true,
    filter: v => v.replace(/\D/g, ''),
  
})

function handleDepChange(b, v) {
  return parseInt(v)+1
}



class App extends Component {
  constructor() {
    super()
    this.state = {
      // value: ''
    }
    
  }
  componentDidMount() {
    Form.onSubmit = function(v) {
      console.log(v)
    }
  }
  onChange(e) {
    this.setState({
      value: e
    })
  }
  render() {
    

    return (
      <div>
        rawInput
        {/* <InputTwo onChange={this.onChange.bind(this)} value={this.state.value}/> */}
        <Pinput/>
        <br/>

        
        username:
        <Item  >
           <Label name='username'>
            <Finput onChange={this.onChange.bind(this)} value={this.state.value} />
          </Label>
        </Item>
        <br/>
        a:
        <Item >
          <Label 
          key='a' 
          name='a' 
          dependence={['b']} 
          onDepChange={handleDepChange}
          rules= {{}}
          >
            <Finput value=''/>
          </Label>
        </Item>
        <br/>
        b:
        <Item >
          <Label name='b' >
            <Finput value=''/>
          </Label>
        </Item>

      </div>
    )
  }
}

function format(value, key) {
  return {
    // username: 
  }
}

export default Form(App, format);
