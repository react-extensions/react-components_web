import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './img-style.css'


class FileUpload extends Component {
  constructor(props) {
    super(props)
    this.state = {
      previewImg: null
    }

    this.onFileInputChange = this.onFileInputChange.bind(this)

  }
  /**
   * @func
   * 监听文件输入框change事件
   */
  onFileInputChange(e) {
    this.readFiles(e.target.files)

  }
  /**
   * @func
   *  在一般浏览器中读取图片， 并显示
   */
  readFiles(files) {
    // 1. 如果没有文件, 不做操作
    if (!files.length) return
    // 2. 创建一个  fileReader, 用于读取文件数据, 兼容  ie10+
    const fileReader = new FileReader()
    // 3. 遍历输入框中的文件
    const props = this.props
    const maxSize = props.maxSize
    const onChange = props.onChange
    const onError = props.onError

    let file = null

    for (let i = 0, len = files.length; i < len; i++) {

      file = files[i]

      /** 3.1 判断文件 大小 是否 符合预期
       * 
       * * file.size 的单位是 B
       * 
       * 文件大小超出用户限制, 触发onError事件, 交由父组件处理,
       * 如果不处理, 默认 退出遍历
       * onError 返回 true时, 会 忽略 错误, 继续执行
       * 
       */
      if (file.size > maxSize && !onError(file.name, file.size, maxSize)) return

      // 3.2 发送文件
      onChange(file)

        // 3.2 读取文件, 使用闭包记录文件 顺序
        ; (() => {
          let current = i

          fileReader.onload = (event) => {
            if (event.target.readyState === 2) {

              this.setState({
                previewImg: {
                  src: event.target.result,
                  name: files[current].name
                }
              })

            } else{
              alert('图片读取失败')
              // onError('图片读取失败' )
            }
          }
          //? ie11 10 中读取png 有问题
          fileReader.readAsDataURL(files[i])
        })();

    }

  }



  /**
   * 
   * @function
   *    移除当前图片
   */
  removeImg() {
    this.setState({ previewImg: null })
  }


  render() {
    const props = this.props
    const previewImg = this.state.previewImg
    return (
      <div className='file-upload img-upload'>
        {
          previewImg
            ? (
              <div className='preview-img-wrap' >
                <img
                  className='preview-img'
                  src={previewImg.src}
                  title={previewImg.name}
                  alt={previewImg.name}
                />
                <span className='remove-img-btn' onClick={this.removeImg}>-</span>
              </div>
            )
            : (
              <label className='upload-box'>
                <span className='input-label'>+</span>
                <input
                  className='upload-input'
                  type='file'
                  accept={props.accept}
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
  maxSize: PropTypes.number

}

FileUpload.defaultProps = {
  accept: 'image/*',
  maxSize: 1024000,  // 1 MB
  onChange: () => { },
  onError: (fileName, fileSize, maxSize) => { alert(`${fileName} 大小: ${fileSize} 超出限制(${maxSize})`) },
}

export default FileUpload