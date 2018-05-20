const React = require('react')
const {PropTypes} = React
require('./select.scss')
const { attachEvent, detachEvent, contains, target } = require('../../libs/utils')

/** 
*  @Component Select 
*  @param multiple   Boolean    是否多选
*  @param search     <Boolean>  是否显示搜索框
*  @param plugin     element    搜索框旁边的按钮
*  @param onChange   Function   当选择器为单选时, 向父组件发送选中数据
*  @param className  String     自定义类名,方便修改样式
*  @param selected   String     单选时, 默认选中, 值应该为 要选中option的label值
*  @param placeholder<String>   单选时, 选择框的标题
*  @param disabled   <Boolean>  禁用选择框
*  #----------------------------
*  @Component Option props
*  @param label   String  用于显示
*  @param value   Any     每个选项代表的数据
*/
class Select extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isCollapsed: true, // 是否折叠下拉框
      _selectedList: [],  // 用于多选选中
      _selected: null,      // 用于单选选中
    }
    this.toggleDropdown = this.toggleDropdown.bind(this)
    this.closeDropdown = this.closeDropdown.bind(this)
    this.initial = this.initial.bind(this)
  }
  /* childcontext */
  getChildContext() {
    return { Select: this }
  }
  toggleDropdown() {
    if (!this.props.disabled) {
      this.setState((prev) => {
        const isOff = prev.isCollapsed
        if (isOff) {
          attachEvent(document, 'click', this.closeDropdown)
        } else {
          detachEvent(document, 'click', this.closeDropdown)
        }
        return { isCollapsed: !isOff }
      })
    }
  }
  closeDropdown(e) {
    e = e || window.event
    if (!contains(this.dropdown, target(e))) {
      this.setState({ isCollapsed: true })
      detachEvent(document, 'click', this.closeDropdown)
    }
  }

  // 从上方已选中栏中直接删除选项
  cancelFromList(e, cancel) {
    e.stopPropagation()
    const list = this.state._selectedList.filter(item => (item !== cancel))
    this.setState({ _selectedList: list })
    this.shouldSend = true
  }
  search(e) {
    this.searching = true
    this.setState({ searchText: e.target.value })
  }
  cancelSearch(e) {
    this.searching = !!e.target.value
  }
  initial() {

  }
  componentWillMount() {
    this.selectedValueList = []  //多选时, 选中的值的集合
    // 初始化
    const { selected, selectedList, multiple } = this.props
    if (multiple && selectedList && selectedList.length > 0) {  // 多选下拉框
      this.setState({ _selectedList: selectedList })
    } else if (selected) {  // 单选
      this.setState({ _selected:selected })
    }
  }

  // willReceiveProps 和 shouldUpdate  待优化 
  componentWillReceiveProps(nP, nS) {
    const {_selected, _selectedList} = this.state
    const {selected, selectedList, multiple} = this.props
    
    if (multiple && nP.selectedList  && _selectedList !== nP.selectedList && selectedList !== nP.selectedList) {
      this.setState({_selectedList: nP.selectedList})
      this.shouldUpdate = true
    }
    if (nP.selected && _selected !== nP.selected && selected !== nP.selected) {
      this.setState({ _selected: nP.selected })
      this.shouldUpdate = true
    }
  }
  shouldComponentUpdate(nP, nS) {
    console.log('父组件')
    
    const { disabled } = this.props
    const { _selected, _selectedList, isCollapsed } = this.state
    return disabled !== nP.disabled 
      || nS._selected !== _selected
      || nS._selectedList !== _selectedList
      || isCollapsed !== nS.isCollapsed
  }
  componentDidUpdate(x, prevS) {
    const { multiple, onChange } = this.props
    if (multiple && this.shouldSend) {
      onChange(this.selectedValueList)
    }
    this.shouldUpdate = false
    console.log('已经更新')
  }
  componentWillUnmount() {
    detachEvent(document, 'click', this.closeDropdown)
  }
  render() {
    const { _selected, isCollapsed, _selectedList } = this.state
    const { multiple, children, plugin, className, disabled, search, placeholder } = this.props
    let max = parseInt(this.props.max)
    const len = _selectedList.length

    return (
      <div className={'select ' + (disabled ? ' disabled' : '') + (className || '')}>
        <div className='select-input' onClick={this.toggleDropdown}>
          {/* tags 或者 input */}
          {
            !multiple ? (<div className={'select-input__exact'} > {_selected || (placeholder || '请选择')}</div>) : (
              <div className="select-multiple-wrap" >
                {
                  _selectedList.map((item, i) => (
                    <span className='select-multiple-tag' key={item} onClick={e => this.cancelFromList(e, item)}>
                      {item}
                      <i className="iconfont icon-close icon__select-reduce"></i>
                    </span>
                  ))
                }
                <span className={'no-wrap base-color ' + ((!isCollapsed && len !== 0 || len >= max) ? 'd-none ' : '') } > + 选择</span>
              </div>
            )
          }
        </div>

        {/* Dropdown */}
        <div className={'select-dropdown ' + (isCollapsed ? '' : 'is-active')} ref={el => this.dropdown = el}>
          {search &&
            (<div className="select-search__input-wrap clearfix">
              <input type="text" className='select-search__input' placeholder={'搜索'} onChange={e => this.search(e)} onBlur={e => this.cancelSearch(e)} />
              {plugin || null}
            </div>)
          }
          <div className="select-dropdown__track">
            {children}
          </div>
        </div>

      </div>
    )
  }
}
/* Option */
class Option extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      isOn: false,
      isHide: false
    }
  }
  parent() {
    return this.context.Select
  }
  handleClick() {
    const parent = this.parent()
    const { multiple, onChange, max } = parent.props
    const { value, label } = this.props
    const {isOn} = this.state
    this.setState(prevS => ({ isOn: !isOn }))
    if (multiple) {
      if (isOn) {  //取消选中
        parent.setState(prevS => ({
          _selectedList: prevS._selectedList.filter((item, i) => {
            const bool = item !== label
            !bool && parent.selectedValueList.splice(i, 1)
            return bool
          })
        }))
      } else {
        if (max > parent.state._selectedList.length) {
          parent.setState(prevS => {
            const list = prevS._selectedList
            parent.selectedValueList.push(value)
            return { _selectedList: list.concat([label]) }
          })
        }
      }
      parent.shouldSend = true
    } else {
      parent.setState({ selected: label })
      parent.toggleDropdown()
      onChange && onChange(value)
    } 
   /*  const parent = this.parent()
    const { multiple, onChange, max } = parent.props
    const { value, label } = this.props

    if (multiple) {
      if (this.selected) {  //取消选中
        parent.setState(prevS => ({
          _selectedList: prevS._selectedList.filter((item, i) => {
            const bool = item !== label
            !bool && parent.selectedValueList.splice(i, 1)
            return bool
          })
        }))
      } else {
        if (max > parent.state._selectedList.length) {
          parent.setState(prevS => {
            const list = prevS._selectedList
            parent.selectedValueList.push(value)
            return { _selectedList: list.concat([label]) }
          })
        }
      }
      parent.shouldSend = true
    } else {
      parent.setState({ selected: label })
      parent.toggleDropdown()
      onChange && onChange(value)
    } */
  }
  initial() {
    const parent = this.parent()
    const {_selected, _selectedList} = parent.state
    const { label, value } = this.props
    let bool = null
    if (parent.props.multiple) { // 多选
      bool = _selectedList.some(item => (item === label))
      if (bool && this.shouldUpdate) {
        parent.selectedValueList.push(value)
      }
    } else {
      bool = _selected === label
    }
    this.setState({isOn: bool})
    return bool
  }
  componentWillMount() {
    this.initial()
  }
  shouldComponentUpdate(x, nextS) {
    const {isOn, isHide} = this.state
    return nextS.isOn !== isOn || nextS.isHide !== isHide
  }
  /* componentDidUpdate() {
    console.log('更新了', this.props.label)
  } */
  render() {
    const { label, children } = this.props
    const { multiple } = this.parent().props
    // const selected = this.selected
    const {isOn} = this.state

    return (
      <div className={'select-option ' + (isOn && !multiple ? 'selected ': '') + (!!this.hide ? 'd-none ':'')}
        onClick={this.handleClick.bind(this)} >
        {(multiple && !children) && <i className={'iconfont icon-finish checkbox-icon ' + (isOn ? 'is-checked' : '')}></i>}
        {children || label}
      </div>
    )
  }
}

/* OptionGroup */
class OptionGroup extends React.Component {

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
    const { label, value, children } = this.props
    return (
      <ul className="select-group__wrap" onClick={e => this.handleClick(e, { value, label })} >
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

module.exports = Select