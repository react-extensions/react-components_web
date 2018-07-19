import {
  createStore,
  combineReducers
} from 'redux'

const initialState = {
  todos: [{
    text: 'Eat food',
    completed: true
  }, {
    text: 'Exercise',
    completed: false
  }],
  visibilityFilter: 'SHOW_COMPLETED'
}

const todos = function (state = initialState.todos, action) {
  switch(action.type) {
    case 'ADD_TODO':{
      return state.concat({text: action.text, completed: false})
    }
    case 'TOGGLE_TODO': {
      return state.map((item, i) => {
        if(i === action.index) {
          return {
            text: item.text,
            completed: !item.completed
          }
        }
        return item
      })
    }
    default:
    return state
  }
}

const visibilityFilter = function (state = 'SHOW_ALL', action) {
  if(action.tpye === 'SET_FITER') {
    return action.filter
  }
  return state
}



const reducer =  combineReducers({ visibilityFilter, todos })



export default createStore(reducer)