
const isArray = function (arr) {
    return Object.prototype.toString.call(arr) === '[object Array]'
}
// 取消冒泡
let cancelBubble = function (e) {
    if(e && e.stopPropagation) {
        cancelBubble = function(e) {
            e.stopPropagation()
        }
    }else {
        cancelBubble = function() {
            window.event.cancelBubble = false
        }
    }
    return cancelBubble(e)
}

/* 事件绑定 \\ 删除 */
let attachEvent = function (el, type, fn) {
  if(document.addEventListener) {
    attachEvent = function (el, type, fn) {
      el.addEventListener(type, fn, false)
    }
  }else {
    attachEvent = function(el, type, fn) {
      el.attachEvent('on' + type, fn)
    }
  }
    return attachEvent(el, type, fn)
}

let detachEvent = function (el, type, fn) {
  if(document.addEventListener) {
    detachEvent = function (el, type, fn) {
      el.removeEventListener(type, fn, false)
    }
  }else {
    detachEvent = function(el, type, fn) {
      el.detachEvent('on' + type, fn)
    }
  }
  return detachEvent(el, type, fn)
}
/* targetEl */
let target = function(e) {
  return  e.target ? e.target : e.srcElement
}

/* 判断节点包含关系 */
let contains = function(parent, child){
  if(!parent || !child) return false;
  if(parent.contains){
    contains = function (p, c){
      return p.contains(c)
    }
  }else {
    contains = function (p, c){
      function x(p, c) {
        const node = c.parentNode
        if (!node) return false

        if (node === p) {
          return true
        } else {
          c = node
          x(p, c)
        }
      }
      return x(p, c)
    }
  }
  return contains(parent, child)
}



export  {isArray, cancelBubble, attachEvent, detachEvent, target, contains}
