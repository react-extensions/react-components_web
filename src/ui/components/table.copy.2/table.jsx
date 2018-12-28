import React from 'react'
import Icon from '../icon'
import Row from './row'
import {
  CHECK_TYPE
} from './const-data'

/**
 * @prop rows[Array]    {表格数据}
 * @prop scrollY     {tbody高度}
 * @prop zebra[Boolean]  {表格行斑马线显示}
 * @prop fixedRows
 * @prop {fn} onSortChange 表格排序变化
 * @prop {boolean} databaseSort 是否启用数据库排序, 默认 false(表格根据当前数据自动排序)
 * @prop columns = [
 *      {
 *          filters: function () {}  // 对表格中的数据进行操作, 参数为表格中的数据, 返回值将被显示
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

/** 逻辑分析
 *
 *
 * 1. 初始化。 对表格columns 配置数据进行分析预处理
 *     - 定义表格类型。根据是否有 type被设置为 radio|checkbox 来定义表格类型， 单选表格|多选表格|普通表格 this.checkState = RADIO | CHECKBOX | NONE
 *     - 预收集列宽。预收集表格列宽数据到 数组 =》colMinRenderWidthList，优先使用用户设置的宽度，其次如果设置了type，则宽度为 50， 否则默认为 0
 *     - 标记不允许扩展宽度的列 cannotExpand。如果type被设置为 radio|checkbox|expand|index, 或者用户设置了width属性， 则该列在之后的宽度计算中不会被计算，直接使用默认宽度
 *     - 分离出columns。分析fixed属性，将columns数据分为 fixedLeft table columns | fixedRight table columns | plain table columns 三部分，并记录在 this.columns
 *     - 记录col原始index
 * 2. 渲染表格，为了等表格渲染后收集数据，可以先将表格visibility设置hidden避免闪烁。
 * 3. 通过ref收集th td宽度。 收集宽度，准备计算表格宽度
 *    i. th渲染后，收集其宽度，记录在this.colMinZoomWidthList， 代表着该列可以缩小的最小宽度
 *    ii. td渲染后，依次收集其宽度，然后比较该列所有td的宽，找出最大的一个 （如果该列被设置为 cannotExpand，跳过此步骤），记录在this.colMinRenderWidthList
 *        在之后的计算宽度中，将默认根据最大列宽来展示表格
 * 4. componentDidMount。 计算宽度, 分析结构，处理滚动轴
 *    i. 如果容器宽度大于计算宽度，根据特定方式增加计算宽度 让其等于容器宽度
 *    ii. 如果容器宽度小于计算宽度，不做操作
 *
 *
 */



const ASC = 'ASC'  //正序
const DESC = 'DESC' //反序

// 滚动条宽度
const SCROLL_BAR_WIDTH = (function () {
  const div = document.createElement('div')
  div.setAttribute('style', 'overflow:scroll;width: 100px;height:1px;visibility:hidden;position:fixed;z-index:-99;')
  div.innerHTML = `<div style="height:10px"></div>`
  document.body.appendChild(div)
  const barWidth = div.offsetWidth - div.clientWidth
  document.body.removeChild(div)
  return barWidth
})()

class Table extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      signOffset: 0,  // 调整表格列宽时, 指示器样式
      leftShadow: false,  // 阴影
      rightShadow: true,
      topShadow: false,
      syncData: {check: {}},
      checkStatus: -1,  // -1 全不选中  0 部分  1全选
      fixedBottomHeight: 0,
      sortMap: {current: '', order: ASC} // 表格排序, current 为当前行的prop. order  ASC正序 DESC 反序
    }

    this.trackEl = {current: null}
    this.tableWidth = {plain: 0, left: 0, right: 0, total: 0}
    this.checkedList = []       // 多选或单选表格， 选中的表格行
    this.checkState = CHECK_TYPE.NONE  // 当前表格的类型  带有单选 | 有多选功能  | 无

    this.columns = {}

    /* 用于计算表格宽度 */
    this.colMinZoomWidthList = []     // 用户自动拖拽表格列时，最小的宽度，等于th最小宽度
    this.colMinRenderWidthList = []   // 渲染时的列宽

    // 根据colums数据， 进行预处理
    this.analyseCols()


    this.moveSign = this.moveSign.bind(this)
    this.resizeCol = this.resizeCol.bind(this)
    this.checkedRow = this.checkedRow.bind(this)
    this.syncScroll = this.syncScroll.bind(this)
    this.checkedAll = this.checkedAll.bind(this)
    this.fixedBottomHeight = this.fixedBottomHeight.bind(this)
    this.resize = this.resize.bind(this)

  }

  /*
  * 数据预处理
  *
  * */
  analyseCols() {

    let colWidth = 0
    let col = null
    const columns = this.props.columns
    const colMinRenderWidthList = []
    const colMinZoomWidthList = []
    const fixedLeft = []
    const fixedRight = []
    const plain = []

    for (let i = 0, len = columns.length; i < len; i++) {
      col = columns[i]
      switch (col.type) {
        case 'checkbox':
        case 'expand':
        case 'index':
        case 'radio':
          col.cannotExpand = true
          colWidth = col.width || 50
          /*
          * 如果整个表格还没定义check_type
          * */
          if (this.checkState === CHECK_TYPE.NONE) {
            this.checkState = (
              col.type === 'checkbox'
                ? CHECK_TYPE.CHECKBOX
                : col.type === 'radio'
                ? CHECK_TYPE.RADIO
                : CHECK_TYPE.NONE
            )
          }
          break
        default:
          colWidth = col.width || 0
          if (col.width) {
            col.cannotExpand = true
          }
          break
      }

      col.__i__ = i

      switch (col.fixed) {
        case 'left':
          fixedLeft.push(col)
          break
        case 'right':
          fixedRight.push(col)
          break
        default:
          plain.push(col)
          break
      }

      colMinRenderWidthList.push(colWidth)
    }
    const colObj = {plain: plain}

    if (fixedLeft.length) {
      colObj.fixedLeft = fixedLeft
    }
    if (fixedRight.length) {
      colObj.fixedRight = fixedRight
    }

    this.columns = colObj

    this.colMinZoomWidthList = [...colMinZoomWidthList]
    this.colMinRenderWidthList = colMinRenderWidthList

  }

  componentDidMount() {

    this._initStructure()
    window.addEventListener('resize', this.resize)
  }

  UNSAFE_componentWillReceiveProps(nextP) {

    // 更新了 rows数据后, 将所有 checkbox状态清空
    if (nextP.rows !== this.props.rows) {
      this.checkedList = []
      this.setState({
        syncData: {check: {}},
        checkStatus: -1,
      })
    }

  }

  componentDidUpdate(prevP) {
    // rows 数据更新后, 重新设置col宽度
    if (prevP.rows !== this.props.rows) {
      this._initStructure()
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize)
  }

  resize() {
    clearTimeout(this.resizeTimer)
    this.resizeTimer = setTimeout(() => {
      this._initStructure()
    }, 1000)
  }


  collectThWidth(th, el) {
    if (!el || th.cannotExpand) return
    this.colMinZoomWidthList[th.__i__] = el.offsetWidth + 20
  }

  // 判断有没有竖直方向滚动条
  analyseScroll() {
    const track = this.trackEl.current
    if (track) {
      this.yScrollBar = track.offsetWidth - track.clientWidth
      this.xScrollBar = track.offsetHeight - track.clientHeight
    }

  }

  /*
  * 分析x轴方向上滚动轴
  * */
  analyseXScroll(diff) {
    this.xScrollBar = diff < 0 ? SCROLL_BAR_WIDTH : 0
  }

  /*
  * 计算结构
  * */
  _initStructure() {

    this.analyseScroll()
    // 初始化 横向结构, 列宽,
    console.log(this.colMinZoomWidthList, this.colMinRenderWidthList)

    // this.computeColWidth()
    this.computeColWidthTwo()

  }

  // 根据用户设置,计算表格列宽 及 总宽度
  computeColWidth() {

    // 容器宽度（物理宽度）
    const containerWidth = parseFloat(this.container.clientWidth) - this.yScrollBar || 0
    const columns = this.props.columns
    const colMinRenderWidthList = this.colMinRenderWidthList
    const colMinZoomWidthList = this.colMinZoomWidthList

    let totalWidth = 0
    let hasZero = 0
    let cannotExpand = {width: 0};

    // - 将maxColWidthList所有值相加，得出总宽度（计算总宽度）
    // - 记录maxColWidthList中为0的项的数量
    // - 将不允许扩展宽度的列的宽度相加
    // - 记录不允许扩展宽度列的索引

    (function () {
      let item = 0
      for (let i = 0, len = colMinRenderWidthList.length; i < len; i++) {
        item = colMinRenderWidthList[i]

        if (item === 0) hasZero++
        console.log(item, i)

        if (columns[i].cannotExpand) {
          cannotExpand.width += item
          cannotExpand[i] = true
        }

        totalWidth += item
      }
    }())


    // 如果表格 物理宽度 大于 计算宽度   diff > 0
    const diff = containerWidth - totalWidth

    let minZoomWidth = 0 // minColWidthList的项
    let minWidthExact = 0    // 计算出的每列最小宽度
    let lastWidth = 0    // 最终计算出的列宽
    let plainW = 0
    let leftW = 0
    let rightW = 0
    let fixed = null

    this.colMinRenderWidthList = colMinRenderWidthList.map((minRenderWidth, i) => {
      minZoomWidth = colMinZoomWidthList[i]

      //  对于像 checkbox|expand 这种列，没有获取节点的最小宽度,  其最小宽度在初始化时(constructor中) 已经被设置了
      // 比较th的宽度 和 td的宽度，哪个宽用哪个

      minWidthExact = minZoomWidth < minRenderWidth ? minRenderWidth : minZoomWidth

      lastWidth = minWidthExact

      if (diff > 0) {   // 需要自动扩展 列宽

        if (hasZero) { // 存在 没有设置宽度的 列  ==>>  将多余的平均分配

          minRenderWidth === 0 && (lastWidth = diff / hasZero)

        }
        else {     // 不存在 没有设置宽度的列  ==>>  除了不允许扩展的列, 其他均匀分配 多出的

          !cannotExpand[i] && (lastWidth = minRenderWidth + diff * (minRenderWidth / (totalWidth - cannotExpand.width)))

        }

        // 最小宽度
        lastWidth < minWidthExact && (lastWidth = minWidthExact)

      }


      fixed = columns[i].fixed

      if (fixed === 'left') {
        leftW += lastWidth
      }
      else if (fixed === 'right') {
        rightW += lastWidth
      }
      else {
        plainW += lastWidth
      }

      return lastWidth

    }) // End Map

    this.analyseXScroll(containerWidth - leftW - rightW - plainW)

    this.tableWidth = {left: leftW, right: rightW, plain: plainW, total: leftW + rightW + plainW}

    this.forceUpdate()
  }

  computeColWidthTwo() {
    this.colMinRenderWidthList = [...this.colMinZoomWidthList]
    this.tableWidth = {left: 'auto', right:  'auto', plain:  'auto', total: 'auto'}

    this.forceUpdate()
  }

  /*----------------------*/
  /* ---- 同步表格行 ---- */

  /*----------------------*/
  syncRow(type, syncData) {
    this.setState(prev => (
      {syncData: Object.assign({}, prev.syncData, {[type]: syncData})}
    ))
  }


  /*--- 切换表格全选中 ---*/
  checkedAll() {
    const {rows, onSelectRowChange} = this.props
    const bool = this.state.checkStatus === 1

    this.setState({checkStatus: bool ? -1 : 1})

    this.checkedList = bool || (!rows || rows.length === 0) ? [] : [...rows]
    onSelectRowChange && onSelectRowChange(this.checkedList)
  }

  /*--- 切换表格行选中 ---*/
  checkedRow(row, isChecked, rowIndex) {
    const emit = this.props.onSelectRowChange

    if (this.checkState === CHECK_TYPE.RADIO) { // 单选表格
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

    oldStatus !== newStatus && this.setState({checkStatus: newStatus})

    emit && emit(arr)
  }

  /*---    同步滚动    ---*/
  syncScroll(e) {
    const left = e.currentTarget.scrollLeft
    // 同步 头部滚动， 如果由固定在下方的表格， 也同步滚动
    this.headerTrack.scrollLeft = left
    this.bottomTable && (this.bottomTable.scrollLeft = left)

    const top = e.currentTarget.scrollTop
    this.leftTbody && (this.leftTbody.scrollTop = top)
    this.rightTbody && (this.rightTbody.scrollTop = top)
    // console.log(this.container.clientWidth + left, this.tableWidth.total  )
    const {topShadow, leftShadow, rightShadow} = this.state
    ;(topShadow !== (top > 0)) && this.setState({topShadow: !topShadow})
    this.columns.fixedLeft && (leftShadow !== (left > 0)) && this.setState({leftShadow: !leftShadow})
    this.columns.fixedRight && (rightShadow !== (this.container.clientWidth + left !== this.tableWidth.total)) && this.setState({rightShadow: !rightShadow})

  }

  /*--- 调整表格列大小 ---*/
  getOffsetLeft(e) {
    const C = this.container
      , P = C.getBoundingClientRect()
    return e.clientX - P.left + C.scrollLeft
  }

  prepareResizeCol(e, index, type) {
    e.preventDefault()
    e.stopPropagation()

    // 记录调整的  1. 列索引  2. 初始位置

    this.resizeData = {index, type, offset: this.getOffsetLeft(e)}

    document.addEventListener('mousemove', this.moveSign)
    document.addEventListener('mouseup', this.resizeCol)
  }

  /*--- 修改指示器位置 ---*/
  moveSign(e) {
    this.setState({signOffset: this.getOffsetLeft(e)})
  }

  resizeCol() {
    document.removeEventListener('mousemove', this.moveSign)
    document.removeEventListener('mouseup', this.resizeCol)

    const offset = this.state.signOffset

    if (!offset) return

    const data = this.resizeData
    const minRenderWidth = this.colMinRenderWidthList[data.index]
    // 根据每列的表头, 设置最小宽度
    const minWidthExact = this.colMinZoomWidthList[data.index]

    let newWidth = minRenderWidth + offset - data.offset

    newWidth < minWidthExact && (newWidth = minWidthExact)

    // const { left, right, plain } = this.tableWidth
    const containerWidth = (parseFloat(this.container.clientWidth) - this.yScrollBar || 0)// 容器宽度
    //位移差, 调整了的宽度
    let diff = newWidth - minRenderWidth
    //                   容器宽度 - 新的总宽度
    let subDiff = containerWidth - (this.tableWidth.total + diff)


    if (subDiff > 0) {  // 如果新总宽度 小于容器宽度, 禁止缩小
      newWidth += subDiff
      diff += subDiff
    }

    // 记录  并调整表格总宽度
    this.tableWidth[data.type] += diff
    this.tableWidth.total += diff

    // 记录  并调整  对应列的宽度
    this.colMinRenderWidthList[data.index] = newWidth
    // 判断要不要显示水平轴 滚动条
    this.analyseXScroll(subDiff)
    // 把标志线归零 , 顺便触发整个更新
    this.setState({signOffset: 0})
  }


  fixedBottomHeight(el) {
    if (!el) return
    this.setState({
      fixedBottomHeight: el.clientHeight
    })
  }


  //* 表格排序
  sortData(key, colConfig) {
    const map = this.state.sortMap
    const order = map.current === key ? (map.order === ASC ? DESC : ASC) : ASC

    const newState = {sortMap: {current: key, order: order}}
    this.setState(newState)

    const fn = this.props.onSortChange
    fn && fn({prop: key, order: order}, colConfig)
  }

  /*
   * 排序rows 并返回新的rows
   * */
  sortRows(rows) {
    // 如果排序规则没变, 表格数据没变, 且有 已经排序过的 rows数据, 则直接用已经排序过的

    if (!this.sortedRows || this.rows !== this.props.rows || this.sortMap !== this.state.sortMap) {
      // 缓存上次状态
      this.rows = this.props.rows
      this.sortMap = this.state.sortMap

      const match = this.sortMap.current
      const rule = this.sortMap.order === ASC ? 1 : -1

      this.sortedRows = rows.sort((p, n) => {
        return (n[match] - p[match]) * rule
      })
    }

    return this.sortedRows
  }

  renderHeader(cols, columns) {
    const state = this.state
    const props = this.props
    const {checkStatus, sortMap} = state

    const renderPlainTh = (th) => (
      <React.Fragment>
        <span ref={this.collectThWidth.bind(this, th)} className='u-th-content'>
           {th.label}
          {
            th.needSort && (
              <span
                onClick={this.sortData.bind(this, th.prop, th)}
                className={'sort-sign ' + (sortMap.current === th.prop ? (sortMap.order === ASC ? 'forward' : 'reverse') : 'un-active')}
              >
                 <Icon type='down-fill' className='up-arrow'/>
                  <Icon type='down-fill' className='down-arrow'/>
               </span>
            )
          }
        </span>
        {
          !props.disabledDrag && (
            <i
              className='u-th-border'
              onMouseDown={e => this.prepareResizeCol(e, th.__i__, th.fixed || 'plain')}>
            </i>
          )
        }
      </React.Fragment>
    )

    const renderCheckboxTh = () => (
      <Icon type={checkStatus === 0 ? 'half-checked' : checkStatus > 0 ? 'check-fill' : 'check'}
            onClick={this.checkedAll}/>
    )


    return (
      <table border='0' cellSpacing='0' cellPadding={0}>
        {columns}
        <thead>
        <tr>
          {
            cols.map((th, i) => {
              const align = th.align || this.props.align
              const textAlign = th.type ? ' center' : (align ? (' ' + align) : '')
              return (
                <th className={'u-th' + textAlign} key={i}>
                  {/*ie中应该不能将td th作为绝对定位的参照节点， 所以如果 在 th td内有绝对定位的元素，样式会出问题*/}
                  {/*加一层div, 并将其style设置为position:relative ，来标准化这一样式*/}
                  <div className={'u-th-content__wrap ' + (th.className || '')}>
                    {
                      (th.type === 'expand' || th.type === 'radio') ? null
                        : th.type === 'checkbox' ? renderCheckboxTh()
                        : th.type === 'index' ? '#'
                          : renderPlainTh(th)
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


  /**
   *
   * @param cols
   * @param tType 表格类型 0 主要表格 -1, 1 固定表格
   */
  renderBody(cols, columns, tType, needSync) {
    const PROPS = this.props
      , {zebra, emptyTip, loading, align} = PROPS
      , {syncData, checkStatus, sortMap} = this.state
    let rows = tType === -2 ? PROPS.fixedRows : PROPS.rows
    // 表格排序
    if (!PROPS.databaseSort && sortMap.current && rows && rows.length > 0 && tType === 0) {
      rows = this.sortRows(rows)
    }

    return (
      <React.Fragment>
        {loading && tType === 0 ? <Icon type='loading'/> : null}
        {
          (rows && rows.length > 0)
            ? (
              <table border='0' cellSpacing='0' cellPadding={0}>
                {columns}
                <tbody>
                {rows.map((tr, i) => (
                  <Row
                    key={'u-tr' + i}
                    tr={tr}
                    align={align}
                    rowIndex={i}
                    checkState={this.checkState}
                    columns={cols}
                    bgColor={zebra && (i % 2 === 0 ? 'lighten' : 'darken')}
                    isFixed={tType !== 0}
                    isBottom={tType === -2}
                    checkStatus={checkStatus}
                    colMinRenderWidthList={this.colMinRenderWidthList}
                    syncData={syncData}
                    syncRow={needSync ? this.syncRow.bind(this) : null}
                    onChecked={this.checkedRow}
                    onRowClick={this.props.onRowClick}
                  />
                ))}
                </tbody>
              </table>
            )
            : (
              (tType === 0 && !loading)
                ? (<div className='empty-table-tip'>{emptyTip || (<span className='empty-tip__span'>暂无数据</span>)}</div>)
                : null
            )
        }
      </React.Fragment>
    )
  }

  renderColumns(cols) {
    const list = this.colMinRenderWidthList

    return (
      <colgroup>
        {cols.map(item => (<col key={item.__i__} style={{width: list[item.__i__]}}></col>))}
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
    const {fixedLeft, fixedRight, plain} = this.columns
    const plainT = this.renderBody(plain, this.renderColumns(plain), -2, false)

    let left = null
    let right = null
    if (fixedLeft) {
      left = this.renderBody(fixedLeft, this.renderColumns(fixedLeft), -2, false)
    }
    if (fixedRight) {
      right = this.renderBody(fixedRight, this.renderColumns(fixedRight), -2, false)
    }
    return {plain: plainT, left, right}
  }

  render() {
    const COLUMNS = this.columns
    const PROPS = this.props
    const STATE = this.state
    const {fixedLeft, fixedRight, plain} = COLUMNS
    const {fixedRows, scrollY} = PROPS
    const {topShadow, leftShadow, rightShadow, signOffset, fixedBottomHeight} = STATE

    const hasFixed = fixedLeft || fixedRight

    const plainTable = this.renderTable(plain, 0, hasFixed)
    const leftTable = fixedLeft && this.renderTable(fixedLeft, -1, hasFixed)
    const rightTable = fixedRight && this.renderTable(fixedRight, 1, hasFixed)

    const TW = this.tableWidth
    const P_W = TW.plain
    const L_W = TW.left
    const R_W = TW.right
    const B_H = fixedRows ? fixedBottomHeight : 0
    const bottomTable = fixedRows ? this.renderBottom() : null
    // 用于定义 左右两侧固定列表格高度
    const fixedTableHeight = (hasFixed && scrollY) ? (scrollY - (this.xScrollBar || 0) - B_H)  : 'auto'
    // 如果有右侧固定列表格， 则渲染占位符
    const rightPlaceholder = rightTable && (<div className={'u-table-right-placeholder'} style={{width: `${R_W}px`}}> </div>);
    

    return (
      /* 总容器 */
      <div className={'u-table__container ' + (this.props.className || '')} ref={el => {
        this.container = el
      }}>
        {/* 调整宽度的标记线 */}
        <div className="resize-col-sign" style={{display: signOffset ? 'block' : 'none', left: signOffset}}></div>

        {/* 表格的主体 */}
        <div className='u-plain__table u-main__table'>
          <div className={'u-header__track ' + (topShadow ? 'shadow ' : '')}
               style={{paddingLeft: `${L_W}px`, overflowY: this.yScrollBar ? 'scroll' : 'hidden'}}
               ref={el => this.headerTrack = el}
          >
            <div className="u-table-header" style={{width: P_W && (P_W )}}>{plainTable.header}</div>
            {/* 右侧固定列占位符 */}
            {rightPlaceholder}
          </div>

          <div className='u-body__track'
               style={{height: (scrollY || 'auto') , paddingLeft: `${L_W}px`}}
               ref={this.trackEl}
               onScroll={this.syncScroll}
          >
            <div className="u-table-body" style={{width: P_W && (P_W )}}>{plainTable.body}</div>
            {/* padding-right也无效(⊙o⊙)？ */}
            {/* 右侧固定列占位符 */}
            {rightPlaceholder}
            {/* 外层(track)的padding-bottom 在 ie中 无效, 需要使用这种方法*/}
            {B_H > 0 && <div style={{height: B_H}}></div>}
          </div>
        </div>

        {/* 左固定表格 */}

        {leftTable &&
        <div className={'u-fixed-left__table ' + (leftShadow ? 'shadow ' : '')} style={{width: L_W && (L_W )}}>
          <div className={'u-table-header ' + (topShadow ? 'shadow ' : '')}>{leftTable.header}</div>
          <div className="u-table-body"
               style={{height: fixedTableHeight}}
               ref={el => this.leftTbody = el}
          >
            {leftTable.body}
          </div>
        </div>
        }

        {/* 右固定表格 */}

        {rightTable &&
        <div className={'u-fixed-right__table ' + (rightShadow ? 'shadow ' : '')}
             style={{width: R_W && (R_W ), right: (this.yScrollBar || 0) }}>
          <div className={'u-table-header ' + (topShadow ? 'shadow ' : '')}>{rightTable.header}</div>
          <div className="u-table-body"
               style={{height: fixedTableHeight}}
               ref={el => this.rightTbody = el}
          >
            {rightTable.body}
          </div>
        </div>
        }

        {/* 下方固定表格 */}

        {bottomTable &&
        <div className='u-fixed-bottom__table' style={{bottom: (this.xScrollBar || 0), right: (this.yScrollBar || 0)}}>
          <div className='u-plain__table'
               style={{padding: `0 ${R_W}px 0 ${L_W}px`}}
               ref={el => this.bottomTable = el}
          >
            <div className="u-table-body" style={{width: P_W && (P_W )}}>
              {bottomTable.plain}
            </div>
            {rightPlaceholder}
          </div>

          {bottomTable.left &&
          <div className={'u-fixed-left__table ' + (leftShadow ? 'shadow ' : '')}
               ref={this.fixedBottomHeight}
               style={{width: L_W && (L_W )}}>
            <div className="u-table-body">{bottomTable.left}</div>
          </div>
          }

          {bottomTable.right &&
          <div className={'u-fixed-right__table ' + (rightShadow ? 'shadow ' : '')}
               ref={this.fixedBottomHeight}
               style={{width: R_W && (R_W )}}>
            <div className="u-table-body">{bottomTable.right}</div>
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
  rows: null,
  databaseSort: false,  // 是否使用数据库排序, 默认是表格自动排序
  disabledDrag: false,  // 不允许用户拖拽设置表格列宽
}

export default Table