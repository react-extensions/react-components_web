import React, { Component } from 'react';
import './App.scss'

import store from './redux/store'
import storeS from './redux/store-2'


class App extends Component {
  constructor() {
    super()
    this.state = {
      msg: store.getState().msg,
      data: JSON.stringify(store.getState().data)
    }

    store.subscribe(() => {
      this.setState({
        msg: store.getState().msg,
        data: JSON.stringify(store.getState().data)
      })
    })

    storeS.subscribe(() => {
      this.setState({
        msg: storeS.getState().msg,
        data: JSON.stringify(storeS.getState().data)
      })
    })


  }
  commitOne(v) {
    store.commit('changeMsg', '这是信息')
  }
  commitTwo() {
    store.commit('changeTwo', {
      msg: '双重修改信息',
      data: ['a', 'b', 'c', 'd']
    })

  }
  render() {
    const { msg, data } = this.state
    return (
      <div>
        <h2>
          store <br/>
          {msg}&nbsp;&nbsp;&nbsp;&nbsp;
        {data}&nbsp;&nbsp;&nbsp;&nbsp;
      </h2>
      <h2>
        store 22 <br/>
        {msg2}&nbsp;&nbsp;&nbsp;&nbsp;
        {data}&nbsp;&nbsp;&nbsp;&nbsp;
      </h2>
        <button type='button' onClick={this.commitOne.bind(this, 1)}>commit</button>&nbsp;&nbsp;&nbsp;&nbsp;
      <button type='button' onClick={this.commitTwo.bind(this, 1)}>commit two</button>&nbsp;&nbsp;&nbsp;&nbsp;
  
  
    </div>
    )
  }
}

export default App;
