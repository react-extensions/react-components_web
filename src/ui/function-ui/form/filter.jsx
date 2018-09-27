import React from 'react'

function filterValue(Component, getPropValue, getOutputValue) {

  class ValueForm extends React.PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        value: props.value
      }
      this.selfValue = props.value
      this.outputValue = props.value
      this.handleChange = this.handleChange.bind(this)
    }
    handleChange(...args) {
      this.setState({
        value: this.selfValue = getPropValue ? getPropValue(...args) : args[0]
      })

      const emit = this.props.onChange
      
      emit && emit(this.outputValue = getOutputValue ? getOutputValue(...args) : args[0])

    }
    UNSAFE_componentWillReceiveProps(nextP) {
      const nV = nextP.value

      // nV 跟 上一次的prop值 不同 且 跟 当前组件保存的状态不同, 则更新当前组件状态
      if(nV !== this.props.value && nV !== this.state.value) {
        // 如果nV 跟传出去的值 不同, 则直接用 , 如果跟传出去的值 相同, 则用 this.selfValue
        this.setState({
          value: nV !== this.outputValue ? nV : this.selfValue
        })
      }
    }
    render() {
      return (
        <Component
            {...this.props}
            value={this.state.value}
            onChange={this.handleChange}
          />
      )
    }
  }

  return ValueForm
}

export default filterValue