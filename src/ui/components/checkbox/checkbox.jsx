import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Context from './context'

/**
 * @prop {string} id 
 * @prop {string} label
 * @prop {any} value
 * 
 * 
 */
class Checkbox extends Component {
  constructor(props) {
    super(props)
    this.state = {
      checked: false
    }

    this.init(props, true)
    this.toggleCheck = this.toggleCheck.bind(this)
  }
  toggleCheck(e) {
    const fn = this.props.onChange
    const checked = e.target.checked
    fn && fn( checked, this.value)

    this.setState({
      checked: e.target.checked
    })
  }

  init(props, isInit) {
    const pValue = props.value
    const bool = pValue && (typeof pValue === 'string' || typeof pValue === 'number')
    const id = bool ? pValue : (props.label || props.id)
    const value = props.value || id
    this.value = {
      id: id,
      label: props.label || null,
      value: value
    }
    const checked = props.defaultChecked.indexOf(id) > -1
    
    isInit ? this.state.checked = checked : this.setState({checked: checked})
    const fn = this.props.onChange
    checked && fn && fn(true,this.value,  false)
  }

  // props更新值, 默认值
  componentWillReceiveProps(nextP){
    if(nextP.defaultChecked !== this.props.defaultChecked) {
      this.init(nextP)
    }
  }
  shouldComponentUpdate(nP, nS) {
    return nS.checked !== this.state.checked
  }
  render() {
    const {label, className, children} = this.props
    const {checked} = this.state
    return (
      <label className={'checkbox ' + (className || '')}>
        <input type='checkbox'
                className='checkbox__exact'
                onChange={this.toggleCheck}
                checked = {checked}
          />
        <span className={'checkbox-icon-wrap' + (checked ? ' check-fill' : ' check')}>
          <span className='checkbox-icon'></span>
        </span>
        { children ? children : (<span className='checkbox-label'>{label}</span>)}
        
      </label>
    )
  }
}

// function extend(Comp) {
//   return class CheckboxMiddleware extends React.PureComponent{
//     render() {
//       return (
//         <Context.Consumer>
//           {obj => <Comp {...this.props} {...obj}/>}
//         </Context.Consumer>
//       )
//     }
//   }
// }

/* Checkbox  props 类型检查 */
Checkbox.propTypes = {
  label: PropTypes.string,  // label
  checked: PropTypes.bool,  //初始默认选中
  className: PropTypes.string //自定义类名
}

function extend (Comp) {
  return class CheckboxContext extends React.Component{
    render(){
      return (
        <Context.Consumer>
          {obj=> <Comp {...this.props} {...obj}/>}
        </Context.Consumer>
      )
    }
  }
}

export default extend(Checkbox)