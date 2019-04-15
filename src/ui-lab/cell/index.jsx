import React from 'react'
import PropTypes from 'prop-types'
import './cell.scss'
/**
 * @component {comp} Cell 一个响应式布局
 * 
 * @prop {string} className
 * @prop {boolean} reverse 反转
 * @prop {number} titleWidth 
 * @prop {string} titleAlign
 * @prop {string} title
 * @prop {string} value
 * 
 */
class Cell extends React.Component {
  render() {
    const props = this.props

    return (
      <div className={'cell' + (props.className ? (' ' + props.className) : '') + (props.reverse ? ' reverse' : ' normal')}>
        {
          props.title && (
            <div className="cell-title"
              style={{
                width: props.titleWidth,
                textAlign: props.titleAlign
              }}
            >
              {props.title}
            </div>
          )
        }
        {props.value && <div className="cell-value">{props.value}</div>}
      </div>
    )
  }
}

Cell.defaultProps = {
  titleWidth: null,
  textAlign: 'left'
}

Cell.propTypes = {
  textAlign: PropTypes.oneOf(['left', 'right', 'center']),
  reverse: PropTypes.bool,
  titleWidth: PropTypes.number,
}

export default Cell
