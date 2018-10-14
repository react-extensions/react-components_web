import React from 'react'
/**
 * 
 * @param {React Component} Component 
 * 
 * @param {fnction} formatOutputValue 有的组件接受的value, 跟它onChange 传出的你需要的值有些不同, (antd 的 rangePicker)
 * 
 * @param {fnction} formatInputValue 有的组件onChange传出来的值, 跟接收的value可能不同 
 * 筛选组件onChange的值, 并返回传给原组件的新的值
 * 
 * @param {string}  changeHandleName 组件值发生 change时 的处理函数名称, 默认是 'onChange'
 * 
 * @param {string}  valueName 组件接收外部值的props名称, 默认是 'value'
 * 
 */
// 实例：
// filterValue(Input, {
//   formatOutputValue: e => e.target.value,
//   formatInputValue: v=>v,
//   changeHandleName: 'onSomethingChange' || 'onChange',   取决于组件 的 change事件处理函数名称
//   valueName: 'somethingValue' || 'value'
// })

function filterValue(
  Component, 
  {
    formatOutputValue,
    formatInputValue,
    changeHandleName = 'onChange',
    valueName = 'value'
  }) {

  class ValueFilter extends React.PureComponent {
    constructor(props) {
      super(props)
      this.handleChange = this.handleChange.bind(this)
      this.proxyProps = {[changeHandleName]: this.handleChange}
    }
    handleChange(...args) {
      const emit = this.props.onChange
      emit && emit(formatOutputValue ? formatOutputValue(...args) : args[0])
    }
    render() {
      const props = this.props
      const proxyProps = this.proxyProps
      proxyProps[valueName] = formatInputValue ? formatInputValue(props.value) : props.value

      return (
        <Component
            {...props}
            {...proxyProps}
          />
      )
    }
  }

  return ValueFilter
}

export default filterValue