import React, { Component } from 'react'
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
 *        content: any
 *     },
 *     {
 *        width: 80,       // 列宽
 *        label: '',       // 表头文字
 *        prop: ''         // rows 中数据的属性
 *     }
 * ]
 * 
 */

class Sign extends Component {
  constructor(props) {
    super(props)
    this.state = {
      offset: 0,  // 调整表格列宽时, 指示器样式
      show: false
    }
    this.move = this.move.bind(this)
  }
  componentWillReceiveProps(nP) {
    if(nP.show !== this.props.show) {
      this.setState({show: nP.show})
      if(nP.show) {
        document.addEventListener('mousemove', this.move)
      } else {
        document.removeEventListener('mousemove', this.move)
        this.props.onResizeEnd(this.state.offset)
      }
    }
  }
   // 修改指示器位置
  move(e) {
    const C = this.props.container
    this.setState({ offset: e.clientX - C.offsetLeft + C.scrollLeft + 1 })
  }
  render() {
    const {show, offset} = this.state
    return <div className="resize-col-sign" style={{ display: show ? 'block' : 'none', left: offset }}></div>
  }
}


class Table extends Component {
  constructor(props) {
    super(props)

    this.state = {
      showSign: false,
      leftShadow: false,
      topShadow: false,
      syncData: {},
      checkStatus: -1,
    }

    this.tableWidth = { plain: 0, left: 0, right: 0 }
    this.thMinWidth = []
    this.checkedList = []
    this.init()
    this.endResize = this.endResize.bind(this)
    this.resizeCol = this.resizeCol.bind(this)
    this.checkedRow = this.checkedRow.bind(this)
    this.checkedAll = this.checkedAll.bind(this)
    this.resizeColToMax = this.resizeColToMax.bind(this)

  }
  init() {/* 数据预处理 */

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
          colWidth = col.width || 40
          this.checkState = (col.type === 'checkbox' ? 1 : 2)
          break;
        default:
          colWidth = col.width || 0
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
  checkedRow(row, isChecked, rowIndex, s) {
    const emit = this.props.onSelectRowChange

    if (s === 2) {
      emit(row)
      return
    }

    const oldList = this.checkedList

    oldList[rowIndex] = isChecked ? row : null

    const arr = []
    for (let i = 0, len = oldList.length; i < len; i++) {
      if (!oldList[i]) continue;
      arr.push(oldList[i])
    }
    const rows = this.props.rows
      , len = arr.length
      , max = rows.length
      , status = this.state.checkStatus

    let state = 3

    if (isChecked) {
      len >= max && (state = 1);
    } else {
      len === 0 && (state = -1);
    }

    (len < max && len > 0 && max !== 1 && status !== 0) && (state = 0);

    state !== 3 && this.setState({ checkStatus: state })

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

    topShadow !== top > 0 && this.setState({ topShadow: !topShadow })

    leftShadow !== left > 0 && this.setState({ leftShadow: !leftShadow })

  }
  /* ------------------- */
  /*->> 调整表格列大小 <<-*/
  /* ------------------- */
  prepareResizeCol(e, index, type) {
    e.preventDefault()
    e.stopPropagation()

    const table = this.container
    // 记录调整的  1. 列索引  2. 初始位置
    this.resizeData = { index, type, offset: e.clientX - table.offsetLeft + table.scrollLeft + 2 }
    this.setState({showSign: true})
    document.addEventListener('mouseup', this.endResize)
  }
  endResize() {
    document.removeEventListener('mouseup', this.endResize)
    this.setState({showSign: false})
  }
  resizeCol(offset) {

    const data = this.resizeData
      , oldWidth = this.widthList[data.index]
      // 根据每列的表头, 设置最小宽度
      , minWidth = this.thMinWidth[data.index]

    let newWidth = oldWidth + offset - data.offset

    newWidth < minWidth && (newWidth = minWidth)

    const { left, right, plain } = this.tableWidth
      , containerWidth = (parseFloat(this.container.clientWidth) - this.yScrollBar || 0)// 容器宽度
      , diff = newWidth - oldWidth  //位移差

    let subDiff = containerWidth - (left + right + plain + diff) // 新 总宽度

    if (subDiff > 0) { // 如果新总宽度 小于容器宽度, 禁止缩小
      newWidth += subDiff
    } else {
      subDiff = 0
    }

    this.tableWidth[data.type] += (diff + subDiff)

    this.widthList[data.index] = newWidth

    this.analyXscroll(subDiff)
    this.forceUpdate()
  }


  // 根据用户设置,计算表格列宽 及 总宽度
  computeColWidth() {

    const containerWidth = parseFloat(this.container.clientWidth) - this.yScrollBar || 0
      , { columns } = this.props
      , widthList = this.widthList

    let totalWidth = 0
      , hasZero = 0
      , cannotExpand = { width: 0 }

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
          if (oldWidth === 0) {
            lastWidth = diff / hasZero
          }
        } else {     // 不存在 没有设置宽度的列  ==>>  除了不允许扩展的列, 其他均匀分配 多出的

          if (!cannotExpand[i]) {
            lastWidth = oldWidth + diff * (oldWidth / (totalWidth - cannotExpand.width))
          }
        }

        // 最小宽度
        if (lastWidth < minWidth) {
          lastWidth = minWidth
        }

      }



      col = columns[i].fixed

      if (col === 'left') {
        leftW += lastWidth
      } else if (col === 'right') {
        rightW += lastWidth
      } else {
        plainW += lastWidth
      }

      return lastWidth

    }) // End Map

    this.analyXscroll(containerWidth - leftW - rightW - plainW)

    this.tableWidth = { left: leftW, right: rightW, plain: plainW }

    this.forceUpdate()
  }

  // 按照每列中最大宽度的td设置列宽
  resizeColToMax(index, newWidth) {

    this.widthList[index] = newWidth

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
    this.initialized = true
  }

  componentDidUpdate(prevP, prevS) {
    // rows 数据更新后, 重新设置col宽度
    if (prevP.rows !== this.props.rows) {
      this._initStructure()
    }


  }
  componentWillReceiveProps(nextP) {
    // 更新了 表头数据, 重新获取col宽
    if (nextP.columns !== this.props.columns) {
      this.initialized = false
    }
  }

  renderHeader(cols, columns) {
    const status = this.state.checkStatus
    return (
      <table border='0' cellSpacing='0' cellPadding={0} >
        {columns}
        <thead >
          <tr>
            {
              cols.map((th, i) => {
                return (
                  <th className={'u-th'} key={'u-th' + i} >
                    {
                      th.type === 'checkbox' ? <Icon type={status === 0 ? 'half-checked' : status > 0 ? 'check-fill' : 'check'} onClick={this.checkedAll} />
                        : (th.type === 'expand' || th.type === 'radio' || th.type === 'index') ? '#'
                          : <span ref={this.initialized ? null : el => { if (!el) return; this.thMinWidth[th.__i__] = el.offsetWidth + 20 }} className='u-th-content' >
                            {th.label}
                            <i className='u-th-border' onMouseDown={e => this.prepareResizeCol(e, th.__i__, th.fixed || 'plain')}></i>
                          </span>
                    }
                  </th>
                )
              })
            }
          </tr>
        </thead>
      </table>
    )
  }
  renderBody(cols, columns, tType, needSync) {
    const PROPS = this.props
      , { zebra, emptyTip } = PROPS
      , { syncData, checkStatus } = this.state
    let data = tType === -2 ? PROPS.fixedRows : PROPS.rows
    return (
      (data && data.length > 0) ? (
        <table border='0' cellSpacing='0' cellPadding={0} >
          {columns}
          <tbody>
            {data.map((tr, i) => (
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
                resizeColToMax={this.resizeColToMax}
                syncData={syncData}
                syncRow={needSync ? this.syncRow.bind(this) : null}
                onChecked={this.checkedRow}
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
      , plainT = this.renderBody(plain, this.renderColumns(plain), -2, false)

    let left = null
      , right = null
    if (fixedLeft) {
      left = this.renderBody(fixedLeft, this.renderColumns(fixedLeft), -2, false)
    }
    if (fixedRight) {
      right = this.renderBody(fixedRight, this.renderColumns(fixedRight), -2, false)
    }
    return { plain: plainT, left, right }
  }
  render() {
    // console.log('render')
    const
      { fixedLeft, fixedRight, plain } = this.columns
      , { fixedRows, scrollY } = this.props
      , { topShadow, leftShadow, rightShadow, showSign } = this.state

      , hasFixed = fixedLeft || fixedRight

      , plainTable = this.renderTable(plain, 0, hasFixed)
      , leftTable = fixedLeft && this.renderTable(fixedLeft, -1, hasFixed)
      , rightTable = fixedRight && this.renderTable(fixedRight, 1, hasFixed)

      , TW = this.tableWidth
      , P_W = TW.plain
      , L_W = TW.left
      , R_W = TW.right
      , B_H = fixedRows ? 50 : 0
      , fixedTableHeight = (hasFixed && scrollY) ? (scrollY - (this.xScrollBar || 0) - B_H) + 'px' : 'auto'
      , bottomTable = fixedRows ? this.renderBottom() : null

    return (
      <div className={'u-table__container ' + (this.props.className || '')} ref={el => { this.container = el }}>
        <Sign container={this.container} show = {showSign} onResizeEnd={this.resizeCol}/>
        <div className='u-plain__table'>
          <div className={'u-header__track ' + (topShadow ? 'shadow ' : '')}
            style={{ padding: `0 ${R_W}px 0 ${L_W}px`, overflowY: this.yScrollBar ? 'scroll' : 'hiddren' }}
            ref={el => this.headerTrack = el}
          >
            <div className="u-table-header" style={{ width: P_W && (P_W + 'px') }}>{plainTable.header}</div>
          </div>

          <div className='u-body__track'
            style={{ height: (scrollY || 'auto') + 'px', padding: `0 ${R_W}px ${B_H}px ${L_W}px` }}
            ref={el => this.trackEl = el}
            onScroll={e => this.syncScroll(e)}
          >
            <div className="u-table-body" style={{ width: P_W && (P_W + 'px') }}>{plainTable.body}</div>
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
          <div className='u-fixed-bottom__table' style={{ bottom: (this.xScrollBar || 0) + 'px' }}>
            <div className='u-plain__table'
              style={{ padding: `0 ${R_W}px 0 ${L_W}px`, overflowY: this.yScrollBar ? 'scroll' : 'hiddren' }}
              ref={el => this.bottomTable = el}
            >
              <div className="u-table-body" style={{ width: P_W && (P_W + 'px') }} >
                {bottomTable.plain}
              </div>
            </div>

            {bottomTable.left &&
              <div className={'u-fixed-left__table ' + (leftShadow ? 'shadow ' : '')} style={{ width: L_W && (L_W + 'px') }}>
                <div className="u-table-body">{bottomTable.left}</div>
              </div>
            }

          </div>
        }
      </div>
    )
  }
}

export default Table