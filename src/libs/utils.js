/**
 * 检测变量是否是数组
 * @param {*} target 
 */
export const isArray = function (target) {
    if (typeof Array.isArray === 'function') {
        return Array.isArray(target);
    }
    return Object.prototype.toString.call(target) === '[object Array]';
};

/**
 * 防抖函数
 * @param {func} fn 
 * @param {number} time 
 */
export const debounce = function (fn, time = 300) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn(...args);
        }, time);
    };
};


/**
 * 缓动函数
 * @param {number} current 当前数值
 * @param {number} target  目标数值
 * @param {func} callback  回调函数
 * @param {number} step    缓动值
 */
export const animation = (current, target, callback, step = 3) => {
    let shouldBreak = false;
    const supportAnimFrame = typeof window !== 'undefined' && window.requestAnimationFrame;
    const asyncFn = supportAnimFrame ? window.requestAnimationFrame : setTimeout;
    // 缓动函数
    const animFn = () => {
        current += (target - current) / step;
    };
    // 帧动画
    (function doAnim() {
        if (!shouldBreak && Math.abs(target - current) > 0.5) {
            animFn();
            callback(current, false);
            asyncFn(() => {
                !shouldBreak && doAnim();
            }, 17);
        } else {
            callback(current, true);
        }
    })();
    // 终止动画
    return function breakAnim() {
        shouldBreak = true;
    };
};
