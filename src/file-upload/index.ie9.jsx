import React, { Component } from 'react'
import './style.css'

const isIE9 = window.navigator.userAgent.match(/msie 9/i)

class ImgUpload extends Component {
  constructor(props) {
    super(props)
    this.onIframeLoad = this.onIframeLoad.bind(this)
    this.onFormSubmit = this.onFormSubmit.bind(this)
    this.onFileInputChange = this.onFileInputChange.bind(this)

  }
  onFileInputChange(e) {
    console.log(e)
  }
  // 在表单提交时, 获取表单数据, 做预处理或拦截提交
  onFormSubmit(e) {
    // console.log(e.nativeEvent)
    // console.log(e.target.childNodes)
    // 如果验证不同过, 阻止提交
    if (!this.checkInput(e.target.childNodes)) {
      e.preventDefault()
    }

  }
  checkInput(nodesList) {
    let node = null
    let files = []
    for (let i = 0, len = nodesList.length; i < len; i++) {
      node = nodesList[i]
      if (node.type !== 'file') return

      files = node.files

      try {
        // 1. 选中input中的内容
        node.select()
        // 2. 清除第一步的影响
        node.blur()
        // 3. 获取选区, 在ie中需要用document.selection , 普通 window.getSelection()
        const selectObj = document.selection
        // 4. 获取文件名称
        var path = selectObj.createRange().text
        // 5. 创建fileReader
        var fso = new window.ActiveXObject("Scripting.FileSystemObject");
        // 6. 读取文件
        let file = fso.GetFile(path)
        // 7. 获取文件大小
        alert(file.size)
        
      } catch (e) {

        // console.log(e)

        alert(e + "\n" + "如果错误为：Error:Automation 服务器不能创建对象；" + "\n" + "请按以下方法配置浏览器：" + "\n" + "请打开【Internet选项-安全-Internet-自定义级别-ActiveX控件和插件-对未标记为可安全执行脚本的ActiveX控件初始化并执行脚本（不安全）-点击启用-确定】");

      }

      if (!files || files.length === 0) return

      for (let j = 0, len = files.length; j < len; j++) {
        console.log(files[i].size)
      }
    }

  }

  // 表单提交返回时, 获取返回数据
  onIframeLoad(e) {
    const iframeDoc = e.target.contentDocument
    let response = iframeDoc.body.innerText
    try {
      response = JSON.parse(iframeDoc.body.innerText)
    } catch (e) { }
    console.log('response', response)
  }
  render() {
    const props = this.props

    return (
      <div>
        {
          isIE9 ? (
            <React.Fragment>
              <iframe
                name='jump-target-frame'
                title='for-jump-target-frame'
                onLoad={this.onIframeLoad}
              ></iframe>
              <form
                encType='multipart/form-data'
                action={props.url}
                method='post'
                target='jump-target-frame'
                onSubmit={this.onFormSubmit}
              >
                <input type='file' accept='image/*' name='img' />
                {/* <input type='file' accept='image/*' name='img2'/> */}
                <button type='submit'>提交</button>
              </form>
            </React.Fragment>
          )
            : (
              <input type='file' accept='image/*' onChange={this.onFileInputChange} />
            )
        }


      </div>
    )
  }
}

export default ImgUpload