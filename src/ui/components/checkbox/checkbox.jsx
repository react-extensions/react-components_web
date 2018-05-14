import React, { Component } from 'react';
import './checkbox.scss'
import Icon from '../icon/icon'
import PropTypes from 'prop-types'

class Checkbox extends Component {
  constructor(props) {
    super(props)
    this.state = {
      checked: false
    }
    this.initial = this.initial.bind(this)
  }
  toggleCheck(e) {
    const parent = this.parent()
    let bool = e.target.checked
    if(!!parent) {
      let list = parent.listCache
      const {label} = this.props
      if(bool) {
        list = list.concat([label])
      } else {
        list = list.filter(item => item !==  label)
      }
      parent.listCache = list
      const parentPropsFn = parent.props.onChange
      !!parentPropsFn && parentPropsFn(list)
    } else {
      const {onChange} = this.props
      !!onChange && onChange(bool)
    }
    // 更新自己的样式, 状态
    this.setState({checked: bool})
  }
  // 获取父组件
  parent() {
    return this.context.checkGroup
  }
  initial(v) {
    let bool = false
    const parent = this.parent()
    if(parent) {
      const list = parent.listCache
      if(list && Array.isArray(list)) {
        const {label} = this.props
        for(let i = list.length - 1; i >= 0; i--) {
          if(label === list[i]) {
            bool = true
            break
          }
        }
      }
    }
    else {
      bool = !!v
    }
    this.setState({checked: bool})
  }
  // 初始化, 默认值
  componentWillMount() {
    this.initial(this.props.checked)
  }
  // props更新值, 默认值
  componentWillReceiveProps(nextProps){
    this.initial(nextProps.checked)
  }
  shouldComponentUpdate(nP, nS) {
    return nP.checked !== this.props.checked || nS.checked !== this.state.checked
  }
  /* componentDidUpdate() {
    console.log('更新了' , this.props.label)
  } */
  render() {
    const {label, className, children} = this.props
    const {checked} = this.state
    return (
      <label className={'checkbox ' + (className || '')}>
        <input type='checkbox'
        className='checkbox__exact'
        onChange={e => this.toggleCheck(e)}
        checked = {checked}
        />
        <Icon type={checked ? 'check-fill' : 'check'} />
        { children ? children : (<span className='checkbox-label'>{label}</span>)}
      </label>
    )
  }
}

class Group extends Component {

  getChildContext() {
    return {
      checkGroup: this
    }
  }
  shouldComponentUpdate(nP) {
    let bool = nP.checkedList !== this.props.checkedList
    if(bool) {
      this.listCache = nP.checkedList || []
    }
    return bool
  }
  componentWillMount() {
    this.listCache = this.props.checkedList || []
  }
/*   componentDidUpdate() {
    console.log('更新了checkbox group')
  } */
  render() {
    const {className, children} = this.props
    return (
      <div className={"checkbox-group " + (className || '')}>
        { children }
      </div>
    )
  }
}


/* 
* Group props 的 checked 为 checkbox label 组成的数组
*/


/* Checkbox  props 类型检查 */
Checkbox.propTypes = {
  label: PropTypes.string,  // label
  checked: PropTypes.bool,  //初始默认选中
  className: PropTypes.string //自定义类名
}
/* Group props 类型检查 */
Group.propTypes = {
  checked: PropTypes.array,  //初始默认选中
  className: PropTypes.string //自定义类名
}


/* context 类型检查 */
Group.childContextTypes = 
Checkbox.contextTypes = {
  checkGroup: PropTypes.any
}

Checkbox.Group = Group
export default Checkbox
