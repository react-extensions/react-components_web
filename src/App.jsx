import React, { Component } from 'react';
import './App.scss'
import { Cell , Input} from '@ui'
import ImgUpload from './file-upload/w3c-img'
import FileUpload from './file-upload/w3c-file'
import Pattern from '@ui/function-ui/form-pattern'
// import Input from '@ui/components/input/plain-input.jsx'


class App extends Component {
  constructor() {
    super()
    console.log(Input.name)
  }
  getImg(file) {
    console.log(file)
  }

  getFile(file) {
    console.log(file)
  }
  inputFocus(e) {
    console.log(e.nativeEvent)

  }
  inputChange(e) {
    console.log(e.nativeEvent)
  }
  render() {
    const PatternInput = Pattern(Input, {
      required: true,
      filter: v => v.replace(/\D/g, ''),
      pattern: v=> {
        // console.log(/\D/g.test(v), v)
        return /\d/g.test(v)
      },

      tip: {
        error: '没有数字',
        // success: 'crract'
        required: 'bixu'
      }
    })

    return (
      <div>
        <Cell title='姓名' value={
          <input type='text'/>
        }/>
        <Cell title='年龄' value={
          <input type='text'/>
        }/>
        <Cell title='图片' value= {
        <ImgUpload onChange={this.getImg.bind(this)}/>
        } />

        <Cell title='文件 1' value = {
          <FileUpload onChange={this.getFile.bind(this)} />
        } />
         <Cell title='文件 2' value = {
          <FileUpload onChange={this.getFile.bind(this)} />
        } />
        <div style={{width: 300}}>

          <PatternInput/>

        </div>

      </div>
    )
  }
}

export default App;
