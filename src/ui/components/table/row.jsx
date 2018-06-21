import React from 'react'
import Icon from '../icon/icon'

class Row extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      checked: false, 
      collapse: true,
      expandCol: 0
    }
  }
  // 具有多选功能的表格
  checked() {
    const { checked } = this.state
    const { onChecked, tr } = this.props
    onChecked(tr, !checked)
    this.setState({ checked: !checked })
  }
  // 具有扩展功能的表格
  expand(index) {
    const collapse = this.state.collapse
    this.setState({
      collapse: !collapse,
      expandCol: index
    })
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
    // console.log('更新了', 'tr')
  }
  render() {
    const { thead, tr, bgColor} = this.props
    const { checked, collapse, expandCol} = this.state
    return (
      <React.Fragment>
        <tr className={'tr ' + bgColor} >
          {
            thead.map((th, j) => (
              <td className='td' key={'td' + j} 
                  onClick={
                    th.type === 'checkbox' ? this.checked.bind(this) 
                      : th.type === 'expand' ? this.expand.bind(this, j)
                        : null
                  }
              >
                {
                  th.type === 'checkbox' ? (<Icon type={checked ? 'check-fill' : 'check'} />)
                    : th.type === 'expand' ? (<Icon type= 'down-fill' className={collapse ? 'turn-right' : ''} />) 
                      : tr[th.prop]
                }
              </td>
            ))
          }
        </tr>
        {
          !collapse && (
            <tr className='expand-tr'>
              <td colSpan={thead.length} className='expand-td'>
                {thead[expandCol].content}
              </td>
            </tr>
          )
        }
      </React.Fragment>
    )
  }
}

export default Row