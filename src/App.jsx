import React, { Component } from 'react';
import './App.scss'

import store from './redux/store-2'
import Middleware from './context/middleware'
import Context from './context'

class App extends Component {
  constructor() {
    super()
    this.state = {
      todos: store.getState().todos,
    }

    store.subscribe(() => {
      this.setState({
        todos: store.getState().todos,
      })
    })

  }
  addTodo() {
    store.dispatch({type: 'ADD_TODO', text: '回家 9: 00'})
  }
  toggleTodo() {
    store.dispatch({type: 'TOGGLE_TODO', index: 2})
  }
  render() {
    const { todos } = this.state
    
    return (
      <div>
        <h1>todos </h1>
          <ul>
            {
              todos.map((item, i) => {
                return <li key={i} style ={{color: item.completed ? 'green' : 'yellow'}}>{item.text} </li>
              })
            }
          </ul>
      <button type='button' onClick={this.addTodo.bind(this)}>ADD_TODO</button>&nbsp;&nbsp;&nbsp;&nbsp;
      <button type='button' onClick={this.toggleTodo.bind(this)}>TOGGLE_TODO</button>&nbsp;&nbsp;&nbsp;&nbsp;
      <hr/>
      <h1>context</h1>
      <Context.Provider value = {this}>
        <Middleware/>
      </Context.Provider>
    </div>
    )
  }
}

export default App;
