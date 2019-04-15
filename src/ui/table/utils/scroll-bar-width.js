/*
 * @Author: LI SHUANG
 * @Email: fitz-i@foxmail.com
 * @Description: 
 * @Date: 2019-04-03 13:31:50
 * @LastEditTime: 2019-04-03 13:33:03
 */

// 滚动条宽度
const div = document.createElement('div');
div.setAttribute('style', 'overflow:scroll;width: 100px;height:1px;visibility:hidden;position:fixed;z-index:-99;');
div.innerHTML = `<div style="height:10px"></div>`;
document.body.appendChild(div);
const barWidth = div.offsetWidth - div.clientWidth;
document.body.removeChild(div);
export default barWidth;
