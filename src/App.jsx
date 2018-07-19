import React, { Component } from 'react';
import './App.scss'

import store from './redux/store-2'


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
        <h2>
          todos <br/>
          <ul>
            {
              todos.map((item, i) => {
                return <li key={i} style ={{color: item.completed ? 'green' : 'yellow'}}>{item.text} </li>
              })
            }
          </ul>
        
      </h2>
      
      <button type='button' onClick={this.addTodo.bind(this)}>ADD_TODO</button>&nbsp;&nbsp;&nbsp;&nbsp;
      <button type='button' onClick={this.toggleTodo.bind(this)}>TOGGLE_TODO</button>&nbsp;&nbsp;&nbsp;&nbsp;
  
  
    </div>
    )
  }
}

export default App;
