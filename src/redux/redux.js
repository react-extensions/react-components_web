const {createStore} = require('redux')

export default class Store{
  constructor(options){
    
    // 第一次时, 没有state, 需要原始的 state, 之后就不需要了
    const store = createStore((state = options.state, action) => {
      const fn = options.mutations[action.type]
      if(!fn) return state
      return fn.call(store, state, ...action.args)
    })


    this.store = store
    this.subscribe = store.subscribe.bind(store)
    this.getState = store.getState.bind(store)

  }
  commit(fnName, ...args) {
    this.store.dispatch({type: fnName, args: args})
  }
 
}