import React from 'react'
import './table.scss'
import Icon from '../icon/icon'
import Row from './row'

/**
 * @param tbody[Array]    {表格数据}
 * @param tbodyHeight     {tbody高度}
 * @param zebra[Boolean]  {表格行斑马线显示}
 * @param thead = [
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
 *        prop: ''         // tbody 中数据的属性
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
      signOffsetLeft: 0  // 调整表格列宽时, 指示器样式
    }

    this.checkedList = []
    this.th = []

    // 计算表格每列宽度
    let colWidth = 0,
        col = null
    const thead = props.thead,
          widthList = this.state.widthList
    for (let i = 0, len = thead.length; i < len; i++) {
      col = thead[i]
      if (col.type === 'checkbox' || col.type === 'expand') {
        colWidth = col.width || 40
      } else {
        colWidth = col.width || 0
      }
      widthList.push(parseFloat(colWidth))
    }

    this.checkedRow = this.checkedRow.bind(this)
    this.moveSign = this.moveSign.bind(this)
    this.resizeCol = this.resizeCol.bind(this)
  }
  /**
   * 多选表格
   */
  // 全部选中, 不选中
  checkedAll() {
    const bool = this.state.checkedStatus === 1
    this.setState({ checkedStatus: bool ? -1 : 1 })
    this.checkedList = bool ? [] : [...this.props.tbody]
    console.log(this.checkedList);

  }
  // 单行选中, 不选中
  checkedRow(row, isChecked) {
    let list = this.checkedList
    const max = this.props.tbody.length

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

      ;(list.length < max ) && this.setState({ checkedStatus: 0 })
    }

    this.checkedList = list
  }
  /**
   * 调整表格列大小
   */
  prepareResizeCol(e, index){
    e.preventDefault()
    e.stopPropagation()

    const table = this.table
    // 记录调整的  1. 列索引  2. 初始位置
    this.resizeColIndex = index
    this.startOffsetLeft = e.clientX - table.offsetLeft + table.scrollLeft + 2
    
    document.addEventListener('mousemove', this.moveSign)
    document.addEventListener('mouseup', this.resizeCol)
  }
  moveSign(e) {
    const table = this.table
    // 修改指示器位置
    this.setState({
      signOffsetLeft: e.clientX - table.offsetLeft + table.scrollLeft + 1
    })
  }
  resizeCol() {
    document.removeEventListener('mousemove', this.moveSign)
    document.removeEventListener('mouseup', this.resizeCol)

    const { signOffsetLeft, widthList} = this.state

    if (!signOffsetLeft) return

    const cha = signOffsetLeft - this.startOffsetLeft,

      index = this.resizeColIndex,

      el = this.th[index],

      // 根据每列的表头, 设置最小宽度
      minWidth = el.getBoundingClientRect().width + el.offsetLeft + 10,
      // 新的宽度
      newWidth = widthList[index] + cha
    
    
    this.setState(prev => ({
      widthList: prev.widthList.map((item, i) => {
        return i === index ? (newWidth < minWidth ? minWidth : newWidth) : item
      }),
      computeWidth: prev.computeWidth + (newWidth > minWidth ? cha : minWidth - widthList[index]),
      signOffsetLeft: 0
    }))
    
    // this.computeTableWidth()
  }
  // 根据用户设置,计算表格列宽 及 总宽度
  computeTableWidth () {

    const currentWidth = parseFloat(this.table.clientWidth),
      { widthList } = this.state,
      { thead } = this.props

    let computeWidth = 0,
      hasZero = 0,
      cannotExpand = { width: 0 }

    for (let i = 0, len = widthList.length; i < len; i++) {
      
      if (widthList[i] === 0) hasZero++ 
      
      if (thead[i].type && (thead[i].type === 'checkbox' || thead[i].type === 'expand')) {
        cannotExpand.width += widthList[i]
        cannotExpand[i] = true
      }

      computeWidth += widthList[i]
    }

    // 如果表格 计算总宽度  小于 容器渲染宽度   cha > 0
    const cha = currentWidth - computeWidth
    
    const newState = {
      widthList: widthList.map((item, i) => {
        if (hasZero) {
          return item === 0 ? (cha / hasZero) : item
        } else {
          // 如果计算宽度  小于  容器渲染宽度, 此时 扩展每列宽度至填满容器
          // 当有  不允许扩展的列时 
          // 

          /* return (cha < 0 || (cannotExpand.width && cannotExpand[i])) ? item
            : (item + cha * (item / (computeWidth - (cannotExpand.width || 0)))) */
          if (cannotExpand.width) {
            return cannotExpand[i] ? item : item + cha * (item / (computeWidth - cannotExpand.width))
          } else {
            return item + cha * (item / computeWidth)
          }
        }
      })
    }
    
    newState.computeWidth = cha > 0 ? currentWidth : computeWidth

    this.setState(newState)
  }
  componentDidMount() {
    


    setTimeout(()=>{
      this.computeTableWidth()

      if(!this.body)return

      const offset = this.body.offsetWidth - this.body.clientWidth
      const placeholder = offset > 0 ? offset : false

      if (!placeholder) return

      this.setState(prev => ({
        placeholder,
        computeWidth: prev.computeWidth + placeholder
      }))

    },30)

  }
  render() {
    const { className, thead, tbody, tbodyHeight, zebra } = this.props
    const { placeholder, checkedStatus, computeWidth, widthList, signOffsetLeft} = this.state

    const renderCol = function () {
      return (
        <colgroup>
          {
            widthList.map((item, i) => (
              <col key={i} style={{ width: item}}></col>
            ))
          }
          {
            placeholder && <col width={placeholder} style={{ width: placeholder }}></col>
          }
        </colgroup>
      )
    }

    return thead && (
      <div className={'table ' + (className || '')} ref={el => this.table = el}>
        <div className="resize-col-sign" style={{ display: signOffsetLeft ? 'block' : 'none', left: signOffsetLeft}}></div>
        <div style={{ width: computeWidth }}>
          <div className="table-thead" >
            <table border='0' cellSpacing='0' cellPadding={0} >
              {renderCol()}
              <thead>
                <tr>
                  {
                    thead.map((th, i) => (

                      <th className='th' key={'th' + i} onClick={th.type === 'checkbox' ? this.checkedAll.bind(this) : null} >
                        {
                          th.type === 'checkbox' ? <Icon type={checkedStatus === 1 ? 'check-fill' : 'check'} />
                            : th.type === 'expand' ? null
                              : <span ref={el => this.th[i] = el}>
                                  {th.label}
                                  <i className='th-border' onMouseDown={e => this.prepareResizeCol(e, i)}></i>
                                </span>
                        }
                      </th>

                    ))
                  }
                  {
                    placeholder && <th className='th th__placeholder' width={placeholder} style={{ width: placeholder }}></th>
                  }
                </tr>
              </thead>
            </table>
          </div>
          {
            tbody && (
              <div className="table-tbody" style={{ height: tbodyHeight }} ref={el => this.body = el} >
                <table border='0' cellSpacing='0' cellPadding={0} >
                  {renderCol()}
                  <tbody className='tbody'>
                    {tbody.map((tr, i) => (
                      <Row key={'tr' + i} thead={thead} tr={tr} onChecked={this.checkedRow} checkedStatus={checkedStatus} bgColor={zebra && (i % 2 === 0 ? 'lighten' : 'darken')} />
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
      </div>
    )
  }
}

export default Table