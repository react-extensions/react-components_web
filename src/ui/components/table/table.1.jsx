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
      placeholder: false, // 表格头占位符, 当tbody滚动时, 需要这个, 用来让表格头和tbody的每一列宽度一致
      computeWidth: 0,    // 计算的表格宽度
      signOffsetLeft: 0,  // 调整表格列宽时, 指示器样式
    }

    this.thMinWidth = []

    this.state.widthList = this.init()
    this.resizeColToMax = this.resizeColToMax.bind(this)
    this.moveSign = this.moveSign.bind(this)
    this.resizeCol = this.resizeCol.bind(this)
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
  syncScroll(e) {
    this.headerTrack.scrollLeft = e.currentTarget.scrollLeft

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
  // 获取 左右 固定列的宽度
  getFixedWidth() {
    if (!this.fixedWidth) {
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
      this.fixedWidth = fixed
    }

    return this.fixedWidth
  }
  // 设置表格容器的 padding
  computedStyle() {
    const fixed = this.getFixedWidth()
    const style = {}

    if (fixed.left) style.paddingLeft = fixed.left + 'px'
    if (fixed.right) style.paddingRight = fixed.right + 'px'
    if (fixed.bottom) style.paddingBottom = fixed.bottom + 'px'
    return style
  }
  // 设置表格的宽度
  getTableWidth() {
    const fixed = this.getFixedWidth()
    return { width: (this.state.computeWidth - (fixed.left || 0) - (fixed.right || 0)) || 'auto' }
  }
  // 设置表身高度
  getTbodyHeight(type) {
    const scrollY = this.props.scrollY
    if (scrollY) {
      return { height: scrollY - (this.getFixedWidth().bottom || 0) - ((this.xAxisBlank * (type === 0 ? 1: 2)) || 0) }
    }
    return null
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
  // 判断有没有水平方向滚动条
  judgeAxisScroll() {
    const pTable = this.plainBody
    if (pTable) {
      this.xAxisBlank = pTable.offsetHeight - pTable.clientHeight
    }
  }
  // 按照每列中最大宽度的td设置列宽
  resizeColToMax(index, width) {
    if (!this.tdMinWidth) {
      this.tdMinWidth = []
    }

    const col = this.tdMinWidth[index]

    this.tdMinWidth[index] = !col ? width : col > width ? col : width

  }
  _initStructure() {
    // 初始化 横向结构, 列宽,
    const newState = this.computeTableWidth()
    this.judgeAxisScroll()

    // 如果表格需要滚动才进行以下操作
    if (this.props.scrollY) {

      // 判断有没有竖直方向滚动条
      const tbody = this.plainBody

      if (tbody) {
        const offset = tbody.offsetWidth - tbody.clientWidth
        newState.placeholder = offset > 0 ? offset : false
        newState.computeWidth += offset > 0 ? offset : 0
      }


      // 判断底部 有没有固定行
      const fixedRows = this.props.fixedRows
      if (fixedRows) {
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
  componentDidUpdate(prevP, prevS) {

    // rows 数据更新后, 重新设置col宽度
    if (prevP.rows !== this.props.rows) {
      // this._initStructure()
    }

    if (prevS.computeWidth !== this.state.computeWidth) {
      this.judgeAxisScroll()
      this.forceUpdate()
    }

  }
  componentWillReceiveProps(nextP) {
    // 更新了 表头数据, 重新获取col宽
    if (nextP.columns !== this.props.columns) {
      this.initialized = false
    }
  }
  renderCols(cols) {
    const list = this.state.widthList
    return (
      <colgroup>
        {cols.map(item => (<col key={item.__i__} style={{ width: list[item.__i__] }}></col>))}
      </colgroup>
    )
  }
  renderHeader(cols, Cols, tType) {
    // const {  rows, zebra, emptyTip, scrollY } = this.props
    return (
      <div className="u-table-theader" style={tType === 0 ? this.getTableWidth() : null}>
        <table border='0' cellSpacing='0' cellPadding={0} >
          {Cols}
          <thead >
            <tr>
              {
                cols.map((th, i) => {
                  return (
                    <th className={'th'} key={'th' + i} >
                      {
                        th.type === 'checkbox' ? <Icon type={'check-fill'} />
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
      </div>
    )
  }
  renderBody(cols, Cols, tType) {
    const { rows, zebra, emptyTip } = this.props
    const { widthList } = this.state
    return (
      <div className="u-table-body"
        style={tType === 0 ? this.getTableWidth() : this.getTbodyHeight(tType)}
        ref = {tType ===}
      >
        {
          rows && rows.length > 0 ? (
            <table border='0' cellSpacing='0' cellPadding={0} >
              {Cols}
              <tbody className='tbody'>
                {rows.map((tr, i) => (
                  <Row key={'tr' + i}
                    rowIndex={i}
                    fixedTable={tType !== 0}
                    columns={cols}
                    tr={tr}
                    resizeColToMax={this.resizeColToMax}
                    widthList={widthList}
                  />
                ))}
              </tbody>
            </table>
          ) : tType === 0 ? (<div className='empty-table-tip'>{emptyTip || (<span className='empty-tip__span'>暂无数据</span>)}</div>) : null
        }
      </div>
    )
  }
  caseRender() {
    const { fixedLeft, fixedRight, plain } = this.columns
    const { scrollY } = this.props
    const { placeholder } = this.state
    const hasFixed = (fixedLeft.length || fixedRight.length)

    function regularTable(cols, tType) {
      const Cols = this.renderCols(cols)
      return (
        <React.Fragment>
          {this.renderHeader(cols, Cols, tType)}
          {this.renderBody(cols, Cols, tType)}
        </React.Fragment>
      )
    }


    if (!scrollY) {
      return regularTable.call(this, plain, 0)
    } else if (scrollY) {
      const Cols = this.renderCols(plain)
      const style = this.computedStyle()
      return (
        <React.Fragment>
          <div className='u-plain__table' >
            <div className='u-header__track'
              style={Object.assign({}, style, placeholder ? { overflowY: 'scroll' } : null)}
              ref={el => this.headerTrack = el}
            >
              {this.renderHeader(plain, Cols, 0)}
            </div>

            <div className='u-body__track'
              style={Object.assign({}, style, this.getTbodyHeight(0))}
              ref={el => this.plainBody = el}
              onScroll={e => this.syncScroll(e)}
            >
              {this.renderBody(plain, Cols, 0)}
            </div>
          </div>

          {fixedLeft.length > 0 &&
            <div className='u-fixed-left__table'>
              {/* {fixedTypeTable.call(this, fixedLeft, -1)} */}
              {regularTable.call(this, fixedLeft, -1)}
            </div>
          }
          {fixedRight.length > 0 &&
            <div className='u-fixed-right__table'>
              {regularTable.call(this, fixedRight, 1)}
            </div>
          }
        </React.Fragment>
      )
    }

  }
  render() {
    const sign = this.state.signOffsetLeft

    return (
      <div className={'u-table__container ' + (this.props.className || '')} ref={el => this.table = el}>
        <div className="resize-col-sign" style={{ display: sign ? 'block' : 'none', left: sign }}></div>
        {this.caseRender()}
      </div>
    )
  }
}

export default Table