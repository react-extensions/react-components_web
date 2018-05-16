import React from 'react'
import Icon from '../icon/icon'

class Row extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      checked: false
    }
  }
  checked() {
    const { checked } = this.state
    const { onChecked, tr } = this.props
    onChecked(tr, !checked)
    this.setState({ checked: !checked })
  }
  componentWillReceiveProps(nP) {
    const { checkedStatus } = nP
    if (checkedStatus === 1) {
      this.setState({ checked: true })
    } else if (checkedStatus === -1) {
      this.setState({ checked: false })
    }
  }
  shouldComponentUpdate(nP, nS) {
    return nS.checked !== this.state.chekced
  }
  componentDidUpdate() {
    console.log('更新了', this.tr)
  }
  render() {
    const { thead, tr, bgColor} = this.props
    const { checked } = this.state
    return (
      <tr className={'tr ' + bgColor} >
        {
          thead.map((th, j) => (
            th.type === 'checkbox'
              ? (<td className='td' key={'td' + j} onClick={this.checked.bind(this)}><Icon type={checked ? 'check-fill' : 'check'} /></td>)
              : (<td className='td' key={'td' + j} >{tr[th.prop]}</td>)
          ))
        }
      </tr>
    )
  }
}

export default Row