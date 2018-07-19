import React from 'react'
import Icon from '../icon/icon'
/**
 * 有 固定列 (有没有 syncRow)  需同步 ==>>>>>
 * hover  同步
 * checkbox  点击表格行 同步
 */

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
  checked(tr, rowIndex, e) {
    e && e.stopPropagation()

    const bool = !this.state.checked
    /* // 点击行, 只允许选中 不能取消
    if(type === 1 && !bool) return */

    const { onChecked, syncRow, checkState } = this.props
    // 发送数据给table
    onChecked(tr, bool, rowIndex, checkState)

    if (syncRow) {
      syncRow('check', { index: rowIndex, checked: bool })
    } else {
      this.setState({ checked: bool })
    }

  }
  // 具有扩展功能的表格
  expand(colIndex) {
    const collapse = this.state.collapse
    const { rowIndex } = this.props
    this.setState({
      collapse: !collapse,
      colIndex: colIndex
    });
    // this.syncRow('expand', collapse ? rowIndex : -1, collapse ? colIndex : false)
  }

  // 鼠标移入样式
  toggleRowBG(type) {

    const { rowIndex, syncRow } = this.props

    if (syncRow) {
      syncRow('hover', type > 0 ? rowIndex : -1)
    } else {
      this.setState({ hoverIndex: type > 0 ? rowIndex : -1 })
    }

  }


  // 将列宽按照最宽设置
  componentDidMount() {
    const tdWidthList = this.tdWidthList

    const { widthList, columns } = this.props
    let index = 0
    let width = 0
    for (let i = 0, len = tdWidthList.length; i < len; i++) {

      if (columns[i].cannotExpand) continue;

      index = columns[i].__i__

      width = tdWidthList[i] + 20

      if (width > widthList[index]) {
        this.props.collectTdWidth(index, width)
      }
    }

    this.initialized = true

  }

  componentWillReceiveProps(N_P) {
    const O_P = this.props
      , rowIndex = O_P.rowIndex
      , checkState = O_P.checkState // 1 多选  2 单选  0 没有

      , O_STATUS = O_P.checkStatus
      , N_STATUS = N_P.checkStatus

      , O_SYNC_CHECK = O_P.syncData.check || {}
      , N_SYNC_CHECK = N_P.syncData.check || {}



    function jude(o, n, c) {
      return o !== n && (o === c || n === c)
    }
    // 控制一下性能
    // 同步表格行数据 

    if (jude(O_P.syncData.hover, N_P.syncData.hover, rowIndex)) {
      this.setState({ hoverIndex: N_P.syncData.hover })
    }

    if (checkState === 1) { // 多选

      if (N_STATUS !== O_STATUS) { // table全选
        if (N_STATUS === 1) {
          this.setState({ checked: true })
        } else if (N_STATUS === -1) {
          this.setState({ checked: false })
        }
      }
      
      if (N_STATUS !== 1 && N_STATUS !== -1 && rowIndex === N_SYNC_CHECK.index) {
        this.setState({ checked: N_SYNC_CHECK.checked })
      }

    } else if (checkState === 2) {  // 单选
      if (jude(O_SYNC_CHECK.index, N_SYNC_CHECK.index, rowIndex)) {
        this.setState({ checked: N_SYNC_CHECK.index === rowIndex })
      }
    }


  }
  shouldComponentUpdate(N_P, N_S) {
    const O_P = this.props
      , O_S = this.state

    return O_P.columns !== N_P.columns
      || O_P.tr !== N_P.tr
      || O_P.rowIndex !== N_P.rowIndex
      || N_S.checked !== O_S.checked
      || N_S.hoverIndex !== O_S.hoverIndex

  }
  render() {
    const { columns, tr, bgColor, rowIndex, isBottom, checkState } = this.props//  syncExpandRow, isFixed, 
    if (!tr) return null

    const { checked, collapse, hoverIndex, } = this.state //colIndex, 

      , selfTr = Object.assign({}, tr)

    return isBottom ?
      (
        <tr className={'u-tr'}>
          {
            columns.map((th, j) => {
              return (
                <td key={'u-td' + j} className='u-td'>
                  <div className='u-td-content' ref={el => { if (!el) return; this.tdWidthList[j] = el.offsetWidth }}>
                    {tr[th.type || th.prop] || null}
                  </div>
                </td>
              )
            })
          }
        </tr>
      ) :
      (
        <React.Fragment>
          <tr className={'u-tr ' + (bgColor || '') + (hoverIndex === rowIndex ? ' hover' : '')}
            onMouseEnter={() => this.toggleRowBG(1)}
            onMouseLeave={() => this.toggleRowBG(-1)}
            onClick={checkState !== 0 ? this.checked.bind(this, selfTr, rowIndex) : null}
          >
            {
              columns.map((th, j) => {
                return (

                  <td key={'u-td' + j} className='u-td'>
                    {
                      (th.type === 'checkbox' || th.type === 'radio') ? (<Icon type={checked ? 'check-fill' : 'check'} onClick={e => this.checked(selfTr, rowIndex, e)} />)
                        : th.type === 'expand' ? (<Icon type='down-fill' className={collapse ? 'u-turn-right' : ''} onClick={this.expand.bind(this, th.__i__)} />)
                          : th.type === 'index' ? rowIndex + 1
                            : (
                              (tr[th.prop] || tr[th.prop] === 0 || th.filter) && (
                                <div className='u-td-content' ref={el => { if (!el) return; this.tdWidthList[j] = el.offsetWidth }}>
                                  {th.filter ? th.filter(tr[th.prop], selfTr, rowIndex) : tr[th.prop]}
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
          (!isFixed && (!collapse || (syncExpandRow.colIndex && syncExpandRow.rowIndex === rowIndex))) && (
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