import React, { Component } from 'react';
import './App.scss'

import {
Radio,
Checkbox,
Select,
Table
} from './ui/index'

class App extends Component {
  constructor(){
    super()
    this.state = {
      bool: true,
      list: [],
      radio: '菠萝',
      input: ''
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
  input(e) {
    this.setState({input: e.target.value})
  }
  render() {
    // Notification({message: 'ssss', type: 'danger'})
    const { bool, list, radio, input} = this.state
    const thead = [
      {
        type: 'index'
      },
      {
        type: 'checkbox'
      },
      {
        type: 'expand',
        content: (
          <div>
            <h1>zhangs</h1>
            <ul>
              <li>一</li>
              <li>二</li>
              <li>仨</li>
            </ul>
          </div>
        )
      },
      {
        prop: 1,
        label: '第一列'
      },
      {
        prop: 2,
        label: '第二列'
      },
      {
        prop: 3,
        label: '第三列'
      },
    ]
    const tbody = [
     {
       1: '张',
       2: '李',
       3: '吴'
     },
      {
        1: 'a',
        2: 'b',
        3: 'c',
        4: {
          zhang: 'asfasd '
        }
      }
      ,
      {
        1: 'z',
        2: 'x',
        3: 'd',
        4: {
          zhang: 'fasfd  '
        }
      }
    ]
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
        <Select onChange={this.changeSelect.bind(this)} selectedList={list} multiple search>
          <Select.Option label='苹果' value={{name: "苹果", id:'pg'}}/>
          <Select.Option label='菠萝' value={{name: "菠萝", id:'PAIAPPLE'}}/>
          <Select.Option label='香蕉' value={{name: "香蕉", id:'BANANA'}}/>
        </Select>
        <br/>
        <Table thead={thead} zebra={true} tbody={tbody} />

       {/*  <input type="text" onChange={e => this.input(e)}/>
        <table border='1'   cellSpacing='0'>
          <tbody>
            <tr>
              <td>
                {input}
              </td>
            </tr>
          </tbody>
        </table> */}

      </div>
    );
  }
}

export default App;
