import React from 'react'
import Icon from '../icon/icon'

class Row extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      checked: false,
      collapse: true,
      colIndex: 0,
      hoverIndex: -1
    }
    this.td = []
  }
  // 具有多选功能的表格
  checked() {
    const { checked } = this.state
    const { onChecked, tr } = this.props
    onChecked(tr, !checked)
    this.setState({ checked: !checked })
  }
  // 具有扩展功能的表格
  expand(colIndex) {
    const collapse = this.state.collapse
    const { fixedTable, syncRow, rowIndex } = this.props
    this.setState({
      collapse: !collapse,
      colIndex: colIndex
    })

    if (fixedTable && syncRow) {
      syncRow('expand', collapse ? rowIndex : -1, collapse ? colIndex : false)
    }
  }

  // 鼠标移入样式
  toggleRowBG(type) {
    const { syncRow, rowIndex } = this.props

    this.setState({ hoverIndex: type > 0 ? rowIndex : -1 })

    syncRow && syncRow('hover', type > 0 ? rowIndex : -1)
  }

  // 将列宽按照最宽设置
  componentDidMount() {
    const td = this.td
    const widthList = this.props.widthList
    let width = 0
    for (let i = 0, len = td.length; i < len; i++) {
      if (!td[i]) continue;
      width = td[i].offsetWidth
      if (width > widthList[i]) {
        this.props.resizeColToMax(i, width + 20)
      }
    }

    this.initialized = true

  }
  componentWillReceiveProps(nP) {
    const { checkedStatus } = nP
    if (this.props.checkedStatus !== checkedStatus) {
      if (checkedStatus === 1) {
        this.setState({ checked: true })
      } else if (checkedStatus === -1) {
        this.setState({ checked: false })
      }
    }

  }
  render() {
    const { columns, tr, bgColor, rowIndex, syncHoverRow, syncExpandRow } = this.props
    const { checked, collapse, colIndex, hoverIndex } = this.state

    return (
      <React.Fragment>
        <tr className={'tr ' + (bgColor || '') + ((hoverIndex === rowIndex || syncHoverRow === rowIndex) ? ' hover' : '')}
          onMouseOver={() => this.toggleRowBG(1)}
          onMouseLeave={() => this.toggleRowBG(-1)}>
          {
            columns.map((th, j) => {
              return (
                <td key={'td' + j} className='td'>
                  {
                    th.type === 'checkbox' ? (<Icon type={checked ? 'check-fill' : 'check'} onClick={this.checked.bind(this)}/>)
                      : th.type === 'expand' ? (<Icon type='down-fill' className={collapse ? 'turn-right' : ''} onClick={this.expand.bind(this, j)}/>)
                        : th.type === 'index' ? rowIndex + 1
                          : (
                            (tr[th.prop] || tr[th.prop] === 0 || th.filter) && (
                              <div className='td-content' ref={this.initialized ? null : (el => { if (!el) return; this.td[j] = el })}>
                                {th.filter ? th.filter(tr[th.prop]) : tr[th.prop]}
                              </div>
                            )
                          )

                  }

                </td>
              )

            })
          }
        </tr>

      </React.Fragment>
    )
  }
}

export default Row