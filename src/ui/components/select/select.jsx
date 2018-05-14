
import React from 'react'
import PropTypes from 'prop-types'
import {attachEvent, detachEvent, contains, target}  from '../../libs/utils'
import './select.scss'
// import classname from 'classname'
import Icon from '../icon/icon'

/* 
*  Select props
*  multiple   Boolean  是否多选
*  search    Boolean   是否需要搜索框
*  plugin    element   搜索框旁边的按钮
*  className  String   自定义类名,方便修改样式
*  selected   String   label 单选时, 默认选中
*  selectedList  Array [label, label]
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
      selectedList:[],
      // 用于单选选中
      selected: '',
      searchText: ''
    }
    this.toggleDropdown = this.toggleDropdown.bind(this)
    this.closeDropdown = this.closeDropdown.bind(this)
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
  // 从上方已选中栏中直接删除选项
  cancelFromList(e, cancel) {
    // react兼容IE8的 取消事件冒泡, 这样写就行了
    e.stopPropagation()
    const list =  this.state.selectedList.filter(item => (item !== cancel)) 
    this.setState({selectedList: list})
  }
  search(e) {
    this.setState({searchText: e.target.value})
  }
  componentWillMount() {
    const {selected, multiple, selectedList} = this.props
    if(multiple && selectedList) {
      this.setState({selectedList: selectedList})
    } else if(selected) {
      this.setState({selected: selected }) 
    }
  }
  componentWillUnmount() {
    detachEvent(document, 'click', this.closeDropdown)
  }
  // 这里还没性能优化
  /* shouldComponentUpdate(prevP, prevS) {

  } */
  render() {
    const {selected, isCollapsed, selectedList} = this.state
    const {multiple, children,  plugin, search, className, max} = this.props
    const len = selectedList.length
    
    return (
      <div className = {'select ' + (className || '')}> 
        <div className='select-input' onClick={this.toggleDropdown}>
          {/* tags 或者 input */}
          {
            !multiple ? (<span className='select-input__exact'>{selected || '请选择'}</span>) : (
              <div className="select-multiple-wrap base-color " >
                {
                  selectedList.map((item, i) => (
                    <span className='select-multiple-tag pointer' key={item} onClick={e => this.cancelFromList(e, item)}>
                      {item}
                      <i className="iconfont icon-close icon__select-reduce"></i>
                    </span>
                  )) 
                }
                <span className={'select-add-tag-btn ' + (((isCollapsed && len < parseInt(max)) || len === 0)  ? '' : 'd-none')}> + 选择</span>
              </div>
            ) 
          }
        </div>

        {/* Dropdown */}
        <div className={'select-dropdown ' + (isCollapsed ? '' : 'is-active')} ref={el=> this.dropdown = el}>
          {
            search ? (
              <div className="select-search__input-wrap clearfix">
                  <input type="text" className='select-search__input' 
                         placeholder ={'搜索'} 
                         onChange={e => this.search(e)}
                         />
                  {plugin}
              </div>
            ) : null
          }
          <div className="dropdown__track">{children}</div>
        </div>
      </div>
    )
  }
}
/* Option */
class Option extends React.Component{
  parent() {
    return this.context.Select
  }
  handleClick() {
    const parent = this.parent()
    const {multiple, onChange} = parent.props
    const {label} = this.props
    const selected = this.selected 
    if(multiple) {
      if(selected) {
        parent.setState(prev => ({selectedList: prev.selectedList.filter(item => (item !== label))}))
      } else {
        parent.setState(prev => ({selectedList: prev.selectedList.concat([label])}))
      }
    }else {
      parent.setState({ selected: label })
      onChange && onChange(label)
    }
  }
  
  shouldComponentUpdate(nP) {
    const parent = this.parent()
    const {props, state} = parent
    const oldV = (this.selected  || false)
    const newV = this.selected  = props.multiple ?
                                state.selectedList.some(item => (item === nP.label)) :
                                state.selected === nP.label

    const oldH = (this.hide || false)
    const newH = this.hide = (nP.label.indexOf(state.searchText) === -1)

    return (oldV ^ newV) || (oldH ^ newH)
  }
  componentDidUpdate() {
    console.log('更新', this.props.label)
  }
  render() {
    const {label} = this.props
    const {multiple} = this.parent().props
    const selected = this.selected 
    return (
      <div className={"select-option " + ((selected && !multiple) ? 'selected ' : '') + (this.hide ? 'd-none' : '')} 
          onClick={this.handleClick.bind(this)}
      >
        {multiple && <Icon type={selected ? 'check-fill' : 'check'} className='select-icon__checkbox'/>}
        {label}
      </div>
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
          <ul className="select-group">{children}</ul>
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