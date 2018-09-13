import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './style.less'

import Pattern from '../form-pattern/index'
import { Input, Cell } from '@ui'



/**
 * @prop {array} renderList 用于渲染   [{ label: '', name: '', type: '', col: 2 , defaultValue: '', options: [], disabled: bool, format: ()=>()}]
 * @prop {obj} value 
 * @prop {func} onChange  
 * 
 */
class Form extends Component {
    constructor(props) {
        super(props)
        //this.renderList = [] 用于存储pattern表单的列表
        // this.formVal = {}
        //this.depQueue [] 表单控件依赖表
        this.childPatternQueue = []
        this.getChildPatternApi = this.getChildPatternApi.bind(this)
        this.init(props)

    }
    /**
     * @function hook 发送调用Form组件内部 patternFormItem函数
     *  1. 父组件中接收 发出去的函数, 在准备提交时, 调用进行表单验证, 如果返回false, 则取消提交
     */
    componentDidMount() {
      const emit = this.props.emitFormCheck
      emit && emit(this.patternFormItem.bind(this))
    }
    /**
     * @function patternFormItem 强制form表单控件 进行验证, 由外部触发
     * 
     */
    patternFormItem() {
        const list = this.childPatternQueue
        let result = true
        for (let i = 0, len = list.length; i < len; i++) {
            result = list[i]()
            if (!result) return false
        }
        return result
    }
    /**
     * @function init 初始化
     * 
     * @param {array<renderList>} list 
     */
    init(props) {
        this.renderList = []
        this.depQueue = []
        const formVal = this.formVal = {}
        const list = props.renderList
        let item = null
        if (!list.length) return

        for (let i = 0, len = list.length; i < len; i++) {
            item = list[i]
            this.initRenderList(item)
            formVal[item.name] = item.defaultValue || null
            this.collectDep(item.dependence, item.name)
        }

        if (props.value || props.defaultValue) {
            this.formVal = Object.assign({}, this.formVal, props.value || props.defaultValue)
        }
    }

    /**
     * @function initRenderList 根据item.type 选择不同的表单控件, 进一步封装, 并生成一个表单列表用于渲染
     * 
     * @param {object} item 
     */
    initRenderList(item) {
        const compList = this.renderList
        const type = item.type
        if(typeof type === 'string') {
          switch (type) {
            case 'input':
                compList.push(item.options ? Pattern(Input, item.rules, this.returnRealValue(type, item.filter)): Input)
                break;
            // case 'select':
                // Comp = Pattern(Select,)
                // break;
            default:
              break;
          }
        }
        else {
          const output = item.outputFilter
          compList.push(item.options ? Pattern(type, item.rules, this.returnRealValue(type, item.filter), typeof output === 'function' ? output : null) : type)
        }
    }
    returnRealValue(type, filter) {
        return function (e, ...args) {
          // 1. 优先用自己定义的 数据获取
            if (filter && typeof filter === 'function') return filter(e, ...args)

            switch (type) {
                case 'input':
                    return e.target.value
                default:
                    return e
            }
        }
    }
    /**
     * @function collectDep 收集表单控件之间的互相依赖
     * 
     * @param {*} dep 
     */
    collectDep(dep, selfName) {
        if (!dep) return
        let names = dep.names
        typeof names === 'string' && (names = [names])
        if (!Array.isArray(names)) return
        let name = null
        for (let i = 0, len = names.length; i < len; i++) {
            name = names[i]
            !this.depQueue[name] && (this.depQueue[name] = [])

            this.depQueue[name].push([selfName, dep.handle])
        }
    }
    /**
     * @function hook 动态更新
     * 
     * @param {props} nextP 
     */
    UNSAFE_componentWillReceiveProps(nextP) {
        if (nextP.value !== this.props.value) {
            this.formVal = Object.assign({}, nextP.value)
            this.shouldChildCleanState = +new Date()
            this.forceUpdate()
        }
        // 
        nextP.renderList !== this.props.renderList && this.init(nextP)
    }
  

    /**
     * @function handleChange 接收来自Pattern组件的值, 已经 处理过, 直接接收就可以了
     * 
     * @param {*} item 
     * @param {*} v 
     */
    handleChange(item, value) {
        const key = item.name
        this.formVal[key] = value

        // 根据依赖来控制其他项
        const queue = this.depQueue[key]
        
        queue && queue.forEach(item => {this.formVal[item[0]] = item[1](value, key, this.formVal)})

        // 触发组件更新, 同时发送数据
        this.forceUpdate()
        this.props.onChange(Object.assign({}, this.formVal))
    }
    /**
     * 
     * @param {Component} Comp 
     * @param {*} item 
     */
    renderFormItem(Comp, item) {
        const {
          name,
          label,
          type,
          filter,
          rules,
          disabled,
          needPattern,
          ...props
        } = item

        return <Comp
          {...props}
            shouldCleanState={this.shouldChildCleanState}
            emitChildApi={this.getChildPatternApi}
            onChange={this.handleChange.bind(this, item)}
            disabled={item.disabled ? (typeof item.disabled === 'function' ? item.disabled() : item.disabled) : false}
            value={this.formVal[item.name]}
        />
    }
    /**
     * @function getChildPatternApi 接收form表单控件 发送的 验证 函数, 并存储
     */
    getChildPatternApi(fn) {
        this.childPatternQueue.push(fn)
    }

    render() {
        const renderList = this.props.renderList
        if (!renderList.length) return
        return (
            <div className='form-plugin'>
                {
                    renderList.map((item, i) => (
                        <Cell key={item.name} title={item.label} value={
                            <React.Fragment>
                                {this.renderFormItem(this.renderList[i], item)}
                                {item.extendRender && item.extendRender()}
                            </React.Fragment>
                        } />
                    ))
                }
            </div>
        )
    }
}

Form.defaultProps = {
    onChange: () => { },
    emitSubmitCheck: () => { },
    renderList: []
}
Form.propTypes = {
    renderList: PropTypes.array
}
export default Form