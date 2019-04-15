import React from 'react'
import './pagination.scss'
import Select from '../select/select'

/* 
* total  Number  一共多少条数据
* range  Number  一页要显示多少条数据
* page   Number  大于多少页时显示缩略按钮
*
*/
class Pagination extends React.Component{
  constructor() {
    super()
    this.state = {
      active: 1,
      input: 1,
      range: 5
    }
    this.changeMode = this.changeMode.bind(this)
    this.switchPage = this.switchPage.bind(this)
    this.createList = this.createList.bind(this)
  }
  // 选择一页显示几条数据
  changeMode(v){
    v = parseInt(v.match(/^(\d+)条/)[1])
    const {total, page} = this.props
    this.pages = Math.ceil(total/ v)
    this.createList(1, this.pages > page ? false : page)
    this.setState({active: 1, range: v})
  }
  handleInput(e) {
    let v = e.target.value
    v =  !v ? '' : parseInt(v)
    v = v > this.pages ? this.pages : v
    this.setState({ input: v})
    if(this.timer) {clearTimeout(this.timer)}
    // 截流
    this.timer = setTimeout((function(that, v) {
      return function () {
        if(typeof v === 'number' && !isNaN(v) && v !== that.state.active) {
          that.createList(v)
          that.setState({ active: v })
        }
      }
    }(this, v)), 500)
  }
  // 换页
  switchPage(v, x) {
    const pages = this.pages
    // 切换页码
    let active = (v === 0 ? (this.state.active + x) : v)
    // 矫正范围
    active = active < 1 ? 1 : active > pages ? pages : active
    // 生成页码列表
    if(pages > this.props.page) {this.createList(active)}
    this.setState({active})
  }
  createList(active, x) {
    // x是显示列表数量
    x = x || 5  
    const pages = this.pages
    let arr = []
    // 前5页进行处理, 后五页时,把起点限制为 pages - x - 1  
    let start = active < x ? 1 : (active + Math.ceil(x/2)) < pages ?  active - Math.floor(x/2) : pages - (x - 1)
    // 后x页时, 进行处理, 其他 end 始终 等于 start + 5
    let end = start + x > pages ? pages + 1 :  start + x
    for(let i = start; i < end; i++) { arr.push(i) }
    if(start > 2) {arr = [1, '...'].concat(arr)}
    if(end < pages) {arr = arr.concat(['...', pages])}
    this.renderList = arr
  }
  componentDidUpdate(v, prevS) {
    const onChange = this.props.onChange
    const {range, active} = this.state
    if(onChange && (prevS.active !== active || prevS.range !== range)) {
      onChange(this.state.active, this.range)
      console.log(this.state.active, this.range)
    }
  }

  componentWillMount() {
    const {total, range, page} = this.props
    this.pages = Math.ceil(total/range)
    this.range = range
    this.createList(1, this.pages > page ? false : page)
  }
  render() {
    const {total,  page} = this.props
    const {active, input} = this.state
    // 总页数
    const pages = this.pages
    const list = this.renderList
    console.log(list)
    return (
      <div className='pagination f-right'>
        <button className='prev-btn' onClick={() => this.switchPage(0, -1)} disabled = {active === 1}>&lt;</button>
        <ul className="pager">
        {/* 页码区 */}
          {
            list.length > 0 ? list.map((item, i) => (
                <li className={"page-num " + (active === item ? 'active' : '')}
                key={i} 
                onClick={ item === '...' ? null : () => this.switchPage(item)} 
                >{item}</li>
              )) : null
          }
        </ul>
        <button  className='next-btn'  onClick={() => this.switchPage(0, 1)}  disabled = {active === pages}>&gt;</button>
        <span className="page-info ">{`共${total}条`}</span>
        {/* // 输入跳转 */}
        {
          pages > page ? (
            <label className='pager-input__label'>
              前往
              <input className='pager-input' type="text" value={input} defaultValue = {input} onChange= {e => this.handleInput(e)} />
              页
            </label>
          ) : null
        }
        <Select onChange={this.changeMode} className='pager-select' selected = {'5条/页'}>
          {
            ['5条/页', '10条/页', '20条/页'].map(item => (
              <Select.Option key={item} label={item} />
            ))
          }
        </Select>
        
      </div>
    )
  }
}

Pagination.defaultProps = {
  total: 0,
  range: 5,
  page: 7
}

export default Pagination