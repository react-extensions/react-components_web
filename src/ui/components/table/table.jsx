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
      signOffsetLeft: 0,  // 调整表格列宽时, 指示器样式
      leftShadow: false,
      topShadow: false,
      checkboxStatus: -1,
    }

    this.computeWidth = 0
    this.thMinWidth = []
    this.checkedList = []
    this.init()
    this.moveSign = this.moveSign.bind(this)
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

    this.widthList = widthList
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
  checkedRow(row, isChecked, rowIndex) {

    const oldList = this.checkedList
    
    oldList[rowIndex] = isChecked ? row : null

    const arr = []
    for (let i = 0, len = oldList.length; i < len; i++) {
      if(!oldList[i]) continue;
      arr.push(oldList[i])
    }
    const { rows, onSelectRowChange } = this.props
      , len = arr.length
      , max = rows.length
      , status = this.state.checkboxStatus
      
      let state = 3
      
    if (isChecked) {
      len >= max && (state = 1);
    } else {
      len === 0 && (state = -1);
    }

    (len < max && len > 0 && max !== 1 && status !== 0) && (state = 0);

    state !== 3 && this.setState({checkboxStatus: state})

    onSelectRowChange && onSelectRowChange(arr)
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

    const table = this.container
    // 记录调整的  1. 列索引  2. 初始位置
    this.resizeColIndex = index
    this.startOffsetLeft = e.clientX - table.offsetLeft + table.scrollLeft + 2

    document.addEventListener('mousemove', this.moveSign)
    document.addEventListener('mouseup', this.resizeCol)
  }
  // 修改指示器位置
  moveSign(e) {
    const table = this.container
    this.setState({ signOffsetLeft: e.clientX - table.offsetLeft + table.scrollLeft + 1 })
  }
  resizeCol() {
    document.removeEventListener('mousemove', this.moveSign)
    document.removeEventListener('mouseup', this.resizeCol)

    const offset = this.state.signOffsetLeft

    if (!offset) return

    const diff = offset - this.startOffsetLeft // 调整的宽度
      , index = this.resizeColIndex
      , oldWidth = this.widthList[index]
      // 根据每列的表头, 设置最小宽度
      , minWidth = this.thMinWidth[index] + 10
      // 容器宽度
      , containerWidth = (parseFloat(this.container.clientWidth) - this.yScrollBar || 0)

    let newWidth = oldWidth + diff

    if (newWidth < minWidth) newWidth = minWidth

    let newTotalWidth = this.computeWidth + newWidth - oldWidth

    if (containerWidth > newTotalWidth) {
      newWidth += containerWidth - newTotalWidth
      newTotalWidth = containerWidth
    }

    this.computeWidth = newTotalWidth

    this.widthList[index] = newWidth

    this.analyXscroll(containerWidth, newTotalWidth)

    this.getOffsetWidth()

    this.setState({ signOffsetLeft: 0 })
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
      , widthList = this.widthList
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

    const containerWidth = parseFloat(this.container.clientWidth) - this.yScrollBar || 0
      , { columns } = this.props
      , widthList = this.widthList

    let computeWidth = 0,
      hasZero = 0,
      cannotExpand = { width: 0 }

      ; (function () {
        let item = 0
        for (let i = 0, len = widthList.length; i < len; i++) {
          item = widthList[i]
          if (item === 0) hasZero++

          if (columns[i].cannotExpand) {
            cannotExpand.width += item
            cannotExpand[i] = true
          }
          computeWidth += item
        }
      }())


    // 如果表格 实际 大于 计算   diff > 0
    const diff = containerWidth - computeWidth,
      thMinWidth = this.thMinWidth

    let minWidth = 0,  // 每列最小宽度
      lastWidth = 0,    // 最终计算的列宽
      thMinItem = 0

    this.widthList = widthList.map((oldWidth, i) => {

      thMinItem = thMinWidth[i]

      //  对于 像 checkbox  和 expand 这种列  我没有获取 最小宽度,  其最小宽度在初始化时(constructor中) 已经被设置了

      minWidth = thMinItem ? thMinItem + 20 : oldWidth

      lastWidth = oldWidth

      if (diff > 0) {   // 实际 大于 计算  ==>> 自动扩展 列宽

        if (hasZero) { // 存在 没有设置宽度的 列  ==>>  将多余的平均分配
          if (oldWidth === 0) {
            lastWidth = diff / hasZero
          }
        } else {     // 不存在 没有设置宽度的列  ==>>  除了不允许扩展的列, 其他均匀分配 多出的

          if (!cannotExpand[i]) {
            lastWidth = oldWidth + diff * (oldWidth / (computeWidth - cannotExpand.width))
          }
        }

        if (lastWidth > oldWidth) {
          computeWidth += lastWidth - oldWidth
        }

      }

      // 最小宽度
      if (lastWidth < minWidth) {

        computeWidth += minWidth - lastWidth

        return minWidth
      }

      return lastWidth

    }) // End Map

    this.analyXscroll(containerWidth, computeWidth)

    this.computeWidth = computeWidth

    this.forceUpdate()
  }

  // 按照每列中最大宽度的td设置列宽
  resizeColToMax(index, newWidth) {

    const oldWidth = this.widthList[index]

    this.widthList[index] = oldWidth > newWidth ? oldWidth : newWidth

  }
  // 判断有没有竖直方向滚动条
  analyseScroll() {
    const track = this.trackEl
    if (track) {
      this.yScrollBar = track.offsetWidth - track.clientWidth
      this.xScrollBar = track.offsetHeight - track.clientHeight
    }

  }
  analyXscroll(max, cur) {
    this.xScrollBar = max < cur ? 17 : 0
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
    const status = this.state.checkboxStatus
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
                        : (th.type === 'expand' || th.type === 'index') ? null
                          : <span ref={this.initialized ? null : el => { if (!el) return; this.thMinWidth[th.__i__] = el.offsetWidth }} className='u-th-content' >
                            {th.label}
                            <i className='u-th-border' onMouseDown={e => this.prepareResizeCol(e, th.__i__)}></i>
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
    const { rows, zebra, emptyTip } = this.props
    const { syncHoverRow, syncExpandRow, checkboxStatus } = this.state

    return (
      (rows && rows.length > 0) ? (
        <table border='0' cellSpacing='0' cellPadding={0} >
          {columns}
          <tbody>
            {rows.map((tr, i) => (
              <Row
                key={'u-tr' + i}
                rowIndex={i}
                isFixed={tType !== 0}
                columns={cols}
                bgColor={zebra && (i % 2 === 0 ? 'lighten' : 'darken')}
                tr={tr}
                checkboxStatus={checkboxStatus}
                widthList={this.widthList}
                syncHoverRow={syncHoverRow}
                syncExpandRow={syncExpandRow}
                resizeColToMax={this.resizeColToMax}
                syncRow={needSync ? this.syncRow.bind(this) : null}
                onChecked={this.checkedRow}
              />
            ))}
          </tbody>
        </table>
      ) : tType === 0 ? (<div className='empty-table-tip'>{emptyTip || (<span className='empty-tip__span'>暂无数据</span>)}</div>) : null
    )
  }
  renderTable(cols, tType, needSync) {
    const list = this.widthList
    const columns = (
      <colgroup>
        {cols.map(item => (<col key={item.__i__} style={{ width: list[item.__i__] || 'auto' }}></col>))}
      </colgroup>
    )
    return {
      header: this.renderHeader(cols, columns, tType),
      body: this.renderBody(cols, columns, tType, needSync)
    }
  }

  render() {
    console.log('render')
    const
      { fixedLeft, fixedRight, plain } = this.columns
      , { fixedRows, scrollY } = this.props
      , { topShadow, leftShadow, signOffsetLeft } = this.state
      , needSync = fixedLeft.length || fixedRight.length
      , plainTable = this.renderTable(plain, 0, needSync)
      , leftTable = fixedLeft.length > 0 && this.renderTable(fixedLeft, -1, needSync)
      , rightTable = fixedRight.length > 0 && this.renderTable(fixedRight, 1, needSync)
      , offset = this.offsetWidth || {}
      , tableWidth = (this.computeWidth - (offset.left || 0) + (offset.right || 0)) + 'px' || 'auto'
      , fixedBottomTable = this.renderTable(plain, 0, fixedRows)

    let fixedTableHeight = 'auto'

    if (fixedLeft.length || fixedRight.length) {
      fixedTableHeight = scrollY ? (scrollY - (this.xScrollBar || 0) - (offset.bottom || 0)) + 'px' : 'auto'
    }


    return (
      <div className={'u-table__container ' + (this.props.className || '')} ref={el => { this.container = el }}>
        <div className="resize-col-sign" style={{ display: signOffsetLeft ? 'block' : 'none', left: signOffsetLeft }}></div>
        <div className='u-plain__table' >
          <div className={'u-header__track ' + (topShadow ? 'shadow ' : '')}
            style={{ padding: `0 ${offset.right || 0}px 0 ${offset.left || 0}px`, overflowY: this.yScrollBar ? 'scroll' : 'hiddren' }}
            ref={el => this.headerTrack = el}
          >
            <div className="u-table-header" style={{ width: tableWidth }}>
              {plainTable.header}
            </div>
          </div>

          <div className='u-body__track'
            style={{ height: (scrollY || 'auto') + 'px', padding: `0 ${offset.right || 0}px ${offset.bottom || 0}px ${offset.left || 0}px` }}
            ref={el => this.trackEl = el}
            onScroll={e => this.syncScroll(e)}
          >
            <div>
              <div className="u-table-body" style={{ width: tableWidth }} >
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