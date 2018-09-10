import React from 'react'
import './cell.less'

 class Cell extends React.Component {
  render() {
    const props = this.props
      , { title, value, className, tips, titleWidth, titleAlign } = props

    return (
      <div className={'cell ' + (className || '')}>
        {
          title && (
            <div className="cell-title"
              title={tips && title}
              style={{
                width: titleWidth,
                textAlign: titleAlign
              }}
            >
              {title}
            </div>
          )
        }
        {value && <div className="cell-value">{value}</div>}
      </div>
    )
  }
}

Cell.defaultProps = {
  titleWidth: null,
  textAlign: 'left'
}

export default Cell
