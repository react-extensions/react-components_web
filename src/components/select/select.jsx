
import React from 'react'
import PropTypes from 'prop-types'
import classname from 'classname'
import Checkbox from '../checkbox/checkbox'
import {attachEvent, detachEvent, contains, target}  from '../../libs/utils'
import './select.scss'

/* 
*  Select props
*  multiple   Boolean  是否多选
*  search    Boolean   是否需要搜索框
*  addBtn    element   搜索框旁边的按钮
*  className  String   自定义类名,方便修改样式
*  selected   Object   {label: '', value: ''}单选时, 默认选中
*  onChange  Function  当选择器为单选时, 向父组件发送选中数据
*   ----------------------------
*
*  Option props
*  label   String  用于显示
*  value   Any     每个选项代表的数据
*/
class Select extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      isCollapsed: true,
      // 用于多选选中
      selectedQueue:[],
      // 用于单选选中
      selected: { label: '' },
      mulRenderList: []
    }
    this.toggleDropdown = this.toggleDropdown.bind(this)
    this.closeDropdown = this.closeDropdown.bind(this)
    this.handleMultiple = this.handleMultiple.bind(this)
  }
  /* childcontext */
  getChildContext() {
    return {
      Select: this
    }
  }
  toggleDropdown(e) {
    if(!this.props.disabled) {
      const isOff = this.state.isCollapsed
      if(isOff) {
        attachEvent(document, 'click', this.closeDropdown)
      }
      this.setState({isCollapsed: !isOff})

    }
  }
  closeDropdown(e) {
    // 这个函数未经过react处理
    e = e || window.event
    if(!contains(this.dropdown, target(e))){
      this.setState({isCollapsed: true})
      detachEvent(document, 'click', this.closeDropdown)
    }
  }

  // 从下拉菜单中添加或删除选项
  handleMultiple(v) {
     this.setState({
      selectedQueue: v
    })
  }
  // 从上方已选中栏中直接删除选项
  cancelFromList(e, cancel) {
    // react兼容IE8的 取消事件冒泡, 这样写就行了
    e.stopPropagation()
    const list =  this.state.selectedQueue.filter(item => {
      return item.value !== cancel.value
    }) 
    this.setState({
      selectedQueue: list,
      mulRenderList: list
    })
  }
  componentWillMount() {
    const s = this.props.selected
    if(s) { this.setState({selected: this.props.selected }) }
  }
  componentWillUnmount() {
    detachEvent(document, 'click', this.closeDropdown)
  }
  // 这里还没性能优化
  /* shouldComponentUpdate(prevP, prevS) {

  } */
  render() {
    const {selected, isCollapsed, selectedQueue, mulRenderList } = this.state
    const {multiple, children,  addBtn, search, className} = this.props
    let max = parseInt(this.props.max)
    const len = selectedQueue.length
    
    return (
      <div className = {'select ' + (className || '')}> 
        <div className='select-input' onClick={this.toggleDropdown}>
          {/* tags 或者 input */}
          {
            !multiple ? (<input type='text'  readOnly={true}  className= {'select-input__exact'} placeholder={'请选择'} value={selected.label} />) : (
              <div className="select-multiple-wrap" >
                {
                  selectedQueue.map((item, i) => (
                    <span className='select-multiple-tag' key={item.value || i} onClick={e => this.cancelFromList(e, item)}>
                      {item.label || item}
                      <i className="iconfont icon-close icon__select-reduce"></i>
                    </span>
                  )) 
                }
                {
                  (isCollapsed || len === 0) && len < max ? (<span className= 'no-wrap base-color'> + 选择</span>) : null
                }
              </div>
            ) 
          }
        </div>

        {/* Dropdown */}
        <div className={'select-dropdown ' + (isCollapsed ? '' : 'is-active')} ref={el=> this.dropdown = el}>
          {
            search ? (
              <div className="select-search__input-wrap clearfix">
                  <input type="text" className='select-search__input' placeholder ={'搜索'}/>
                  {addBtn}
              </div>
            ) : null
          }
          {
            !multiple ? children : (
              <Checkbox.Group onChange={this.handleMultiple} checkedList ={mulRenderList} >
                {
                  children.map((item, i) => {
                    const {value, label} = item.props
                    return (
                      <Checkbox key={value || i} label = {label} value={value} __max = {max}>{item}</Checkbox>
                    )
                  })
                }
              </Checkbox.Group>
            ) 
          }
        </div>

      </div>
    )
  }
}
/* Option */
class Option extends React.Component{
  
  handleClick(e, v) {
    e.stopPropagation()
    const parent = this.parent()
    const {multiple, onChange} = parent.props
    if(!multiple) {
      parent.setState({
        selected: v
      })
      if(onChange) {
        onChange(v)
      }
    }
  }
  parent() {
    return this.context.Select
  }
  shouldComponentUpdate() {
    // 多选的下拉菜单, 下拉选项不用更新,全靠多选组件完成所有工作
    const parent = this.parent()
    const {multiple} = parent.props
    if(multiple) return true
    //------------------
    const s = this.selected 
    const b = this.selected = parent.state.selected.value === this.props.value
    // 没改动的就不用更新了
    return (s && !b )|| (b && !s)

  }
  render() {
    const {label, value} = this.props
    return (
      <div className={classname("select-option", {'selected': this.selected})} 
          onClick={e => this.handleClick(e, {value, label})} >{label}</div>
    )
  }
}

/* OptionGroup */
class OptionGroup extends React.Component{
 
  handleClick(e, v) {
    // e.stopPropagation()
    this.parent().setState({
      selected: v
    })
  }
  parent() {
    return this.context.Select
  }
  render() {
    const {label, value, children} = this.props
    return (
      <ul className="select-group__wrap" onClick={e => this.handleClick(e, {value, label})} >
        <li className="select-group__title">
          {label}
        </li>
        <li>
          <ul className="select-group">
            {children}
          </ul>
        </li>
      </ul>
    )
  }
}

Select.defaultProps = {
  max: 10
}
Select.childContextTypes =
Option.contextTypes = 
OptionGroup.contextTypes = {
  Select: PropTypes.any
}

Select.Option = Option
Select.OptionGroup = OptionGroup

export default Select