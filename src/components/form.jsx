import React from 'react';
import Context from './context'



 function UtilForm(Component, outputFormat) {

  return class Form extends React.Component {
    constructor(props) {
      super(props)

      this.depMap = {}

      this.getApi = this.getApi.bind(this)
      this.onFormItemChange = this.onFormItemChange.bind(this)
    }
    /**
     * @function - 用于获取从label组件传过来的接口及参数，然后存储
     * @param {Object} param0 
     */
    getApi({depQueue, subscribeDepChange}) {
      if(!depQueue) return
      const map = this.depMap
      depQueue.forEach(item => {
        !map[item] && (map[item] = [])
        map[item].push(subscribeDepChange)
      })
    }
    /**
     * @function - 当某个表单组件change时， 执行此函数
     */
    onFormItemChange(name, value, key) {
      console.log(name, value)
      if(!this.depMap[name]) return
      this.depMap[name].forEach(item => item(name, value))

      /* --------------- */
      if(outputFormat) {
        key = key || name
        outputFormat(value, key)
      }
    }
    render() {
      return (
        <Context.Provider value={{interfaces: this.getApi, onChange: this.onFormItemChange}}>
          <Component {...this.props}/>
        </Context.Provider>

      )
    }
  }
}


export default UtilForm