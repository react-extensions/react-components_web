import React from 'react'
import style from './table.scss'
import Icon from '../icon/icon'
import Row from './row'

/**
 * 
 * @param thead = [
 *  {
 *    type: 'checkbox' // 如果加了这个, 则此列 会渲染成多选按钮
 * },
 * {
 *  width: 80,       // 列宽
 *  label: '',       // 表头文字
 *  prop: ''         // tbody 中数据的属性
 * }
 * @param tbody[Array]    {表格数据}
 * @param tbodyHeight     {tbody高度}
 * @param zebra[Boolean]  {表格行斑马线显示}
 * 
 */
class Table extends React.Component {
  constructor(props) {
    super(props)
    this.checkedRow = this.checkedRow.bind(this)
    this.state = {
      checkedStatus: 0,  // 0 有的选中, 有的没选中  -1 全没选中   1 全选中
      placeholder: false, // 表格头占位符, 当tbody滚动时, 需要这个, 用来让表格头和tbody的每一列宽度一致
    }
  }
  /**
   * 多选表格
   */
  // 全部选中, 不选中
  checkedAll() {
    const bool = this.state.checkedStatus === 1
    this.setState({ checkedStatus: bool ? -1 : 1 })
    this.checkedList = bool ? [] : [... this.props.tbody]
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
        let allTrue = true
        for (let prop in obj) {
          if (obj[prop] !== row[prop]) {
            allTrue = false
            break
          }
        }
        return !allTrue
      });

      (list.length === max - 1) && this.setState({ checkedStatus: 0 })
    }
    this.checkedList = list
  }
  componentWillMount() {
    this.checkedList = []
  }
  componentDidMount() {
    // 感觉不靠谱
    setTimeout(()=>{
      const offset = this.body.offsetWidth - this.body.clientWidth
      this.setState({placeholder: offset > 0 ? offset : false})
    },0)
  }
  render() {
    const { className, children, thead, tbody, tbodyHeight, zebra } = this.props
    const { placeholder, checkedStatus } = this.state

    const renderCol = function () {
      return (
        <colgroup>
          {
            thead.map((item, i) => (
              item.type === 'checkbox'
                ? (<col key={i} style={{ width: item.width || 40 }} width={item.width || 40}></col>)
                : (<col key={i} style={{ width: item.width }} width={item.width}></col>)
            ))
          }
          {
            placeholder && <col width={placeholder} style={{ width: placeholder }}></col>
          }
        </colgroup>
      )
    }

    return thead && (
      <div className={'table ' + (className || '')}>
        <div className="table-thead">
          <table border='0' cellSpacing='0' cellPadding={0} >
            {renderCol()}
            <thead>
              <tr>
                {
                  thead.map((th, i) => (
                    th.type === 'checkbox'
                      ? (<th className='th' key={'th' + i} onClick={this.checkedAll.bind(this)}><Icon type={checkedStatus === 1 ? 'check-fill' : 'check'} /></th>)
                      : (<th className='th' key={'th' + i} >{th.label}</th>)
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
            <div className="table-tbody" style={{ height: tbodyHeight }} ref={el => this.body = el}>
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
    )
  }
}

export default Table