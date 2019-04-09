/*
 * @Author: LI SHUANG
 * @Email: fitz-i@foxmail.com
 * @Description: 
 * @Date: 2019-04-03 13:49:54
 * @LastEditTime: 2019-04-03 13:52:27
 */

export default function debounce(
    fn, {
        time = 300,
        argsHandle = (...args)=> args
    }
) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        if(Boolean(argsHandle)) {
            args = argsHandle(...args);
        }
        setTimeout(() => {
            Boolean(argsHandle) ? fn(args) : fn(...args);
        }, time);
    };
}