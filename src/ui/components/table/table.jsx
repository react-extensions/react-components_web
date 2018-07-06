import React from 'react'
import './table.scss'
import Icon from '../icon/icon'
import Row from './row'

/**
 * @param rows[Array]    {表格数据}
 * @param tbodyHeight     {tbody高度}
 * @param zebra[Boolean]  {表格行斑马线显示}
 * @param columns = [
 *      {
 *          filter: function () {}  // 对表格中的数据进行操作, 参数为表格中的数据, 返回值将被显示
 *      },
 *     {
 *        type: 'index',
 *        fixed: true,     // 让此列固定不左右滚动
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
class Table extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      widthList: [],     // 每一列宽度
      signOffsetLeft: 0,  // 调整表格列宽时, 指示器样式
      leftShadow: false,
      topShadow: false,
      checkboxStatus: -1,
    }

    this.computeWidth = 0
    this.thMinWidth = []
    this.checkedList = []

    this.state.widthList = this.init()
    this.resizeColToMax = this.resizeColToMax.bind(this)
    this.moveSign = this.moveSign.bind(this)
    this.resizeCol = this.resizeCol.bind(this)
    this.checkedAll = this.checkedAll.bind(this)
    this.checkedRow = this.checkedRow.bind(this)
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
          col.cannotExpand = true
          colWidth = col.width || 40
          break;
        default:
          colWidth = col.width || 0
          break;
      }
      col.__i__ = i

      if (col.fixedLeft) {
        fixedLeft.push(col)
      } else if (col.fixedRight) {
        fixedRight.push(col)
      } else {
        plain.push(col)
      }
      widthList.push(colWidth)
    }

    this.columns = { fixedLeft, plain, fixedRight }

    return widthList
  }
  /* ------------------- */
  /* --->> 多选表格 <<--- */
  /* ------------------- */
  // 全部选中, 不选中
  checkedAll() {
    const { rows, onSelectRowChange } = this.props
    const bool = this.state.checkboxStatus === 1
    this.setState({ checkboxStatus: bool ? -1 : 1 })
    this.checkedList = bool || (!rows || rows.length === 0) ? [] : [...rows]
    onSelectRowChange && onSelectRowChange(this.checkedList)
  }
  // 单行选中, 不选中
  checkedRow(row, isChecked) {
    let list = this.checkedList
    const { rows, onSelectRowChange } = this.props
    const max = rows.length

    if (isChecked) { // 选中
      list = list.concat([row]);
      (list.length >= max) && this.setState({ checkboxStatus: 1 })
    } else {
      list = list.filter(obj => {
        for (let prop in obj) {
          if (obj[prop] !== row[prop]) {
            return true
          }
        }
        return false
      });

      ; (list.length < max) && this.setState({ checkboxStatus: 0 })
    }

    this.checkedList = list
    onSelectRowChange && onSelectRowChange(list)
  }
  syncScroll(e) {
    const left = e.currentTarget.scrollLeft
    this.headerTrack.scrollLeft = left

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
  prepareResizeCol(e, index) {
    e.preventDefault()
    e.stopPropagation()

    const table = this.table
    // 记录调整的  1. 列索引  2. 初始位置
    this.resizeColIndex = index
    this.startOffsetLeft = e.clientX - table.offsetLeft + table.scrollLeft + 2

    document.addEventListener('mousemove', this.moveSign)
    document.addEventListener('mouseup', this.resizeCol)
  }
  // 修改指示器位置
  moveSign(e) {
    const table = this.table
    this.setState({ signOffsetLeft: e.clientX - table.offsetLeft + table.scrollLeft + 1 })
  }
  resizeCol() {
    document.removeEventListener('mousemove', this.moveSign)
    document.removeEventListener('mouseup', this.resizeCol)

    const { signOffsetLeft, widthList } = this.state

    if (!signOffsetLeft) return

    const diff = signOffsetLeft - this.startOffsetLeft,  // 调整的宽度

      index = this.resizeColIndex,

      // 根据每列的表头, 设置最小宽度
      minWidth = this.thMinWidth[index] + 10,
      // 容器宽度
      containerWidth = (parseFloat(this.table.clientWidth) - this.yScrollBar || 0)

    let newWidth = widthList[index] + diff

    if (newWidth < minWidth) newWidth = minWidth

    let newTotalWidth = this.computeWidth + newWidth - widthList[index]

    if (containerWidth > newTotalWidth) {
      newWidth += containerWidth - newTotalWidth
      newTotalWidth = containerWidth
    }
    this.analyseScroll()

    this.computeWidth = newTotalWidth

    this.setState({
      widthList: widthList.map((item, i) => (i === index ? newWidth : item)),
      signOffsetLeft: 0
    })

  }
  /* ------------------- */
  /* -->> 同步表格行 <<-- */
  /* ------------------- */
  syncRow(type, rowIndex, colIndex) {

    if (type === 'hover') {
      this.setState({ syncHoverRow: rowIndex })
    } else {
      this.setState({ syncExpandRow: { rowIndex, colIndex } })
    }
  }
  // 获取 左右 固定列的宽度
  getOffsetWidth() {
    const { fixedLeft, fixedRight } = this.columns
      , widthList = this.state.widthList
      , fixed = {}
    function getWidth(cols) {
      let total = 0
      for (let i = 0, len = cols.length; i < len; i++) {
        total += widthList[cols[i].__i__]
      }
      return total
    }
    if (fixedLeft.length) fixed.left = getWidth(fixedLeft)
    if (fixedRight.length) fixed.right = getWidth(fixedRight)
    if (this.props.fixedRows && this.props.fixedRows.length) fixed.bottom = 50

    this.offsetWidth = fixed

  }


  // 根据用户设置,计算表格列宽 及 总宽度
  computeColWidth() {

    const containerWidth = parseFloat(this.table.clientWidth) - this.yScrollBar || 0,
      { widthList } = this.state,
      { columns } = this.props

    let computeWidth = 0,
      hasZero = 0,
      cannotExpand = { width: 0 }

    for (let i = 0, len = widthList.length; i < len; i++) {

      if (widthList[i] === 0) hasZero++

      if (columns[i].cannotExpand) {
        cannotExpand.width += widthList[i]
        cannotExpand[i] = true
      }

      computeWidth += widthList[i]

    }

    // 如果表格 实际 大于 计算   diff > 0
    const diff = containerWidth - computeWidth,
      thMinWidth = this.thMinWidth,
      tdMinWidth = this.tdMinWidth

    let minWidth = 0,  // 每列最小宽度
      lastWidth = 0,    // 最终计算的列宽
      thMinItem = 0


    const newState = {
      widthList: widthList.map((userWidth, i) => {

        thMinItem = thMinWidth[i]

        //  对于 像 checkbox  和 expand 这种列  我没有获取 最小宽度,  其最小宽度在初始化时(constructor中) 已经被设置了
        minWidth = thMinItem ? ((tdMinWidth && tdMinWidth[i] && tdMinWidth[i] > thMinItem + 20) ? tdMinWidth[i] : thMinItem + 20) : userWidth
        lastWidth = userWidth

        if (diff > 0) {   // 实际 大于 计算  ==>> 自动扩展 列宽

          if (hasZero) { // 存在 没有设置宽度的 列  ==>>  将多余的平均分配
            if (userWidth === 0) {
              lastWidth = diff / hasZero
            }
          } else {     // 不存在 没有设置宽度的列  ==>>  除了不允许扩展的列, 其他均匀分配 多出的

            if (!cannotExpand[i]) {
              lastWidth = userWidth + diff * (userWidth / (computeWidth - cannotExpand.width))
            }
          }

          if (lastWidth > userWidth) {
            computeWidth += lastWidth - userWidth
          }

        }

        // 最小宽度
        if (lastWidth < minWidth) {

          computeWidth += minWidth - lastWidth

          return minWidth
        }

        return lastWidth

      }) // End Map
    }

    this.xScrollBar = containerWidth < computeWidth ? 17 : 0

    this.computeWidth = computeWidth

    this.setState(newState)
  }

  // 按照每列中最大宽度的td设置列宽
  resizeColToMax(index, width) {

    if (!this.tdMinWidth) {
      this.tdMinWidth = []
    }

    const col = this.tdMinWidth[index]

    this.tdMinWidth[index] = !col ? width : col > width ? col : width

  }
  // 判断有没有竖直方向滚动条
  analyseScroll() {
    const track = this.trackEl
    if (track) {
      this.yScrollBar = track.offsetWidth - track.clientWidth
      this.xScrollBar = track.offsetHeight - track.clientHeight
    }

  }
  _initStructure() {

    this.analyseScroll()
    // 初始化 横向结构, 列宽,
    this.computeColWidth()

    this.getOffsetWidth()
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
    const { checkboxStatus } = this.state
    return (
      <table border='0' cellSpacing='0' cellPadding={0} >
        {columns}
        <thead >
          <tr>
            {
              cols.map((th, i) => {
                return (
                  <th className={'th'} key={'th' + i} >
                    {
                      th.type === 'checkbox' ? <Icon type={checkboxStatus > 0 ? 'check-fill' : 'check'} onClick={this.checkedAll} />
                        : (th.type === 'expand' || th.type === 'index') ? null
                          : <span ref={this.initialized ? null : el => { if (!el) return; this.thMinWidth[th.__i__] = el.offsetWidth }} className='th-content' >
                            {th.label}
                            <i className='th-border' onMouseDown={e => this.prepareResizeCol(e, th.__i__)}></i>
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
  renderBody(cols, columns, tType) {
    const { rows, zebra, emptyTip } = this.props
    const { widthList, syncHoverRow, syncExpandRow, checkboxStatus } = this.state

    return (
      (rows && rows.length > 0) ? (
        <table border='0' cellSpacing='0' cellPadding={0} >
          {columns}
          <tbody className='tbody'>
            {rows.map((tr, i) => (
              <Row
                key={'tr' + i}
                rowIndex={i}
                fixedTable={tType !== 0}
                columns={cols}
                bgColor={zebra && (i % 2 === 0 ? 'lighten' : 'darken')}
                tr={tr}
                checkboxStatus={checkboxStatus}
                widthList={widthList}
                syncHoverRow={syncHoverRow}
                syncExpandRow={syncExpandRow}
                resizeColToMax={this.resizeColToMax}
                syncRow={this.syncRow.bind(this)}
                onChecked={this.checkedRow}
              />
            ))}
          </tbody>
        </table>
      ) : tType === 0 ? (<div className='empty-table-tip'>{emptyTip || (<span className='empty-tip__span'>暂无数据</span>)}</div>) : null
    )
  }
  renderTable(cols, tType) {
    const list = this.state.widthList
    const columns = (
      <colgroup>
        {cols.map(item => (<col key={item.__i__} style={{ width: list[item.__i__] || 'auto' }}></col>))}
      </colgroup>
    )
    return {
      header: this.renderHeader(cols, columns, tType),
      body: this.renderBody(cols, columns, tType)
    }
  }

  render() {
    const
      { fixedLeft, fixedRight, plain } = this.columns
      , { fixedRows, scrollY } = this.props
      , { topShadow, leftShadow, signOffsetLeft } = this.state
      , plainTable = this.renderTable(plain, 0)
      , leftTable = fixedLeft.length > 0 && this.renderTable(fixedLeft, -1)
      , rightTable = fixedRight.length > 0 && this.renderTable(fixedRight, 1)
      , offset = this.offsetWidth || {}
      , tableWidth = (this.computeWidth - (offset.left || 0) + (offset.right || 0)) + 'px' || 'auto'
      , fixedBottomTable = this.renderTable(plain, 0, fixedRows)

      let fixedTableHeight = 'auto'

    if (fixedLeft.length || fixedRight.length) {
      fixedTableHeight = scrollY ? (scrollY - (this.xScrollBar || 0) - (offset.bottom || 0) - 1) + 'px' : 'auto'
    }


    return (
      <div className={'u-table__container ' + (this.props.className || '')} ref={el => this.table = el}>
        <div className="resize-col-sign" style={{ display: signOffsetLeft ? 'block' : 'none', left: signOffsetLeft }}></div>
        <div className='u-plain__table' >
          <div className={'u-header__track ' + (topShadow ? 'shadow ' : '')}
            style={{ padding: `0 ${offset.right || 0}px 0 ${offset.left || 0}px`, overflowY: this.yScrollBar ? 'scroll' : 'hiddren' }}
            ref={el => this.headerTrack = el}
          >
            <div className="u-table-header" style={{width:tableWidth }}>
              {plainTable.header}
            </div>
          </div>

          <div className='u-body__track'
            style={{ height: (scrollY || 'auto') + 'px', padding: `0 ${offset.right || 0}px ${offset.bottom || 0}px ${offset.left || 0}px` }}
            ref={el => this.trackEl = el}
            onScroll={e => this.syncScroll(e)}
          >
            <div>
              <div className="u-table-body" style={{width:tableWidth }} >
                {plainTable.body}
              </div>
            </div>

          </div>
        </div>

        {leftTable &&
          <div className={'u-fixed-left__table ' + (leftShadow ? 'shadow ' : '')} >
            <div className={'u-table-header ' + (topShadow ? 'shadow ' : '')}>
              {leftTable.header}
            </div>
            <div className="u-table-body"
              style={{ height: fixedTableHeight }}
              ref={el => this.leftTbody = el}
            >
              {leftTable.body}
            </div>
          </div>
        }
        {rightTable &&
          <div className='u-fixed-right__table' >
            <div className="u-table-header">
              {rightTable.header}
            </div>
            <div className="u-table-body"
              style={{ height: fixedTableHeight }}
              ref={el => this.rightTbody = el}
            >
              {rightTable.body}
            </div>
          </div>
        }
        {
          <div className='u-fixed-bottom__table' style={null}>

          </div>
        }
      </div>
    )
  }
}

export default Table