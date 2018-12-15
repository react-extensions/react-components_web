import React from 'react';
import PropTypes from 'prop-types'
import Context from './context'

/**
 * @prop {array} checked 默认选中项组成的数组, 必须是 label, id ,value中的唯一标识
 * @prop {function} onChange 用于接收change函数
 */
class CheckboxGroup extends React.Component {
  constructor(props) {
    super(props)

    this.checkedQueue = []

    this.onChildChange = this.onChildChange.bind(this)

    this.contextObj = {
      onChange: this.onChildChange,
      defaultChecked: props.checked
    }
  }
  
  onChildChange(checked, obj, shouldEmit) {
  
    const queue = this.checkedQueue
    if(checked) {
      queue.push(obj)
    } else {
      queue.splice(queue.indexOf(obj), 1)
    }
    const fn = this.props.onChange

    shouldEmit && fn && fn([...queue])
  }

  shouldComponentUpdate(nP) {
    let bool = nP.checked !== this.props.checked
    if(bool) {
      this.checkedQueue = []
    }
    return bool
  }

  render() {
    const props = this.props
    const children = props.children
    return (
      <div className={"checkbox-group " + (props.className || '')}>
        <Context.Provider value={this.contextObj}>
          {props.children}
        </Context.Provider>
      </div>
    )
  }
}


/* Group props 类型检查 */
CheckboxGroup.propTypes = {
  className: PropTypes.string, //自定义类名
}

CheckboxGroup.defaultProps = {
  checked: []
}

export default CheckboxGroup
