import React from 'react'
import('./cell.scss')

export default class Select extends React.Component {
  render() {
   const {title, value, className} = this.props
    return (
      <div className = {'cell ' + (className || '')}> 
        <div className="cell-title">{title}</div>
        <div className="cell-value">{value}</div>
      </div>
    )
  }
}

