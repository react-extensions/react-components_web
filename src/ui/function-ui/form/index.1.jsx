import React from 'react';
import PropTypes from 'prop-types'
import './style.css'

import ExtendFunc from './form-pattern'

import { Cell, Input as I } from '../../index'

/* const Input = ExtendFunc(I, {
  
}) */


/**
 * @prop {array} renderList 用于渲染   [{label: '', prop: '', type: '', col: 2 , defaultValue: '', options: [], disabled: bool, format: ()=>()}]
 * @prop {obj} value 
 * @prop {func} onChange  
 * @prop {obj} defaultValue  默认值, 对象格式
 * 
 * 
 */

class Form extends React.PureComponent {
  constructor(props) {
    super(props)

    this.formVal = {}

    // 表单控件依赖列表
    this.depQueue = []

    this.init()
    this.initDep()


    this.handleInput = this.handleInput.bind(this)

  }
  init() {
    const formVal = this.formVal
      , props = this.props
      , list = props.renderList

    let i = list.length
    let item = null
    let dep = null
    let type = null

    while (i--) {
      item = list[i]
      type = item.type

      

      formVal[item.prop] = item.defaultValue || ''

      dep = item.dependence

      //  收集 归类 依赖项
      if (!dep) continue

      const prop = dep.prop
      
      if (typeof prop === 'string') {

        !this.depQueue[prop] && (this.depQueue[prop] = [])

        this.depQueue[prop].push([item.prop, dep.handle])

      } else {

        for (let i = 0, len = prop.length; i < len; i++) {
          !this.depQueue[prop[i]] && (this.depQueue[prop[i]] = [])

          this.depQueue[prop[i]].push([item.prop, dep.handle])
        }

      }


    }

    if (props.value || props.defaultValue) {
      this.formVal = Object.assign({}, this.formVal, props.value || props.defaultValue)
    }
  }
  initDep() {
    const formVal = this.formVal
      , props = this.props
      , list = props.renderList

    let item = null
    let dep = null
    let prop = null

    for (let i = 0, len = list.length; i < len; i++) {
      item = list[i]
      dep = item.dependence
      if (!dep || !dep.shouldInit) continue
      prop = dep.prop
      let fistProp = typeof prop === 'string' ? prop : prop[0]
      formVal[item.prop] = dep.handle(formVal[fistProp], fistProp, formVal)

    }
  }
  UNSAFE_componentWillReceiveProps(nextP) {

    if (nextP.value !== this.props.value) {
      this.formVal = Object.assign({}, nextP.value)
      this.forceUpdate()
    }
  }
  handleInput(item, v) {
    this.proxy(item, v.target.value)
  }

  // 处理表单值的修改
  proxy(item, v) {
    const key = item.prop

    v = item.filter ? item.filter(v) : v

    this.formVal[key] = v

    // 根据依赖来控制其他项
    const queue = this.depQueue[key]
    queue && queue.map(item => {
      this.formVal[item[0]] = item[1](v, key, this.formVal)
    })

    this.emit()
  }
  // 触发组件更新, 同时发送数据
  emit() {
    this.forceUpdate()
    this.props.onChange(Object.assign({}, this.formVal))
  }
  render() {
    const FORM = this.formVal
      , props = this.props

    return (
      <div className='form-plugin'>
        {
          props.renderList.map((item, i) => (
            <Cell
              className={item.col === 2 ? 'col-2' : ''}
              title={item.title || item.label}
              key={item.prop}
              titleWidth={props.titleWidth}
              titleAlign={props.titleAlign || 'right'}
              value={
                <React.Fragment>
                  {
                    typeof item.type === 'function'
                      ? item.type()
                      : item.type === 'input'
                        ? (<Input type='text'
                          placeholder={item.placeholder || ''}
                          value={FORM[item.prop]}
                          disabled={typeof item.disabled === 'function' ? item.disabled() : item.disabled}
                          onChange={this.handleInput.bind(this, item)}
                        />)
                        : null
                  }
                  {item.extendRender && item.extendRender()}
                </React.Fragment>
              } />
          ))
        }

      </div>
    );
  }
}

Form.defaultProps = {
  defaultValue: null,
  onChange: () => { },
  renderList: []
}

Form.propTypes = {
  defaultValue: PropTypes.object,
  renderList: PropTypes.array
}

export default Form