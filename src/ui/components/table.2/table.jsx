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
      checkedStatus: 0,  // 0 有的选中, 有的没选中  -1 全没选中   1 全选中
      placeholder: false, // 表格头占位符, 当tbody滚动时, 需要这个, 用来让表格头和tbody的每一列宽度一致
      computeWidth: 0,    // 计算的表格宽度
      signOffsetLeft: 0,  // 调整表格列宽时, 指示器样式
      syncHoverRow: -1,     // 当有 固定列时, 用于表格行数据同步
      syncExpandRow: {},
      showShadow: false   // 固定列阴影
    }

    this.checkedList = []
    this.thMinWidth = []
    this.hasFixed = false

    this.plainCols = []
    this.fixedLeftCols = []

    // 计算表格每列宽度
    let colWidth = 0,
      col = null
    const columns = props.columns,
      widthList = this.state.widthList // 防止 父组件更新影响内部

    for (let i = 0, len = columns.length; i < len; i++) {
      col = columns[i]
      switch (col.type) {
        case 'checkbox':
        case 'expand':
        case 'index':
          col.cannotExpand = true
          colWidth = col.width =  col.width || 40
          break;
        default:
        colWidth = col.width =  col.width || 0
          break;
      }
      if (col.fixedLeft) {
        this.fixedLeftCols.push(col)
      } else {
        this.plainCols.push(col)
      }
      widthList.push(parseFloat(colWidth))
    }

    this.checkedRow = this.checkedRow.bind(this)
    this.moveSign = this.moveSign.bind(this)
    this.resizeCol = this.resizeCol.bind(this)
    this.showScrollXSign = this.showScrollXSign.bind(this)
  }
  /**
   * 多选表格
   */
  // 全部选中, 不选中
  checkedAll() {
    const { rows, onSelectRowChange } = this.props
    const bool = this.state.checkedStatus === 1
    this.setState({ checkedStatus: bool ? -1 : 1 })
    this.checkedList = bool ? [] : [...rows]
    onSelectRowChange && onSelectRowChange(this.checkedList)
  }
  // 单行选中, 不选中
  checkedRow(row, isChecked) {
    let list = this.checkedList
    const { rows, onSelectRowChange } = this.props
    const max = rows.length

    if (isChecked) { // 选中
      list = list.concat([row]);
      (list.length >= max) && this.setState({ checkedStatus: 1 })
    } else {
      list = list.filter(obj => {
        for (let prop in obj) {
          if (obj[prop] !== row[prop]) {
            return true
          }
        }
        return false
      });

      ; (list.length < max) && this.setState({ checkedStatus: 0 })
    }

    this.checkedList = list
    onSelectRowChange && onSelectRowChange(list)
  }
  /**
   * 同步表格行
   */
  syncRow(type, rowIndex, colIndex) {

    if (type === 'hover') {
      this.setState({ syncHoverRow: rowIndex })
    } else {
      this.setState({ syncExpandRow: { rowIndex, colIndex } })
    }
  }
  /**
   * 表格有固定列时, 当左右滚动时, 给固定列添加阴影
   */
  showScrollXSign(e) {
    this.setState({ showShadow: e.currentTarget.scrollLeft > 0 })
  }
  /**
   * 上下滚动
   */
  scrollBody(e) {
    this.fixedBody.scrollTop = e.currentTarget.scrollTop
  }
  /**
   * 调整表格列大小
   */
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

    const { signOffsetLeft, widthList, computeWidth } = this.state

    if (!signOffsetLeft) return

    const diff = signOffsetLeft - this.startOffsetLeft,  // 调整的宽度

      index = this.resizeColIndex,

      // 根据每列的表头, 设置最小宽度
      minWidth = this.thMinWidth[index] + 10,
      // 容器宽度
      containerWidth = parseFloat(this.table.clientWidth)

    let newWidth = widthList[index] + diff

    if (newWidth < minWidth) newWidth = minWidth

    let newTotalWidth = computeWidth + newWidth - widthList[index]

    if (containerWidth > newTotalWidth) {
      newWidth += containerWidth - newTotalWidth
      newTotalWidth = containerWidth
    }

    this.setState({
      widthList: widthList.map((item, i) => (i === index ? newWidth : item)),
      computeWidth: newTotalWidth,
      signOffsetLeft: 0
    })

  }

  // 按照每列中最大宽度的td设置列宽
  resizeColToMax(index, width) {
    if (!this.tdMinWidth) {
      this.tdMinWidth = {}
    }

    const col = this.tdMinWidth[index]

    this.tdMinWidth[index] = !col ? width : col > width ? col : width

  }

  // 根据用户设置,计算表格列宽 及 总宽度
  computeTableWidth() {
    /**
     * 用户通过thead设置 每列宽度
     * 默认将按照用户设置宽度渲染表格
     * 1.1 将所有 用户设置的 列宽相加 得到 计算宽度 computeWidth
     * 1.2 表格所在容器 实际宽度  containerWidth
     * 
     * 2.1 如果 实际宽度 大于 计算宽度, 则获取 多出的差值  平均分配给每一列,  以填充满容器
     * 2.1.1 如果 存在没有被用户设置值 列, 获取此种列的数量, 将多出的差值 平均分配 给这些列
     * 2.1.2 如果 不存在, 将多出的差值 平均分配 给每一列 (除了类型是 checkbox 或 expand 的列)
     * 
     * 2.2 如果 计算宽度 大于 实际宽度, 默认使用  用户设置的列宽
     * 2.2.1 如果 用户 没有设置 该列的值, 以最小宽度设置该列的值
     * 
     */

    const containerWidth = parseFloat(this.table.clientWidth),
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



    newState.computeWidth = computeWidth

    return newState
  }
  _initStructure() {
    const newState = this.computeTableWidth()

    const body = this.normalBody

    if (body) {
      const offset = body.offsetWidth - body.clientWidth
      newState.placeholder = offset > 0 ? offset : false
      newState.computeWidth += offset > 0 ? offset : 0
    }

    this.setState(newState)
  }
  componentDidMount() {
    this._initStructure()
    // this.initialized = true
  }

  componentDidUpdate(prevP) {
    /* const {rows, columns} = this.props

    if (prevP.rows !== rows) {
      this._initStructure()
    }
    if(prevP.columns !== columns) {
      this.initialized = false
    } */
  }

  render() {
    const { className, rows, tbodyHeight, zebra, columns, emptyTip } = this.props
    const { placeholder, checkedStatus, computeWidth, widthList, signOffsetLeft, syncHoverRow, syncExpandRow, showShadow } = this.state
    const hasFixed = this.hasFixed

    if (!columns) return

    const renderCol = function (cols) {
      return (
        <colgroup>
          {cols.map((item, i) => (<col key={i} style={{ width: item.width }}></col>))}
          {placeholder && <col width={placeholder} style={{ width: placeholder }}></col>}
        </colgroup>
      )
    }
    

    const renderTable = function (type, cols) {
      return (
        <div className='u-table'>
          <div className="table-thead" >
            <table border='0' cellSpacing='0' cellPadding={0} >
              {renderCol(cols)}
              <thead>
                <tr>
                  {
                    cols.map((th, i) => {
                      return (
                        <th className={'th'} key={'th' + i} >
                          {
                            th.type === 'checkbox' ? <Icon type={checkedStatus === 1 ? 'check-fill' : 'check'} onClick={this.checkedAll.bind(this)} />
                              : (th.type === 'expand' || th.type === 'index') ? null
                                : (
                                  <span className='th-content' ref = {this.initialized ? null : el => {if(!el) return; this.thMinWidth[i] = el.offsetWidth}}>
                                    {th.label}
                                    <i className='th-border' onMouseDown={e => this.prepareResizeCol(e, i)}></i>
                                  </span>
                                )
                          }
                        </th>
                      )
                    })
                  }
                </tr>
              </thead>
            </table>
          </div>
          <div className="table-tbody" style={{ height: tbodyHeight }} >
            <table border='0' cellSpacing='0' cellPadding={0} >
                  {renderCol(cols)}
                  <tbody className='tbody'>
                    {rows.map((tr, i) => (
                      <Row key={'tr' + i}
                        rowIndex={i}
                        fixedTable={type === 0}
                        columns={cols} tr={tr}
                        onChecked={this.checkedRow}
                        checkedStatus={checkedStatus}
                        bgColor={zebra && (i % 2 === 0 ? 'lighten' : 'darken')}
                        widthList={widthList}
                        resizeColToMax={this.resizeColToMax.bind(this)}
                        syncRow={hasFixed ? this.syncRow.bind(this) : null}
                        syncHoverRow={syncHoverRow}
                        syncExpandRow={syncExpandRow}
                      />
                    ))}
                  </tbody>
                </table>
          </div>

        </div>
      )
    }


    return (
      <div className={'u-table__wrap ' + (className || '')} ref={el => this.table = el}>

        <div className="resize-col-sign" style={{ display: signOffsetLeft ? 'block' : 'none', left: signOffsetLeft }}></div>

        <div className='u-table__track' style={{padding: ' 0 0 0 40px'}}>

          <div className='fixed-left__table'>
            {renderTable.call(this, -1, this.fixedLeftCols)}
          </div>

          <div className='plain__table' style={{width: computeWidth}}>
            {renderTable.call(this, 0, this.plainCols)}
          </div>

        </div>
      </div>
    )
  }
}

export default Table