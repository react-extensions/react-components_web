import React from 'react'
import PropTypes from 'prop-types'
/**
 *  @Component Option props
 *  @param label   String  用于显示
 *  @param value   Any     每个选项代表的数据
 */
class Option extends React.Component {
 /*  constructor(props) {
    super(props)
  } */
  parent() {
    return this.context.Select
  }
  intial() {
    this.selected = false
    const parent = this.parent()
    const {selected, selectedList} = parent.state
    const {label, value} = this.props
    
    if(parent.props.multiple ) {
      this.selected = selectedList.some(item => item === label)
      parent.static.shouldUpdate && this.selected && (parent.static.selectedValueList[label] = value)
    } else {
      this.selected = selected === label
      parent.static.selectedValue = value
    }
  }
  componentWillMount() {
    this.intial()
  }
  componentWillUpdate() {
    this.intial()
  }
/*   componentDidUpdate() {
    console.log('更新了', this.props.label)
  } */
  clickOption() {
    const { label, value } = this.props
    this.parent().onClickOption({ label, value}, this.selected)
  }
  render() {
    const { label, children } = this.props
    const { multiple } = this.parent().props
    // const selected = this.itemSelected()
    const selected = this.selected
    return (
      <div className={'select-option ' + (selected && !multiple ? 'selected ' : '') + (!!this.hide ? 'd-none ' : '')}
        onClick={this.clickOption.bind(this)} >
        {(multiple && !children) && <i className={'iconfont icon-success checkbox-icon ' + (selected ? 'is-checked' : '')}></i>}
        {children || label}
      </div>
    )
  }
}


Option.contextTypes = {
  Select: PropTypes.any
}

export default Option