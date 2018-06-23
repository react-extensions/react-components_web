import React, { Component } from 'react';
import './App.scss'

import {
Radio,
Checkbox,
Select,
Table,
Notification,
Transition
} from './ui/index'

class App extends Component {
  constructor() {
    super()
    this.state = {
      bool: true,
      list: [],
      radio: '菠萝',
      input: '',
      num: []
    }
    this.toggleBtn = this.toggleBtn.bind(this)
    this.change = this.change.bind(this)
    this.add = this.add.bind(this)
    this.minus = this.minus.bind(this)

    setTimeout(() => {
      this.setState({ list: ['菠萝', '苹果'] })
    }, 3000)
   
  }
  toggleBtn() {
    this.setState(prev => ({
      bool: !prev.bool
    }))

  }
  toggleStyle() {
    this.setState(prev => ({
      style: !prev.style
    }))
  }
  add() {
    this.setState(prev => ({
      num: prev.num.concat(1) 
    }))
  }
  minus() {
    this.setState(prev => {
      const arr = [...prev.num]
      arr.pop()
      return {
        num: arr
      }
    })
  }
  change(v) {
    this.setState({ list: v })
  }
  changeRadio(v) {
    this.setState({ radio: v })
  }
  changeSelect(v) {
    // console.log('父元素', v)
  }
  input(e) {
    this.setState({input: e.target.value})
  }
  render() {
    // Notification({message: 'ssss', type: 'danger'})
    const { bool, list, radio, input, num, style} = this.state
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
        label: '第一列',
        width: 10
      },
      {
        prop: 2,
        label: '第二列',
        width: 1000
      },
      {
        prop: 3,
        label: '第三列',
        width: 1000
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
        <button type='button' onClick={this.toggleBtn}>{bool ? 'ON' : 'OFF'}</button>&nbsp;&nbsp;
        <button type='button' onClick={this.toggleStyle.bind(this)}>{style ? 'Red' : 'Gray'}</button>&nbsp;&nbsp;
        <button type='button' onClick={this.add}>ADD => {num.length}</button>&nbsp;&nbsp;
        <button type='button' onClick={this.minus}>MINUS => {num.length}</button>&nbsp;&nbsp;

        <br />
        <Checkbox.Group checkedList={list} onChange={this.change}>
          <Checkbox label='菠萝' />
          <Checkbox label='苹果' />
          <Checkbox label='香蕉' />
        </Checkbox.Group>
        <br />
        <Transition>
          {
              bool && 
              (<div className='queue' style={style ? {background: 'red'}: null}>
                {
                  num.map((item, i) => {
                    return (
                        <Transition key={i}>
                          <div className='transition-div' ></div>
                        </Transition>
                    )
                  })
                }
              </div>)
          }
        </Transition>
        {/* <Transition>
          { bool && (<div className='queue'></div>) }
        </Transition> */}

        <br />
        <Radio.Group checked={radio} onChange={this.changeRadio.bind(this)}>
          <Radio label='菠萝' />
          <Radio label='苹果' />
          <Radio label='香蕉' />
          <Radio label='DDD' />
        </Radio.Group>
        <br/>
        <Select onChange={this.changeSelect.bind(this)} selectedList={list} multiple search>
          <Select.Option label='苹果' value={{name: "苹果", id:'pg'}}/>
          <Select.Option label='菠萝' value={{name: "菠萝", id:'PAIAPPLE'}}/>
          <Select.Option label='香蕉' value={{name: "香蕉", id:'BANANA'}}/>
        </Select>
        <br/>
        <Table thead={thead} zebra={true} tbody={tbody} />

        

      </div>
    );
  }
}

export default App;
