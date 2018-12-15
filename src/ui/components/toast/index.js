import './toast.scss'
import config from './config'
import render from './render'


const Toast = function (options) {
  render(normalize(options))
}

Toast.loading = function(options) {
  render(Object.assign({},normalize(options), {type: 'loading'}))
}

//格式验证, 标准化
function normalize(options){

  if (typeof options === 'string') {
    options = {
      text: options
    }
  }
  return options
}


Toast.config = config

export default Toast