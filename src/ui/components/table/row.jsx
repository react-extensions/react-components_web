import React from 'react'
import Icon from '../icon/icon'
// import Transition from '../transition/transition'

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
    const {fixedTable, syncRow, rowIndex} = this.props
    this.setState({
      collapse: !collapse,
      colIndex: colIndex
    })

    if(fixedTable && syncRow) {
      syncRow('expand', collapse ? rowIndex : -1, collapse ? colIndex : false)
    }
  }
  // 鼠标移入样式
  toggleRowBG(type) {
    const {syncRow, rowIndex} = this.props

    this.setState({ hoverIndex: type > 0 ? rowIndex : -1 })

    syncRow && syncRow('hover', type > 0 ? rowIndex : -1)
  }

  // 将列宽按照最宽设置
  componentDidMount() {
    const td = this.td
    const widthList = this.props.widthList
    let width = 0
    for(let i = 0, len = td.length; i < len; i++) {
      if(!td[i]) { continue;}
      width = td[i].offsetWidth
      if( width > widthList[i]) {
        this.props.resizeColToMax(i, width + 20 )
      }
    }

  }
  componentWillReceiveProps(nP) {
    const { checkedStatus } = nP
    if (checkedStatus === 1) {
      this.setState({ checked: true })
    } else if (checkedStatus === -1) {
      this.setState({ checked: false })
    }
  }
  render() {
    const { columns, tr, bgColor, rowIndex, fixedTable, syncHoverRow, syncExpandRow } = this.props
    const { checked, collapse, colIndex, hoverIndex } = this.state

    return (
      <React.Fragment>
        <tr className={'tr ' + (bgColor || '') + ((hoverIndex === rowIndex || syncHoverRow === rowIndex) ? ' hover' : '')}
          onMouseOver={() => this.toggleRowBG(1)}
          onMouseLeave={() => this.toggleRowBG(-1)}>
          {
            columns.map((th, j) => {
              if (fixedTable && !th.fixed) return null
              if (!fixedTable && th.fixed) return (<td key={'td' + j}></td>)
              return (
                <td key={'td' + j}
                  className={'td ' /* + (th.alignCenter ? 'align-center ' : '') */}
                  onClick={
                    th.type === 'checkbox' ? this.checked.bind(this)
                      : th.type === 'expand' ? this.expand.bind(this, j)
                        : null
                  }
                >
                  <div className='td-content' ref={el => this.td[j] = el  }>
                    {
                      th.type === 'checkbox' ? (<Icon type={checked ? 'check-fill' : 'check'} />)
                        : th.type === 'expand' ? (<Icon type='down-fill' className={collapse ? 'turn-right' : ''} />)
                          : th.type === 'index' ? rowIndex + 1
                            : tr[th.prop]
                    }
                  </div>
                </td>
              )

            })
          }
        </tr>
        {
          (!fixedTable && (!collapse || (syncExpandRow.colIndex && syncExpandRow.rowIndex === rowIndex))) && (
            <tr className='expand-tr'>
              <td colSpan={columns.length}
                className='expand-td'>
                {columns[colIndex || syncExpandRow.colIndex].content}
              </td>
            </tr>
          )
        }
      </React.Fragment>
    )
  }
}

export default Row