import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './style.css'

const isIE9 = window.navigator.userAgent.match(/msie 9/i)

class FileUpload extends Component {
  constructor(props) {
    super(props)
    this.state = {
      files: [],
      previewImgs: [],
    }

    this.files = []

    this.onFileInputChange = this.onFileInputChange.bind(this)

  }
  /**
   * @func
   * 监听文件输入框change事件
   */
  onFileInputChange(e) {

    isIE9 ? this.readFiles_IE9(e) : this.readFiles(e.target.files)

  }
  /**
   * @func
   * 在 IE9中读取并显示图片
   */
  readFiles_IE9(e) {
    const node = e.target
    //* 1. 获取文件的绝对路径
    node.focus()
    node.select()
    node.blur()
    const selectObj = document.selection
    var path = selectObj.createRange().text

    this.setState(prev => ({
      previewImgs: prev.previewImgs.concat([{
        //* IE9不支持FileReader, 需要通过 filter 样式来读取本地文件同时进行显示
        style: { filter: `progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod='scale',src='${path}')` },
        name: node.value.slice(node.value.lastIndexOf('\\') + 1),
        time: +new Date()
      }])
    }))

  }
  /**
   * @func
   *  在一般浏览器中读取图片， 并显示
   */
  readFiles(files) {
    if (!files.length) return
    const fileReader = new FileReader()
    const imgs = []
    let currentLen = this.state.previewImgs.length

    for (let i = 0, len = files.length; i < len; i++) {

      ; (() => {
        let current = i

        fileReader.onload = (event) => {
          if (event.target.readyState === 2) {

            imgs[current] = {
              src: event.target.result,
              name: files[current].name,
              time: +new Date()
            }

            this.setState(prev => ({
              previewImgs: prev.previewImgs.slice(0, currentLen).concat(imgs)
            }))


          }
        }
        fileReader.readAsDataURL(files[i])
      })();

    }

  }
  removeImg(index) {
    this.setState(prev => ({
      previewImgs: prev.previewImgs.filter((item, i) => i !== index)
    }))
  }
  componentDidUpdate(prevP, prevS) {
    if (prevS.previewImgs !== this.state.previewImgs) {
      const onChange = this.props.onChange
      onChange && onChange()
    }
  }

  render() {
    const props = this.props
    const state = this.state
    const imgsLen = state.previewImgs.length
    return (
      <div className='file-upload'>


        {
          imgsLen > 0 && (
            state.previewImgs.map((img, i) => (
              <div className='preview-img-wrap' key={img.time}>
                <img
                  className='preview-img'
                  style={isIE9 ? img.style : null}
                  //* 在 IE9 中 设置 dataBase64来清楚掉 img标签的默认样式
                  src={!isIE9 ? img.src : 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='}
                  title={img.name}
                  alt={img.name}
                />
                <span className='remove-img-btn' onClick={this.removeImg.bind(this, i)}>-</span>
              </div>
            ))
          )
        }

        {
          props.maxNum > imgsLen && (
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
  accept: PropTypes.string,
  maxNum: PropTypes.number,
  maxSize: PropTypes.number

}
FileUpload.defaultProps = {
  accept: 'image/*',
  maxNum: 5,
  maxSize: 2048

}

export default FileUpload