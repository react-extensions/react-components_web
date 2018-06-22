import React from 'react'
import PropTypes from "prop-types";
import { attachEvent, detachEvent, contains, target } from '../../libs/utils'

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
*/
class Select extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isCollapsed: true, // 是否折叠下拉框
      selectedList: [],  // 用于多选选中
      selected: null,      // 用于单选选中
      dropPosition: 'bottom'
    }
    this.static = {
      selectedValueList: {},
      selectedValue: '',
      searching: false,
      shouldUpdate: true
    }

    this.toggleDropdown = this.toggleDropdown.bind(this)
    this.closeDropdown = this.closeDropdown.bind(this)

    const { selected, selectedList, multiple } = props
    if (multiple) {  // 多选下拉框
      this.state.selectedList = selectedList
    } else if (selected) {  // 单选
      this.state.selected = selected
    }


  }
  /* childcontext */
  getChildContext() {
    return { Select: this }
  }
  sendList() {
    const { onChange, multiple } = this.props
    if (multiple && onChange) {
      const list = this.static.selectedValueList
      const arr = []
      for (let item in list) {
        arr.push(list[item])
      }
      onChange(arr)
    }

  }
  initial() {
    if (this.static.shouldUpdate) {
      this.static.shouldUpdate = false
      this.sendList()
    }
  }
  componentDidUpdate() {
    this.initial()
  }
  componentDidMount() {
    this.initial()
  }
  componentWillUnmount() {
    detachEvent(document, 'click', this.closeDropdown)
  }
  // willReceiveProps 和 shouldUpdate  待优化 
componentWillReceiveProps(nP) {
    const { selected, selectedList, multiple, placeholder } = this.props
    if (!!nP.placeholder && nP.placeholder !== placeholder) {
      this.setState({
        selected: null,
        selectedList: [],
      })
      this.static.selectedValueList = {}
    }

    if (multiple && (nP.selectedList !== selectedList)) {
      this.setState({ selectedList: nP.selectedList })
      this.static.shouldUpdate = true
      this.static.selectedValueList = {}
    } else if (selected !== nP.selected) {
      this.setState({ selected: nP.selected })
      this.static.shouldUpdate = true
    }
    
  }
   shouldComponentUpdate(nP, nS) {
     const { disabled, placeholder } = this.props
     const { selected, selectedList, isCollapsed, searchText } = this.state
     return nP.disabled !== disabled
       || nP.placeholder !== placeholder
       || nS.selected !== selected
       || nS.selectedList !== selectedList
       || nS.searchText !== searchText
       || nS.isCollapsed !== isCollapsed
       || this.static.shouldUpdate
   }
  toggleDropdown(e) {
    e.persist();

    if (!this.props.disabled) {
      this.setState((prev) => {
        const isOff = prev.isCollapsed
        const newState = { isCollapsed: !isOff, dropPosition: 'bottom' }

        if (isOff) {
          attachEvent(document, 'click', this.closeDropdown)
          // 待优化 ..... 
          if (window.innerHeight - e.target.getBoundingClientRect().bottom < 100) {
            newState.dropPosition = 'top'
          }
        } else {
          detachEvent(document, 'click', this.closeDropdown)
        }
       
        return newState
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
    this.onClickOption({ label: cancel }, true)
  }
  search(e) {
    this.searching = true
    this.setState({ searchText: e.target.value })
  }
  cancelSearch(e) {
    this.searching = !!e.target.value
  }
  onClickOption(option, prevChecked) {
    const { multiple, onChange } = this.props
    if (multiple) {
      let list = this.state.selectedList
      if (!prevChecked) {
        this.static.selectedValueList[option.label] = option.value
        list = list.concat([option.label])
      } else {
        list = list.filter((item, i) => {
          const bool = item === option.label
          if (bool) { // 删除值, 待优化
            delete this.static.selectedValueList[option.label]
          }
          return !bool
        })
      }
      this.setState({ selectedList: list })
      this.sendList()
    } else {
      if (!prevChecked) {
        this.setState({ selected: option.label });
        onChange && onChange(option.value)
      }
    }

  }
  render() {
    const { selected, isCollapsed, selectedList, dropPosition } = this.state
    const { multiple, children, plugin, className, disabled, search, placeholder } = this.props
    let max = parseInt(this.props.max) // eslint-disable-line
    const len = selectedList.length

    return (
      <div className={'select ' + (disabled ? ' disabled' : '') + (className || '')} >
        <div className='select-input' onClick={this.toggleDropdown}>
          {/* tags 或者 input */}
          {
            !multiple ? (<div className={'select-input__exact'} > {selected || (placeholder || '请选择')}</div>) : (
              <div className="select-multiple-wrap" >
                {
                  selectedList.map(item => (
                    <span className='select-multiple-tag' key={item} onClick={e => this.cancelFromList(e, item)}>
                      {item}
                      <i className="iconfont icon-error iconselect-reduce"></i>
                    </span>
                  ))
                }
                <span className={'no-wrap base-color ' + (((!isCollapsed && len !== 0) || len >= max) ? 'd-none ' : '')} > + 选择</span>
              </div>
            )
          }
        </div>

        {/* Dropdown */}
        <div className={dropPosition + ' select-dropdown ' + (isCollapsed ? '' : 'is-active')} ref={el => this.dropdown = el}>
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


Select.defaultProps = {
  max: 10
}
Select.childContextTypes = {
  Select: PropTypes.any
}

export default Select
