
const isArray = function (arr) {
    return Object.prototype.toString.call(arr) === '[object Array]';
};
// 取消冒泡
let cancelBubble = function (e) {
    return e.stopPropagation()
};

/* 事件绑定 \\ 删除 */
let attachEvent = function (el, type, fn) {
    return el.addEventListener(type, fn, false);
};

let detachEvent = function (el, type, fn) {
    return el.removeEventListener(type, fn, false);
};
/* targetEl */
let target = function(e) {
    return  e.target ? e.target : e.srcElement;
};

/* 判断节点包含关系 */
let contains = function(parent, child){
    if(!parent || !child) return false;
    return parent.contains(child);
};



export  {isArray, cancelBubble, attachEvent, detachEvent, target, contains};
