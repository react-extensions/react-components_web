import React from 'react'
import './file-input.css'

/**
 * 
 * @prop {string|function} label
 * @prop {string mime} accept
 * @prop {function} onChange
 */
class FileInput extends React.PureComponent {

  render() {
    const label = this.props.label

    return (
      <label className='file-input-box'>
        { label && typeof label === 'function' ? label() : <span>{label | '+'}</span> }
        <input
          className='file-input'
          type='file'
          accept={this.props.accept}
          onChange={this.props.onChange} />
      </label>
    )
  }
}


export default FileInput