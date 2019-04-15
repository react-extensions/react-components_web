export const isArray = function (arr) {
    return Object.prototype.toString.call(arr) === '[object Array]'
}

export const debounce = function (fn, time = 300) {
    let timer;
    return function (...args) {
        clearTimeout(timer)
        timer = setTimeout(() => {
            fn(...args)
        }, time)
    }
}