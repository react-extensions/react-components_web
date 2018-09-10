import React from 'react'
import './table.scss'
import Icon from '../icon/icon'
import Row from './row'

/**
 * @param rows[Array]    {表格数据}
 * @param tbodyHeight     {tbody高度}
 * @param zebra[Boolean]  {表格行斑马线显示}
 * @param fixedRows
 * @param columns = [
 *      {
 *          filter: function () {}  // 对表格中的数据进行操作, 参数为表格中的数据, 返回值将被显示
 *      },
 *     {
 *        type: 'index',
 *        fixed: 'left || right',     // 让此列固定不左右滚动
 *     },
 *     {
 *        type: 'checkbox' // 如果加了这个, 则此列 会渲染成多选按钮
 *     },
 *     {
 *        type: 'expand',
 *        content: any  ,  可传入函数, 函数参数 为 rows行数据
 *     },
 *     {
 *        width: 80,       // 列宽
 *        label: '',       // 表头文字
 *        prop: ''         // rows 中数据的属性
 *     }
 * ]
 * 
 */

class Table extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      signOffset: 0,  // 调整表格列宽时, 指示器样式
      leftShadow: false,
      topShadow: false,
      syncData: { check: {} },
      checkStatus: -1,
      fixedBottomHeight: 0,
      sortMap: { current: '', direction: 1 }
    }

    this.tableWidth = { plain: 0, left: 0, right: 0 }
    this.thMinWidth = []
    this.checkedList = []
    this.checkState = -1   // -1 全不选中  0 部分  1全选
    this.columns = {}
    this.widthList = []

    this.analyseCols()
    this.moveSign = this.moveSign.bind(this)
    this.resizeCol = this.resizeCol.bind(this)
    this.checkedRow = this.checkedRow.bind(this)
    this.syncScroll = this.syncScroll.bind(this)
    this.checkedAll = this.checkedAll.bind(this)
    this.collectTdWidth = this.collectTdWidth.bind(this)
    this.fixedBottomHeight = this.fixedBottomHeight.bind(this)

  }
  analyseCols() {/* 数据预处理 */

    let colWidth = 0,
      col = null
    const columns = this.props.columns,
      widthList = [],
      fixedLeft = [],
      fixedRight = [],
      plain = []

    for (let i = 0, len = columns.length; i < len; i++) {
      col = columns[i]
      switch (col.type) {
        case 'checkbox':
        case 'expand':
        case 'index':
        case 'radio':
          col.cannotExpand = true
          colWidth = col.width || 50
          this.checkState = (col.type === 'checkbox' ? 1 : 2)
          break;
        default:
          colWidth = col.width || 0
          if (col.width) {
            col.cannotExpand = true
          }
          break;
      }
      col.__i__ = i

      switch (col.fixed) {
        case 'left':
          fixedLeft.push(col)
          break;
        case 'right':
          fixedRight.push(col)
          break;
        default:
          plain.push(col)
          break;
      }

      widthList.push(colWidth)
    }
    const obj = { plain: plain }

    if (fixedLeft.length) {
      obj.fixedLeft = fixedLeft
    }
    if (fixedRight.length) {
      obj.fixedRight = fixedRight
    }

    this.columns = obj

    this.widthList = widthList
  }

  /* ------------------- */
  /* ------------------- */
  /* ------------------- */
  /* --->> Row相关 <<--- */
  /* ------------------- */

  /* --->> 多选表格 <<--- */
  // 全部选中, 不选中
  checkedAll() {
    const { rows, onSelectRowChange } = this.props
    const bool = this.state.checkStatus === 1

    this.setState({ checkStatus: bool ? -1 : 1 })

    this.checkedList = bool || (!rows || rows.length === 0) ? [] : [...rows]
    onSelectRowChange && onSelectRowChange(this.checkedList)
  }
  // 单行选中, 不选中
  checkedRow(row, isChecked, rowIndex) {
    const emit = this.props.onSelectRowChange

    if (this.checkState === 2) { // 单选表格
      emit([row])
      return
    }

    const oldList = this.checkedList

    // 根据选中还是不选择, 从checkedList 添加 或  清除 该项
    oldList[rowIndex] = isChecked ? row : null

    // 格式化结构用于向外层发送
    const arr = oldList.filter(item => {
      if (item) return true
    })

    // 判断总体选中状态  全选中, quanweixuanz
    const len = arr.length
      , max = this.props.rows.length
      , oldStatus = this.state.checkStatus
      , newStatus = max === len ? 1 : len === 0 ? -1 : 0

    oldStatus !== newStatus && this.setState({ checkStatus: newStatus })

    emit && emit(arr)
  }
  /* -->> 同步表格行 <<-- */
  syncRow(type, syncData) {
    this.setState(prev => (
      { syncData: Object.assign({}, prev.syncData, { [type]: syncData }) }
    ))
  }
  /* ------------------- */
  /*->>    同步滚动    <<-*/
  /* ------------------- */
  syncScroll(e) {
    const left = e.currentTarget.scrollLeft
    this.headerTrack.scrollLeft = left
    this.bottomTable && (this.bottomTable.scrollLeft = left)

    const top = e.currentTarget.scrollTop
    this.leftTbody && (this.leftTbody.scrollTop = top)
    this.rightTbody && (this.rightTbody.scrollTop = top)

    const { topShadow, leftShadow } = this.state

      ; (topShadow !== (top > 0)) && this.setState({ topShadow: !topShadow })

      ; (leftShadow !== (left > 0)) && this.setState({ leftShadow: !leftShadow })

  }
  /* ------------------- */
  /*->> 调整表格列大小 <<-*/
  /* ------------------- */
  getOffsetLeft(e) {
    const C = this.container
      , P = C.getBoundingClientRect()
    return e.clientX - P.left + C.scrollLeft
  }
  prepareResizeCol(e, index, type) {
    e.preventDefault()
    e.stopPropagation()

    // 记录调整的  1. 列索引  2. 初始位置

    this.resizeData = { index, type, offset: this.getOffsetLeft(e) }

    document.addEventListener('mousemove', this.moveSign)
    document.addEventListener('mouseup', this.resizeCol)
  }
  // 修改指示器位置
  moveSign(e) {
    this.setState({ signOffset: this.getOffsetLeft(e) })
  }
  resizeCol() {
    document.removeEventListener('mousemove', this.moveSign)
    document.removeEventListener('mouseup', this.resizeCol)

    const offset = this.state.signOffset

    if (!offset) return

    const data = this.resizeData
    const oldWidth = this.widthList[data.index]
    // 根据每列的表头, 设置最小宽度
    const minWidth = this.thMinWidth[data.index]

    let newWidth = oldWidth + offset - data.offset

    newWidth < minWidth && (newWidth = minWidth)

    const { left, right, plain } = this.tableWidth
    const containerWidth = (parseFloat(this.container.clientWidth) - this.yScrollBar || 0)// 容器宽度
    //位移差, 调整了的宽度
    let diff = newWidth - oldWidth
    //                   容器宽度 - 新的总宽度
    let subDiff = containerWidth - (left + right + plain + diff)


    if (subDiff > 0) {  // 如果新总宽度 小于容器宽度, 禁止缩小
      newWidth += subDiff
      diff += subDiff
    }

    // 记录  并调整表格总宽度
    this.tableWidth[data.type] += diff
    // 记录  并调整  对应列的宽度
    this.widthList[data.index] = newWidth
    // 判断要不要显示水平轴 滚动条
    this.analyXscroll(subDiff)
    // 把标志线归零 , 顺便触发整个更新
    this.setState({ signOffset: 0 })
  }


  // 根据用户设置,计算表格列宽 及 总宽度
  computeColWidth() {

    const containerWidth = parseFloat(this.container.clientWidth) - this.yScrollBar || 0
    const { columns } = this.props
    const widthList = this.widthList

    let totalWidth = 0
    let hasZero = 0
    let cannotExpand = { width: 0 }

      ; (function () {
        let item = 0
        for (let i = 0, len = widthList.length; i < len; i++) {
          item = widthList[i]

          if (item === 0) hasZero++

          if (columns[i].cannotExpand) {
            cannotExpand.width += item
            cannotExpand[i] = true
          }

          totalWidth += item
        }
      }())


    // 如果表格 实际 大于 计算   diff > 0
    const diff = containerWidth - totalWidth,
      thMinWidth = this.thMinWidth

    let minWidth = 0  // 每列最小宽度
      , lastWidth = 0    // 最终计算的列宽
      , thMinItem = 0
      , plainW = 0
      , leftW = 0
      , rightW = 0
      , col = null

    this.widthList = widthList.map((oldWidth, i) => {
      thMinItem = thMinWidth[i]

      //  对于 像 checkbox  和 expand 这种列  我没有获取 最小宽度,  其最小宽度在初始化时(constructor中) 已经被设置了
      lastWidth = minWidth = (!thMinItem || thMinItem < oldWidth) ? oldWidth : thMinItem

      if (diff > 0) {   // 需要自动扩展 列宽

        if (hasZero) { // 存在 没有设置宽度的 列  ==>>  将多余的平均分配

          oldWidth === 0 && (lastWidth = diff / hasZero);

        }
        else {     // 不存在 没有设置宽度的列  ==>>  除了不允许扩展的列, 其他均匀分配 多出的

          !cannotExpand[i] && (lastWidth = oldWidth + diff * (oldWidth / (totalWidth - cannotExpand.width)));

        }

        // 最小宽度
        lastWidth < minWidth && (lastWidth = minWidth)

      }



      col = columns[i].fixed

      if (col === 'left') {
        leftW += lastWidth
      }
      else if (col === 'right') {
        rightW += lastWidth
      }
      else {
        plainW += lastWidth
      }

      return lastWidth

    }) // End Map

    this.analyXscroll(containerWidth - leftW - rightW - plainW)

    this.tableWidth = { left: leftW, right: rightW, plain: plainW }

    this.forceUpdate()
  }
  fixedBottomHeight(el) {
    if (!el) return
    this.setState({
      fixedBottomHeight: el.clientHeight
    })
  }

  // 按照每列中最大宽度的td设置列宽
  collectTdWidth(index, newWidth) {
    this.widthList[index] = newWidth
  }
  collectThWidth(index, el) {
    if (!el) return;
    this.thMinWidth[index] = el.offsetWidth + 20
  }
  // 判断有没有竖直方向滚动条
  analyseScroll() {
    const track = this.trackEl
    if (track) {
      this.yScrollBar = track.offsetWidth - track.clientWidth
      this.xScrollBar = track.offsetHeight - track.clientHeight
    }

  }
  analyXscroll(diff) {
    this.xScrollBar = diff < 0 ? 17 : 0
  }

  _initStructure() {

    this.analyseScroll()
    // 初始化 横向结构, 列宽,
    this.computeColWidth()

  }

  componentDidMount() {
    this._initStructure()
  }

  componentDidUpdate(prevP, prevS) {
    // rows 数据更新后, 重新设置col宽度
    if (prevP.rows !== this.props.rows) {
      this._initStructure()
    }

  }
  UNSAFE_componentWillReceiveProps(nextP) {

    // 更新了 rows数据后, 将所有 checkbox状态清空
    if (nextP.rows !== this.props.rows) {
      this.checkedList = []
      this.setState({
        syncData: { check: {} },
        checkStatus: -1,
      })
    }

  }
  //* 表格排序
  sortData(key) {
    const map = this.state.sortMap
    const newState = { sortMap: { current: key, direction: map.current === key ? -map.direction : 1 } }
    this.setState(newState)
  }
  renderHeader(cols, columns) {
    const state = this.state
    const { status, sortMap } = state
    return (
      <table border='0' cellSpacing='0' cellPadding={0} >
        {columns}
        <thead >
          <tr>
            {
              cols.map((th, i) => {
                const textAlign = th.type ? ' center' : (th.align ? (' ' + th.align) : '')
                return (
                  <th className={'u-th' + textAlign} key={i} >
                    {/* 如果不加这一层div, 在ie中, th td内元素的绝对定位会出问题(ie中应该不能将td th作为绝对定位的参照节点, 设置position:reletive无效) */}
                    <div className='u-th-content__wrap'>
                      {
                        th.type === 'checkbox' ? <Icon type={status === 0 ? 'half-checked' : status > 0 ? 'check-fill' : 'check'} onClick={this.checkedAll} />
                          : (th.type === 'expand' || th.type === 'radio') ? null
                            : th.type === 'index' ? '#'
                              : (<React.Fragment>
                                <span
                                  ref={this.collectThWidth.bind(this, th.__i__)}
                                  className='u-th-content' >
                                  {th.label}
                                  {
                                    th.needSort && (
                                      <span
                                        onClick={this.sortData.bind(this, th.prop)}
                                        className={'sort-sign ' + (sortMap.current === th.prop ? (sortMap.direction > 0 ? 'forward' : 'reverse') : 'un-active')}
                                      >
                                        <Icon type='down-fill' className='up-arrow' />
                                        <Icon type='down-fill' className='down-arrow' />
                                      </span>
                                    )
                                  }
                                </span>
                                <i
                                  className='u-th-border'
                                  onMouseDown={e => this.prepareResizeCol(e, th.__i__, th.fixed || 'plain')}>
                                </i>
                              </React.Fragment>)
                      }
                    </div>
                  </th>
                )
              })
            }
          </tr>
        </thead>
      </table>
    )
  }
  sortRows(rows) {
    // 如果排序规则没变, 表格数据没变, 且有 已经排序过的 rows数据, 则直接用已经排序过的

    if (!this.sortedRows || this.rows !== this.props.rows || this.sortMap !== this.state.sortMap) {
      // 缓存上次状态
      this.rows = this.props.rows
      this.sortMap = this.state.sortMap

      const match = this.sortMap.current
      const rule = this.sortMap.direction

      this.sortedRows = rows.sort((p, n) => {
        return (n[match] - p[match]) * rule
      })
    }

    return this.sortedRows
  }
  renderBody(cols, columns, tType, needSync) {
    const PROPS = this.props
      , { zebra, emptyTip, loading } = PROPS
      , { syncData, checkStatus, sortMap } = this.state
    let rows = tType === -2 ? PROPS.fixedRows : PROPS.rows
    // 表格排序
    if (sortMap.current && rows && rows.length > 0 && tType === 0) {
      rows = this.sortRows(rows)
    }

    return (
      loading ? tType === 0 ? <Icon type='loading' /> : null :
        (rows && rows.length > 0) ? (
          <table border='0' cellSpacing='0' cellPadding={0} >
            {columns}
            <tbody>
              {rows.map((tr, i) => (
                <Row
                  key={'u-tr' + i}
                  tr={tr}
                  rowIndex={i}
                  checkState={this.checkState || 0}
                  columns={cols}
                  bgColor={zebra && (i % 2 === 0 ? 'lighten' : 'darken')}
                  isFixed={tType !== 0}
                  isBottom={tType === -2}
                  checkStatus={checkStatus}
                  widthList={this.widthList}
                  collectTdWidth={this.collectTdWidth}
                  syncData={syncData}
                  syncRow={needSync ? this.syncRow.bind(this) : null}
                  onChecked={this.checkedRow}
                  onRowClick={this.props.onRowClick}
                />
              ))}
            </tbody>
          </table>
        ) : tType === 0 ? (<div className='empty-table-tip'>{emptyTip || (<span className='empty-tip__span'>暂无数据</span>)}</div>) : null

    )
  }
  renderColumns(cols) {
    const list = this.widthList
    return (
      <colgroup>
        {cols.map(item => (<col key={item.__i__} style={{ width: list[item.__i__] || 'auto' }}></col>))}
      </colgroup>
    )
  }
  renderTable(cols, tType, needSync) {
    const columns = this.renderColumns(cols)
    return {
      header: this.renderHeader(cols, columns, tType, needSync),
      body: this.renderBody(cols, columns, tType, needSync)
    }
  }
  renderBottom() {
    const { fixedLeft, fixedRight, plain } = this.columns
    const plainT = this.renderBody(plain, this.renderColumns(plain), -2, false)

    let left = null
    let right = null
    if (fixedLeft) {
      left = this.renderBody(fixedLeft, this.renderColumns(fixedLeft), -2, false)
    }
    if (fixedRight) {
      right = this.renderBody(fixedRight, this.renderColumns(fixedRight), -2, false)
    }
    return { plain: plainT, left, right }
  }
  render() {
    const COLUMNS = this.columns,
      PROPS = this.props,
      STATE = this.state,
      { fixedLeft, fixedRight, plain } = COLUMNS
      , { fixedRows, scrollY } = PROPS
      , { topShadow, leftShadow, rightShadow, signOffset, fixedBottomHeight } = STATE

      , hasFixed = fixedLeft || fixedRight

      , plainTable = this.renderTable(plain, 0, hasFixed)
      , leftTable = fixedLeft && this.renderTable(fixedLeft, -1, hasFixed)
      , rightTable = fixedRight && this.renderTable(fixedRight, 1, hasFixed)

      , TW = this.tableWidth
      , P_W = TW.plain
      , L_W = TW.left
      , R_W = TW.right
      , B_H = fixedRows ? fixedBottomHeight : 0
      , bottomTable = fixedRows ? this.renderBottom() : null
      , fixedTableHeight = (hasFixed && scrollY) ? (scrollY - (this.xScrollBar || 0) - B_H) + 'px' : 'auto'

    return (
      <div className={'u-table__container ' + (this.props.className || '')} ref={el => { this.container = el }}>
        <div className="resize-col-sign" style={{ display: signOffset ? 'block' : 'none', left: signOffset }}></div>
        <div className='u-plain__table'>
          <div className={'u-header__track ' + (topShadow ? 'shadow ' : '')}
            style={{ padding: `0 ${R_W}px 0 ${L_W}px`, overflowY: this.yScrollBar ? 'scroll' : 'hiddren' }}
            ref={el => this.headerTrack = el}
          >
            <div className="u-table-header" style={{ width: P_W && (P_W + 'px') }}>{plainTable.header}</div>
          </div>

          <div className='u-body__track'
            style={{ height: (scrollY || 'auto') + 'px', padding: `0 ${R_W}px 0 ${L_W}px` }}
            ref={el => this.trackEl = el}
            onScroll={this.syncScroll}
          >
            <div className="u-table-body" style={{ width: P_W && (P_W + 'px') }}>{plainTable.body}</div>
            {/* 外层(track)的padding-bottom 在 ie中 无效, 需要使用这种方法*/}
            {/* padding-right也无效(⊙o⊙)？ */}
            {B_H > 0 && <div style={{ height: B_H }}></div>}
          </div>
        </div>

        {leftTable &&
          <div className={'u-fixed-left__table ' + (leftShadow ? 'shadow ' : '')} style={{ width: L_W && (L_W + 'px') }}>
            <div className={'u-table-header ' + (topShadow ? 'shadow ' : '')}>{leftTable.header}</div>
            <div className="u-table-body"
              style={{ height: fixedTableHeight }}
              ref={el => this.leftTbody = el}
            >
              {leftTable.body}
            </div>
          </div>
        }
        {rightTable &&
          <div className={'u-fixed-right__table ' + (rightShadow ? 'shadow ' : '')} style={{ width: R_W && (R_W + 'px'), right: (this.yScrollBar || 0) + 'px' }}>
            <div className={'u-table-header ' + (topShadow ? 'shadow ' : '')}>{rightTable.header}</div>
            <div className="u-table-body"
              style={{ height: fixedTableHeight }}
              ref={el => this.rightTbody = el}
            >
              {rightTable.body}
            </div>
          </div>
        }
        {bottomTable &&
          <div className='u-fixed-bottom__table' style={{ bottom: (this.xScrollBar || 0), right: (this.yScrollBar || 0) }}>
            <div className='u-plain__table'
              style={{ padding: `0 ${R_W}px 0 ${L_W}px` }}
              ref={el => this.bottomTable = el}
            >
              <div className="u-table-body" style={{ width: P_W && (P_W + 'px') }} >
                {bottomTable.plain}
              </div>
            </div>

            {bottomTable.left &&
              <div className={'u-fixed-left__table ' + (leftShadow ? 'shadow ' : '')}
                ref={this.fixedBottomHeight}
                style={{ width: L_W && (L_W + 'px') }}>
                <div className="u-table-body">{bottomTable.left}</div>
              </div>
            }

          </div>
        }
      </div>
    )
  }
}

Table.defaultProps = {
  columns: [],
  fixedRows: null,
  rows: null
}

export default Table