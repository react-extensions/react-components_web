import React from 'react'
import './table.scss'
import Icon from '../icon/icon'
import Row from './row'
import { Object } from 'core-js';

/**
 * @param rows[Array]    {表格数据}
 * @param tbodyHeight     {tbody高度}
 * @param zebra[Boolean]  {表格行斑马线显示}
 * @param columns = [
 *      {
 *          filter: function () {}  // 对表格中的数据进行操作, 参数为表格中的数据, 返回值将被显示
 * cannotExpand // 不允许扩展
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
      widthList: {},     // 每一列宽度
      checkedStatus: 0,  // 0 有的选中, 有的没选中  -1 全没选中   1 全选中
      placeholder: false, // 表格头占位符, 当tbody滚动时, 需要这个, 用来让表格头和tbody的每一列宽度一致
      compute: {},    // 计算的表格宽度
      signOffsetLeft: 0,  // 调整表格列宽时, 指示器样式
      syncHoverRow: -1,     // 当有 固定列时, 用于表格行数据同步
      syncExpandRow: {},
      showShadow: false   // 固定列阴影
    }

    this.checkedList = []
    this.thMinWidth = {}

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
          colWidth = col.width || 40
          break;
        default:
          colWidth = col.width || 0
          break;
      }
      if (col.fixedLeft) {
        this.fixedLeftCols.push(col)
      } else {
        this.plainCols.push(col)
      }
      widthList[col.prop || col.type] = parseFloat(colWidth)
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

    const table = this.wrap
    // 记录调整的  1. 列索引  2. 初始位置
    this.resizeColIndex = index
    this.startOffsetLeft = e.clientX - table.offsetLeft + table.scrollLeft + 2

    document.addEventListener('mousemove', this.moveSign)
    document.addEventListener('mouseup', this.resizeCol)
  }
  // 修改指示器位置
  moveSign(e) {
    const table = this.wrap
    this.setState({ signOffsetLeft: e.clientX - table.offsetLeft + table.scrollLeft + 1 })
  }
  resizeCol() {
    document.removeEventListener('mousemove', this.moveSign)
    document.removeEventListener('mouseup', this.resizeCol)

    const { signOffsetLeft, widthList, compute } = this.state

    if (!signOffsetLeft) return

    const diff = signOffsetLeft - this.startOffsetLeft,  // 调整的宽度

      index = this.resizeColIndex,

      // 根据每列的表头, 设置最小宽度
      minWidth = this.thMinWidth[index] + 10,
      // 容器宽度
      containerWidth = parseFloat(this.wrap.clientWidth)

    let newWidth = widthList[index] + diff

    if (newWidth < minWidth) newWidth = minWidth

    let newTotalWidth = compute.tableWidth + newWidth - widthList[index]

    if (containerWidth > newTotalWidth) {
      newWidth += containerWidth - newTotalWidth
      newTotalWidth = containerWidth
    }
    const obj = {}
    obj[index] = newWidth
    this.setState({
      widthList: Object.assign({}, widthList, obj),
      compute: Object.assign({}, compute, {tableWidth: newTotalWidth}),
      signOffsetLeft: 0
    })

  }

  // 按照每列中最大宽度的td设置列宽
  resizeColToMax(prop, width) {
    if (!this.tdMinWidth) {
      this.tdMinWidth = {}
    }

    const col = this.tdMinWidth[prop]

    this.tdMinWidth[prop] = !col ? width : col > width ? col : width

  }

  // 根据用户设置,计算表格列宽 及 总宽度
  computeTableWidth() {
    /**
     * 用户通过thead设置 每列宽度
     * 默认将按照用户设置宽度渲染表格
     * 1.1 将所有 用户设置的 列宽相加 得到 计算宽度 compute.tableWidth
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

    const containerWidth = parseFloat(this.wrap.clientWidth),
      { widthList } = this.state,
      { columns } = this.props,
      cannotExpand = { width: 0 },
      fixed = {}

    let compute = {pLeft: 0, pRight: 0, pBottom: 0, tableWidth: 0},
      hasZero = 0,
      prop = null,
      widthItem = 0,
      colItem

    for (let i = 0, len = columns.length; i < len; i++) {
      colItem = columns[i]
      prop = colItem.prop || colItem.type

      widthItem = widthList[prop]
      if (widthItem === 0) hasZero++

      if (colItem.cannotExpand) {
        cannotExpand.width += widthItem
        cannotExpand[prop] = true
      }
      
      if(colItem.fixedLeft) {
        fixed[prop] = -1
        compute.pLeft += widthItem
      } else if(colItem.fixedRight) {
        fixed[prop] = 1
        compute.right += widthItem
      } else {
        fixed[prop] = '0'
        compute.tableWidth += widthItem
      }
    }


    // 如果表格 实际 大于 计算   diff > 0
    const diff = containerWidth - compute.tableWidth,
      thMinWidth = this.thMinWidth,
      tdMinWidth = this.tdMinWidth

    let minWidth = 0,  // 每列最小宽度
      lastWidth = 0,    // 最终计算的列宽
      userWidthItem = 0,
      thMinItem = 0,
      tdMinItem = 0

    const newWidthList = {}

    for (let prop in widthList) {
      thMinItem = thMinWidth[prop]
      tdMinItem = (tdMinWidth && tdMinWidth[prop]) || -1
      userWidthItem = widthList[prop]


      minWidth = thMinItem ? (tdMinItem > (thMinItem + 20) ? tdMinItem : thMinItem + 20) : userWidthItem

      lastWidth = userWidthItem

      if (diff > 0) {   // 实际 大于 计算  ==>> 自动扩展 列宽

        if (hasZero) { // 存在 没有设置宽度的 列  ==>>  将多余的平均分配
          if (userWidthItem === 0) {
            lastWidth = diff / hasZero
          }
        } else {     // 不存在 没有设置宽度的列  ==>>  除了不允许扩展的列, 其他均匀分配 多出的

          if (!cannotExpand[prop]) {
            lastWidth = userWidthItem + diff * (userWidthItem / (compute.tableWidth - cannotExpand.width))
          }
        }
        if (lastWidth > userWidthItem) {
          let diff = lastWidth - userWidthItem
          if(fixed[prop] === -1) {
            console.log(123)
            compute.pLeft += diff
          } else if(fixed[prop] === 1) {
            compute.pRight += diff
          } else {
            compute.tableWidth += diff
          }
        }

      }

      // 最小宽度
      if (lastWidth < minWidth) {
         let diff = minWidth - lastWidth
          if(fixed[prop] === -1) {
            console.log(123)
            compute.pLeft += diff
          } else if(fixed[prop] === 1) {
            compute.pRight += diff
          } else {
            compute.tableWidth += diff
          }
        lastWidth = minWidth
      }
      newWidthList[prop] = lastWidth
    }
    return { widthList: newWidthList, compute }
  }
  _initStructure() {
    const newState = this.computeTableWidth()

    // 如果表格需要滚动才进行以下操作
    if (this.props.tbodyHeight) {

      // 判断有没有竖直方向滚动条
      const tbody = this.plainTbody

      if (tbody) {
        const offset = tbody.offsetWidth - tbody.clientWidth
        newState.placeholder = offset > 0 ? offset : false
        newState.compute.tableWidth += offset > 0 ? offset : 0
      }

      // 判断有没有水平方向滚动条
      const pTable = this.plainTable

      if (pTable) {
        this.xAxisBlank = pTable.offsetHeight - pTable.clientHeight + 1
      }

      // 判断底部 有没有固定行
      if (this.props.fixedRows) {
        this.fixedRowsHeight = 50
        //  if(Object.prototype.toString.call(fixedRows) === '[object Array]') {
      }

    }

    this.setState(newState)
  }
  componentDidMount() {
    this._initStructure()
    this.initialized = true
  }


  componentDidUpdate(prevP) {
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
  render() {
    const { className, rows, tbodyHeight, zebra, columns, emptyTip } = this.props
    const { placeholder, checkedStatus, compute, widthList, signOffsetLeft, syncHoverRow, syncExpandRow, showShadow } = this.state

    if (!columns) return

    const renderCol = function (cols) {
      return (
        <colgroup>
          {cols.map((item, i) => (<col key={i} style={{ width: widthList[item.type || item.prop] }}></col>))}
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
                                  <span className='th-content' ref={this.initialized ? null : el => { if (!el) return; this.thMinWidth[th.type || th.prop] = el.offsetWidth }}>
                                    {th.label}
                                    <i className='th-border' onMouseDown={e => this.prepareResizeCol(e, th.type || th.prop)}></i>
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
                    syncRow={this.fixedLeftCols ? this.syncRow.bind(this) : null}
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
      <div className={'u-table__wrap ' + (className || '')} ref={el => this.wrap = el}>

        <div className="resize-col-sign" style={{ display: signOffsetLeft ? 'block' : 'none', left: signOffsetLeft }}></div>

        <div className='u-table__track' style={{ paddingLeft:compute.pLeft+'px', paddingRight: compute.pRight+'px' }}>

          { this.fixedLeftCols &&
            <div className='fixed-left__table'>
              {renderTable.call(this, -1, this.fixedLeftCols)}
            </div>
          }


          <div className='plain__table' style={{ width: compute.tableWidth }}>
            {renderTable.call(this, 0, this.plainCols)}
          </div>

        </div>
      </div>
    )
  }
}

export default Table