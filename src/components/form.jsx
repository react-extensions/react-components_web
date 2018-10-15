import React from 'react';
import Context from './context'


 function UtilForm(Component, outputFormat) {

  return class Form extends React.Component {
    constructor(props) {
      super(props)

      this.getApi = this.getApi.bind(this)
      this.onFormItemChange = this.onFormItemChange.bind(this)

      this.formQuery = null
      this.depMap = {}

      this.contextValue = {
        interfaces: this.getApi,  // 用于向父组件发送值
        onChange: this.onFormItemChange,
         //子表单组件获得焦点的时候, 按下 enter, 提交表单
        onSubmit: () => {UtilForm.onSubmit(this.formQuery)}
      }

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
      // console.log(name, value)
      if(!this.depMap[name]) return
      this.depMap[name].forEach(item => item(name, value))

      /* --------------- */
      if(outputFormat) {
        key = key || name
        this.formQuery = outputFormat(value, key)
      }
    }
  
    render() {

      return (
        <Context.Provider value={this.contextValue}>
          <Component {...this.props}/>
        </Context.Provider>
      )
    }
  }
}

UtilForm.onSubmit = () => {}

UtilForm.config = {
  clickEnterToSubmit: true
}

export default UtilForm