import Store from './redux'

const store = new Store({
  state: {
    msg: '原始数据',
    data: [1, 2, 4, 5]

  },
  mutations: {
    changeMsg(state, v) {
      console.log(state, v, this)
      return Object.assign({}, state, {msg: v})
    },
    changeTwo(state, v) {
      return Object.assign({}, state, v)
    }
  }
})

export default store