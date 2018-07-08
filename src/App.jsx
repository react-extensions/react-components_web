import React, { Component } from 'react';
import './App.scss'

import {
Radio,
Checkbox,
Select,
Table,
Notification,
Tooltip,
Transition
} from './ui/index'

import Test from './Test'

class App extends Component {
  constructor() {
    super()
    this.state = {
      bool: false,
      list: [],
      radio: '菠萝',
      input: '',
      num: []
    }
    this.toggleBtn = this.toggleBtn.bind(this)
    this.change = this.change.bind(this)
    this.add = this.add.bind(this)
    this.minus = this.minus.bind(this)

   /*  setTimeout(() => {
      this.setState({ list: ['菠萝', '苹果'] })
    }, 3000) */
   
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
    const scrollY = 400
    // const scrollY = null
    const thead = [
      
      {
        type: 'checkbox',
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
        ),
      },
      {
        prop: 1,
        label: '第一列',
        
      },
      {
        prop: 2,
        label: '第二列',
      },
      {
        prop: 3,
        label: '第三列',
        // width: 500
      },
      {
        prop: 4,
        label: '第四列',
        // width: 500
      }
      
    ]
    const tbody = [
     {1: '张撒飞洒发的发射点发射点',2: '李按时发士大夫撒地方所发生的',3: '吴时发生飞洒登封市阿凡达撒', 4: '斯蒂芬付付付付付付付付付付付付付付付付付付付付付'},
     {1: '张撒飞洒发的发射点发射点',2: '李按时发士大夫撒地方所发生的',3: '吴时发生飞洒登封市阿凡达撒', 4: '斯蒂芬付付付付付付付付付付付付付付付付付付付付付'},
     {1: '张撒飞洒发的发射点发射点',2: '李按时发士大夫撒地方所发生的',3: '吴时发生飞洒登封市阿凡达撒', 4: '斯蒂芬付付付付付付付付付付付付付付付付付付付付付'},
     {1: '张撒飞洒发的发射点发射点',2: '李按时发士大夫撒地方所发生的',3: '吴时发生飞洒登封市阿凡达撒', 4: '斯蒂芬付付付付付付付付付付付付付付付付付付付付付'},
     {1: '张撒飞洒发的发射点发射点',2: '李按时发士大夫撒地方所发生的',3: '吴时发生飞洒登封市阿凡达撒', 4: '斯蒂芬付付付付付付付付付付付付付付付付付付付付付'},
     {1: '张撒飞洒发的发射点发射点',2: '李按时发士大夫撒地方所发生的',3: '吴时发生飞洒登封市阿凡达撒', 4: '斯蒂芬付付付付付付付付付付付付付付付付付付付付付'},
     {1: '张撒飞洒发的发射点发射点',2: '李按时发士大夫撒地方所发生的',3: '吴时发生飞洒登封市阿凡达撒', 4: '斯蒂芬付付付付付付付付付付付付付付付付付付付付付'},
     {1: '张撒飞洒发的发射点发射点',2: '李按时发士大夫撒地方所发生的',3: '吴时发生飞洒登封市阿凡达撒', 4: '斯蒂芬付付付付付付付付付付付付付付付付付付付付付'},
     {1: '张撒飞洒发的发射点发射点',2: '李按时发士大夫撒地方所发生的',3: '吴时发生飞洒登封市阿凡达撒', 4: '斯蒂芬付付付付付付付付付付付付付付付付付付付付付'},
     {1: '张撒飞洒发的发射点发射点',2: '李按时发士大夫撒地方所发生的',3: '吴时发生飞洒登封市阿凡达撒', 4: '斯蒂芬付付付付付付付付付付付付付付付付付付付付付'},
     {1: '张撒飞洒发的发射点发射点',2: '李按时发士大夫撒地方所发生的',3: '吴时发生飞洒登封市阿凡达撒', 4: '斯蒂芬付付付付付付付付付付付付付付付付付付付付付'},
     {1: '张撒飞洒发的发射点发射点',2: '李按时发士大夫撒地方所发生的',3: '吴时发生飞洒登封市阿凡达撒', 4: '斯蒂芬付付付付付付付付付付付付付付付付付付付付付'},
     {1: '张撒飞洒发的发射点发射点',2: '李按时发士大夫撒地方所发生的',3: '吴时发生飞洒登封市阿凡达撒', 4: '斯蒂芬付付付付付付付付付付付付付付付付付付付付付'},
     {1: '张撒飞洒发的发射点发射点',2: '李按时发士大夫撒地方所发生的',3: '吴时发生飞洒登封市阿凡达撒', 4: '斯蒂芬付付付付付付付付付付付付付付付付付付付付付'},
     {1: '张撒飞洒发的发射点发射点',2: '李按时发士大夫撒地方所发生的',3: '吴时发生飞洒登封市阿凡达撒', 4: '斯蒂芬付付付付付付付付付付付付付付付付付付付付付'},
     {1: '张撒飞洒发的发射点发射点',2: '李按时发士大夫撒地方所发生的',3: '吴时发生飞洒登封市阿凡达撒', 4: '斯蒂芬付付付付付付付付付付付付付付付付付付付付付'},
     {1: '张撒飞洒发的发射点发射点',2: '李按时发士大夫撒地方所发生的',3: '吴时发生飞洒登封市阿凡达撒', 4: '斯蒂芬付付付付付付付付付付付付付付付付付付付付付'},
     {1: '张撒飞洒发的发射点发射点',2: '李按时发士大夫撒地方所发生的',3: '吴时发生飞洒登封市阿凡达撒', 4: '斯蒂芬付付付付付付付付付付付付付付付付付付付付付'},
     {1: '张撒飞洒发的发射点发射点',2: '李按时发士大夫撒地方所发生的',3: '吴时发生飞洒登封市阿凡达撒', 4: '斯蒂芬付付付付付付付付付付付付付付付付付付付付付'},
     {1: '张撒飞洒发的发射点发射点',2: '李按时发士大夫撒地方所发生的',3: '吴时发生飞洒登封市阿凡达撒', 4: '斯蒂芬付付付付付付付付付付付付付付付付付付付付付'},
     {1: '张撒飞洒发的发射点发射点',2: '李按时发士大夫撒地方所发生的',3: '吴时发生飞洒登封市阿凡达撒', 4: '斯蒂芬付付付付付付付付付付付付付付付付付付付付付'},
     {1: '张撒飞洒发的发射点发射点',2: '李按时发士大夫撒地方所发生的',3: '吴时发生飞洒登封市阿凡达撒', 4: '斯蒂芬付付付付付付付付付付付付付付付付付付付付付'},
     {1: '张撒飞洒发的发射点发射点',2: '李按时发士大夫撒地方所发生的',3: '吴时发生飞洒登封市阿凡达撒', 4: '斯蒂芬付付付付付付付付付付付付付付付付付付付付付'},
     {1: '张撒飞洒发的发射点发射点',2: '李按时发士大夫撒地方所发生的',3: '吴时发生飞洒登封市阿凡达撒', 4: '斯蒂芬付付付付付付付付付付付付付付付付付付付付付'},
     {1: '张撒飞洒发的发射点发射点',2: '李按时发士大夫撒地方所发生的',3: '吴时发生飞洒登封市阿凡达撒', 4: '斯蒂芬付付付付付付付付付付付付付付付付付付付付付'},
     
    ]
    return (
      <div className='container'>
        <Tooltip label='BUTTON'>
          <button type='button' onClick={this.toggleBtn}>{bool ? 'ON' : 'OFF'}</button>
        </Tooltip>&nbsp;&nbsp;
        <Tooltip label='COLOR'>
          <button type='button' onClick={this.toggleStyle.bind(this)}>{style ? 'Red' : 'Gray'}</button>
        </Tooltip>&nbsp;&nbsp;
        <Tooltip label='COMPUTE'>
          <button type='button' onClick={this.add}>ADD => {num.length}</button>
        </Tooltip>&nbsp;&nbsp;
        <button type='button' onClick={this.minus}>MINUS => {num.length}</button>&nbsp;&nbsp;

        <Transition name='transition'>
          {
              bool && <div className='queue' ref={el => this.transitionElem = el}>
              1 <br />
              2 <br />
              3 <br />
      
            </div>
          }
        </Transition>

        <br/>
        <Table columns={thead} zebra={true} rows={tbody} scrollY={scrollY} />
        

      </div>
    );
  }
}

export default App;
