function createStore(reducer, intialState) {
      const listeners = []
      let currentState = intialState

      function subscribe(func) {
        listeners.push(func)

        return function cancelSubscribe() {
          listeners.splice(listeners.indexOf(func, 1))
        }
      }

      function dispatch(action) {
        if (action == null || Array.isArray(action) || typeof action !== 'object'||!action.key || !action.value) return

        /*
        * 1. 只能处理 {key:value}, 对于 复杂结构数据, 处理很麻烦
        * 2. 用户可以自己随意增添属性, 导致结构混乱
        */
        intialState[action.key] = action.value
        /* --- */
        /**  redux 的内部处理
        *  1. 通过reducer, 将数据结构的处理, 交个用户, 可以构建复杂的数据结构
        *  2. 每次dispatch 都会根据reducer返回一个全新的state, 不会导致 数据混乱
        *
        */
        // currentState = reducer(currentState, action)

        listeners.forEach(listener => {
          listener()
        })
      }
      function getState() {
        return intialState
      }
      return {
        dispatch,
        subscribe,
        getState
      }
    }