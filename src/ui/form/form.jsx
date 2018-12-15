import React from 'react';
import Context from './context'

/**
 * @prop {function} output
 * @prop {function} input
 * @prop {function} onChange
 * @prop {function} onSubmit
 * */
let formQueue = []

class Form extends React.PureComponent {
  constructor(props) {
    super(props)
    this.getApi = this.getApi.bind(this)
    this.onFormItemChange = this.onFormItemChange.bind(this)

    this.formQuery = {}
    this.depMap = {}
    this.validatorQueue = []

    this.contextValue = {
      interfaces: this.getApi,  // 用于向父组件发送值
      onChange: this.onFormItemChange,
      //子表单组件获得焦点的时候, 按下 enter, 提交表单
      onSubmit: () => {
        this.props.onSubmit(this.formQuery)
      },
    }

    if(props.id) {

      if(formQueue.some(item=> item.id === props.id)) {
        throw Error('已存在id为'+props.id+'的表单组件')
      } else {
        formQueue.push({
          id: props.id,
          validate: this.validate.bind(this)
        })
      }
    }

  }
  componentWillUnmount() {
    for(let i=0, len = formQueue.length; i<len;i++) {
      if(formQueue[i].id===this.props.id) {
        formQueue.splice(i,1)
        break
      }
    }
    // formQueue = formQueue.filter(item=> item.id !== this.props.id)

  }
  // UNSAFE_componentWillReceiveProps(nextP) {
  //   if(nextP.value !== this.props.value) {
  //
  //   }
  // }
  validate(callback) {
    if(this.validatorQueue.every(item=>item())){
      callback(this.formQuery)
    }
  }
  /**
   * @function - 用于获取从label组件传过来的接口及参数，然后存储
   * @param {Object} param0
   */
  getApi({depQueue, subscribeDepChange, validator, }) {
    if (depQueue) {
      const map = this.depMap
      depQueue.forEach(item => {
        !map[item] && (map[item] = [])
        map[item].push(subscribeDepChange)
      })
    }

    if(validator) {
      this.validatorQueue.push(validator)
    }
  }

  /**
   * @function - 当某个表单组件change时， 执行此函数
   */
  onFormItemChange(name, valueQueue, needEmit = true ) {

    if (this.depMap[name]) {
      this.depMap[name].forEach(item => item(name, valueQueue))
    }
    /* --------------- */
    if (this.props.output) {
      this.formQuery = this.props.output(this.formQuery, name, ...valueQueue)
    } else {
      this.formQuery[name] = valueQueue[0]
    }

    needEmit && this.props.onChange(this.format(this.formQuery), name, ...valueQueue)
  }
  format(query) {
    const obj = {}
    let value = null
    for(let key in query) {
      value = query[key]
      if(!value && value!==0){
        continue
      } else if(Object.prototype.toString.call(value) === '[object Array]' && value.length===0) {
        continue
      } else if(typeof value === 'object'&&Object.keys(value).length===0) {
        continue
      }
      obj[key] = value
    }
    return obj
  }

  render() {
    return (
      <Context.Provider value={this.contextValue}>
        {this.props.children}
      </Context.Provider>
    )
  }
}

Form.submit = function(id, callback) {
  if(!id || (typeof id !== 'string' && typeof id !== 'number')  ) {
    throw Error('必须传入id，以提交指定form')
  }
  let item = null
  let got = false
  for(let i =0, len = formQueue.length; i<len;i++) {
    item = formQueue[i]
    if(item.id === id) {
      item.validate(callback)
      got = true
      break
    }
  }
  if(!got) {
    throw Error('未找到id为'+id+'的表单组件')
  }
}



Form.defaultProps = {
  onSubmit: () => {},
  onChange: () => {}
}

export default Form