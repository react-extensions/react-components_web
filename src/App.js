import React, { Component } from 'react';
import './App.scss'

import {
Radio,
Checkbox,
Select,

} from './ui/index'

class App extends Component {
  constructor(){
    super()
    this.state = {
      bool: true,
      list: [],
      radio: '菠萝'
    }
    this.handle = this.handle.bind(this)
    this.change = this.change.bind(this)
    setTimeout(() => {
      this.setState({list: ['菠萝', '苹果']})
    },3000)
  }
  handle() {
    this.setState(prev => ({
      bool: !prev.bool
    }))
  }
  change(v) {
    this.setState({list: v})
  }
  changeRadio(v) {
    console.log(v)
    this.setState({radio: v})
  }
  changeSelect(v) {
    console.log('父元素',v)
  }
  render() {
    // Notification({message: 'ssss', type: 'danger'})
    const {bool, list,radio} = this.state
    return (
      <div className='container'>
        <button type='button' onClick = {this.handle}>{bool ? 'ON' : 'OFF'}</button>
        <br/>
        <Checkbox.Group checkedList={list} onChange={this.change}>
          <Checkbox label='菠萝'/>
          <Checkbox  label='苹果'/>
          <Checkbox label='香蕉' />
        </Checkbox.Group>
        <br/>
   
        <br/>
        <Radio.Group checked= {radio} onChange={this.changeRadio.bind(this)}>
          <Radio label='菠萝'/>
          <Radio label='苹果'/>
          <Radio label='香蕉'/>
          <Radio label='DDD'/>
        </Radio.Group>
        <br/>
        <Select onChange={this.changeSelect.bind(this)} selectedList={list} multiple>
          <Select.Option label='苹果' value={{name: "苹果", id:'pg'}}/>
          <Select.Option label='菠萝' value={{name: "菠萝", id:'PAIAPPLE'}}/>
          <Select.Option label='香蕉' value={{name: "香蕉", id:'BANANA'}}/>
        </Select>
        
      </div>
    );
  }
}

export default App;
