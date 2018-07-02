import React from 'react'
import './tooltip.scss'

class Tooltip extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  render() {
    const {children, label} = this.props
    return (
      <React.Fragment>
        {
          React.cloneElement(children, Object.assign({}, children.props, {
            onMouseOver: function(e) {
              const position = e.currentTarget.getBoundingClientRect()
              // console.log(e)
              // console.log(position)
              const div = document.createElement('div')
              div.innerText ? div.innerText = label : div.textContent = label;
              div.setAttribute('id', '__tooltip')
              div.style = `position:fixed;top:${position.top - position.height - 8}px;left:${position.left - position.width/2}px;z-index:11;`
              document.body.appendChild(div)
            },
            onMouseOut: function() {
              document.body.removeChild(document.getElementById('__tooltip'))
            }
          }))
        }
      </React.Fragment>
    )
  }
}
 
export default Tooltip