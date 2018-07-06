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
    this.tdWidthList = []
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

    if(this.state.hoverIndex === rowIndex) return

    const { syncRow, rowIndex } = this.props

    this.setState({ hoverIndex: type > 0 ? rowIndex : -1 })

    syncRow('hover', type > 0 ? rowIndex : -1)
  }

  // 将列宽按照最宽设置
  componentDidMount() {
    const tdWidthList = this.tdWidthList

    const {widthList, columns} = this.props
    let index = 0
    let width = 0
    for (let i = 0, len = tdWidthList.length; i < len; i++) {

      if(columns[i].cannotExpand) continue;

      index = columns[i].__i__

      width = tdWidthList[i]
      
      if (width > widthList[index]) {
        this.props.resizeColToMax(index, width + 20)
      }
    }

    this.initialized = true

  }
  componentWillReceiveProps(nP) {
    const { checkboxStatus } = nP
    if (this.props.checkboxStatus !== checkboxStatus) {
      if (checkboxStatus === 1) {
        this.setState({ checked: true })
      } else if (checkboxStatus === -1) {
        this.setState({ checked: false })
      }
    }

  }
  render() {
    const { columns, tr, bgColor, rowIndex, syncHoverRow, syncExpandRow, fixedTable, } = this.props
    const { checked, collapse, hoverIndex, colIndex, } = this.state
    if (!tr) return null
    return (
      <React.Fragment>
        <tr className={'tr ' + (bgColor || '') + ((hoverIndex === rowIndex || syncHoverRow === rowIndex) ? ' hover' : '')}
          onMouseEnter={() => this.toggleRowBG(1)}
          onMouseLeave={() => this.toggleRowBG(-1)}>
          {
            columns.map((th, j) => {
              return (
                <td key={'td' + j} className='td'>
                  {
                    th.type === 'checkbox' ? (<Icon type={checked ? 'check-fill' : 'check'} onClick={this.checked.bind(this)} />)
                      : th.type === 'expand' ? (<Icon type='down-fill' className={collapse ? 'turn-right' : ''} onClick={this.expand.bind(this, th.__i__)} />)
                        : th.type === 'index' ? rowIndex + 1
                          : (
                            (tr[th.prop] || tr[th.prop] === 0 || th.filter) && (
                              <div className='td-content' ref={el => { if (!el) return; this.tdWidthList[j] = el.offsetWidth }}>
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
        {/* {
          (!fixedTable && (!collapse || (syncExpandRow.colIndex && syncExpandRow.rowIndex === rowIndex))) && (
            <tr className='expand-tr'>
              <td colSpan={columns.length}
                className='expand-td'>
                {columns[colIndex || syncExpandRow.colIndex].content}
              </td>
            </tr>
          )
        } */}
      </React.Fragment>
    )
  }
}

export default Row