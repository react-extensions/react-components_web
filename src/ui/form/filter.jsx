import React from 'react'
/**
 * 
 * @param {React Component} Component 
 * 
 * @param {fnction} getOutputValue 有的组件接受的value, 跟它onChange 传出的你需要的值有些不同, (antd 的 rangePicker)
 * 
 * @param {fnction} getPropValue 有的组件onChange传出来的值, 跟接收的value可能不同 
 * 筛选组件onChange的值, 并返回传给原组件的新的值
 * 
 * 
 */
// 实例：
// filterValue(Input, e => e.target.value, e => e.target.value)

function filterValue(
  Component, 
  {
    formatOutputValue,
    formatInputValue,

  },
  changeHandle
  ) {

  class ValueFilter extends React.PureComponent {
    constructor(props) {
      super(props)
     
      this.handleChange = this.handleChange.bind(this)
    }
    handleChange(...args) {

      const emit = this.props.onChange

      
      emit && emit(formatOutputValue ? formatOutputValue(...args) : args[0])

    }

    render() {
      const props = this.props
      changeHandle = changeHandle || 'onChange'
      const changeProps = {[changeHandle]: this.handleChange }
      return (
        <Component
            {...props}
            {...changeProps}
            value={formatInputValue ? formatInputValue(props.value) : props.value}
          />
      )
    }
  }

  return ValueFilter
}

export default filterValue