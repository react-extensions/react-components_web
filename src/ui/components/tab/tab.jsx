const React = require('react')
require('./tab.less')

// props
// active 初始选中
// tabList tab列表
class Tab extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            active: 0
        }   
    }
    choose(v) {
      this.setState({active: v})
      const fn = this.props.onChange
      if(fn) { fn(v) }
    }
    componentDidMount() {
      let v = this.props.active
      this.setState({
        active: v?v:0
      })
    }
    render() {
        const {tabList} = this.props
        const {active} = this.state
        return (
            <ul className='tab-group'>
              {
                tabList.map((item, i) => (
                  <li className={'tab-item pointer ' + (active === i ? 'active ' : '')}
                   key={i} 
                   onClick={this.choose.bind(this, i)}>{item}</li>
                ))
              }
            </ul>
        )
    }
}
/* class TabGroup extends React.Component{
  getChildContext() {
    return {
      tabGroup: this
    }
  }
  render() {

    return (
      <div className='tab-group'>
        {this.props.children}
      </div>
    )
  }
}

TabGroup.childContextTypes = 
Tab.contextTypes = {
  tabGroup: React.PropTypes.any
} */

module.exports = Tab