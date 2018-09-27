import React from 'react'
import PropTypes from 'prop-types'
import './style.less'
import pattern from './pattern'
import Form from './form'
import Item from './form-item'

class FunctionForm extends React.PureComponent {
  constructor(props) {
    super(props)
    //this.renderList = [] 用于存储pattern表单的列表
    // this.value = {}
    //this.depQueue [] 表单控件依赖表
    this.init(props)

  }

  /**
   * @function init 初始化
   *
   * @param {array<renderList>} list
   */
  init(props) {
    this.renderList = []
    this.depQueue = []

    this.value = {}

    const list = props.renderList
    let item = null
    if (!list.length) return

    for (let i = 0, len = list.length; i < len; i++) {
      item = Object.assign({}, list[i])
      
      // 1. 格式化唯一id
      item._name = Array.isArray(item.name) ? item.name.join(',') : item.name

      const filter = item.formatOutput
      const defaultVal = item.defaultValue

      this.value = Object.assign({}, this.value , filter ? filter(defaultVal) : {[item._name]:defaultVal})

      // 2. 生成 Comp
      let type = item.type

      /*if(typeof type === 'string') {
        console.log(FunctionForm.FormMap[type])
      }*/

      type = typeof type === 'string' ? (FunctionForm.FormMap[type] || null) : type

      const rules = item.rules

      type = rules ? pattern(type, rules) : type
      // type = pattern(type, rules)
      item.type = type
      // 3. 收集依赖项  
      this.collectDep(item.dependence)


      this.renderList.push(item)

    }
    // console.log(this.value)
    this.value = Object.assign({}, this.value, props.value)
    this.props.onChange && this.props.onChange(this.value)

  }


  /**
   * @function collectDep 收集表单控件之间的互相依赖
   *
   * @param {*} dep
   */
  collectDep(dep) {
    if (!dep) return
    
    let names = dep.names

    typeof names === 'string' && (names = [names])

    if (!Array.isArray(names)) return
    let name = null
    for (let i = 0, len = names.length; i < len; i++) {
      name = names[i]
      !this.depQueue[name] && (this.depQueue[name] = [])

      this.depQueue[name].push(dep.handle)
    }
  }
  /**
   * @function hook 动态更新
   *
   * @param {props} nextP
   */
  UNSAFE_componentWillReceiveProps(nextP) {
    nextP.renderList !== this.props.renderList && this.init(nextP)
      
    if (nextP.value !== this.props.value) {
      this.value = nextP.value
      this.forceUpdate()
    }
    // 
  }


  /**
   * @function handleChange 接收来自Pattern组件的值, 已经 处理过, 直接接收就可以了
   *
   * @param {*} item
   * @param {*} v
   */
  handleChange(item, value) {

    const key = item._name
    
    // this.value[key] = value

    // 根据依赖来控制其他项
    const queue = this.depQueue[key]

    queue && queue.forEach(handle => {

      this.value = Object.assign({}, this.value, handle(value, key))
     })

    // 触发组件更新, 同时发送数据

    const filter = item.formatOutput

    this.props.onChange(this.value =  Object.assign({}, this.value , filter ? filter(value) : {[key]:value}) )


    this.forceUpdate()

  }


  /**
   *
   * @param {Component} Comp
   * @param {*} item
   */
  renderFormItem(Comp, item) {
    if(!Comp) return null
    const props = item.props ||{}
    const formatInput = item.formatInput

    const Child =  <Comp
                {...props}
                onChange={this.handleChange.bind(this, item)}
                value={formatInput ? formatInput(this.value) : this.value[item._name]}
              />
    
    return (
      <React.Fragment>
        { item.rules ? (<Item>{Child}</Item>) : Child }
        {item.extendRender && item.extendRender(item)}
      </React.Fragment>
    )
  }


  render() {
    const renderList = this.renderList
    if (!renderList.length) return null
    return (
      <div className={'function-form-plugin' + (this.props.className ? (' ' + this.props.className) : '')}>
        <Form>
        {
          renderList.map(item => (
            <React.Fragment key={item._name}>
              {this.props.render(item.label, this.renderFormItem(item.type, item), item._name, item)}
            </React.Fragment>
          ))
        }
        </Form>
        
      </div>
    )
  }
}

FunctionForm.defaultProps = {
  onChange: () => { },
  renderList: []
}
FunctionForm.propTypes = {
  renderList: PropTypes.array
}

FunctionForm.FormMap = {
  
}

FunctionForm.doPattern = Form.doPattern
FunctionForm.clearState = Form.clearState


export default FunctionForm