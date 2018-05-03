import React, { Component } from 'react';
import './App.scss'
import Checkbox from './components/checkbox/checkbox'
import Select from './components/select/select'

class App extends Component {
  constructor(){
    super()
    this.state = {
      bool: true,
      list: ['1', '3']
    }
    this.handle = this.handle.bind(this)
    this.change = this.change.bind(this)
  }
  handle() {
    this.setState(prev => ({
      bool: !prev.bool
    }))
  }
  change(v) {
    console.log(v)
    this.setState({list: v})
  }
  render() {
    const {bool, list} = this.state
    return (
      <div>
        <button type='button' onClick = {this.handle}>{bool ? 'ON' : 'OFF'}</button>
        <br/>
        <Checkbox.Group checkedList={list} onChange={this.change}>
          <Checkbox label='1' value='1' />
          <Checkbox  label='2' value='2'/>
          <Checkbox label='3' value='3'/>
        </Checkbox.Group>
        <br/>
        <Select multiple = {true}>
          <Select.Option label='1' value='1'/>
          <Select.Option label='2' value='2'/>
          <Select.Option label='3' value='3'/>
          
        </Select>
      </div>
    );
  }
}

export default App;
