import {addClass, createElement, removeClass} from './dom';
import config from './config'

/**
 *@function - 渲染
 * */
let ToastEl = null
let timer = null
let oldPosition = 'center'
let oldStyle = ''
function render(options) {
  clearTimeout(timer);
  // 1. 显示元素
  !ToastEl ? firstRender() : removeClass(ToastEl, 'hidden')
  // 2. 获取元素
  const contentEl = ToastEl.querySelector('.u-toast-content')
  // 3. 设置样式
  const newPosition = options.position || config.position
  if(oldPosition !== newPosition) {
    removeClass(contentEl, oldPosition)
    addClass(contentEl, newPosition)
    oldPosition = newPosition
  }
  const newStyle = options.style || config.style
  if(oldStyle !== newStyle) {
    contentEl.style = newStyle
    oldStyle = newStyle
  }

  // 4. 显示文字
  contentEl.innerText = String(options.text)

  // 5. 设置定时器, 定时消失
  if(options.duration === 0) return // duration为0时, 不消失
  timer = setTimeout(() => {
    addClass(ToastEl, 'hidden')
  }, options.duration || config.duration)
}






function firstRender() {
  const contentEl = createElement('div',{ className: 'u-toast-content center'})

  ToastEl = createElement('div', {className: 'u-toast-container'}, contentEl)

  document.body.appendChild(ToastEl)
}

export default render