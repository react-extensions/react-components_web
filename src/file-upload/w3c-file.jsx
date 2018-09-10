import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './style.css'


class FileUpload extends Component {
  constructor(props) {
    super(props)
    this.state = {
      file: null
    }

    this.removeFile = this.removeFile.bind(this)
    this.onFileInputChange = this.onFileInputChange.bind(this)

  }


  /**
   * 
   * @func
   * 监听文件输入框change事件
   */
  onFileInputChange(e) {
    const files = e.target.files
    const maxSize = this.props.maxSize
    let file = files[0]

    if (file.size > maxSize && !this.props.onError('sizeError', file.name, file.size, maxSize)) return
    // if (file.size > maxSize && !this.props.onError('typeError', file.name, file.size, maxSize)) return

    this.setState({ file: file })

  }

  /**
   * 
   * @function
   *    移除当前文件
   */
  removeFile() {
    this.setState({ file: null })
  }

  /**
   * 
   * @function
   *    向父组件发送 文件 数据
   */
  componentDidUpdate(prevP, prevS) {
    if (prevS.file !== this.state.file) {
      this.props.onChange(this.state.file)
    }
  }

  render() {
    const file = this.state.file
    
    const props = this.props

    return (
      <div className='file-upload'>
        {
          file
            ? (
              props.display ? props.display(file)
                : (
                  <div className='preview-file-wrap' >
                    <div className='file-name'>{file.name}</div>
                    <span className='remove-file-btn' onClick={this.removeFile}>-</span>
                  </div>
                )
            )
            : (
              <label className='upload-box'>
                <span className='input-label'>+</span>
                <input
                  className='upload-input'
                  type='file'
                  accept={this.props.accept}
                  onChange={this.onFileInputChange} />
              </label>
            )
        }
      </div>
    )
  }
}

FileUpload.propTypes = {
  onChange: PropTypes.func,
  onError: PropTypes.func,
  accept: PropTypes.string,
  maxSize: PropTypes.number,
  display: PropTypes.func,

}

FileUpload.defaultProps = {
  accept: '*/*',
  maxSize: 1024000,  // 1 MB
  onChange: () => { },
  onError: (errorType, fileName, fileSize, maxSize) => { 
    switch(errorType) {
      case 'sizeError':
        alert(`${fileName} 大小: ${fileSize} 超出限制(${maxSize})`)
        brea;
      case 'typeError':
        alert('文件类型错误')
    }
   },
}

export default FileUpload