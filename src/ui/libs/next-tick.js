let microTimerFunc;
let macroTimerFunc;

// 确定(宏)任务延迟实现。 setImmediate是理想选择，但是它只能用于ie >9 .
// 在同一个循环中触发的所有DOM事件之后，对回调排序的方法是使用 MessageChannel(消息通道, PhantomJS)。
/* istanbul ignore if */
if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
    macroTimerFunc = () => {
        setImmediate(flushCallbacks);
    };
} else if (typeof MessageChannel !== 'undefined' && (
    isNative(MessageChannel) ||
  // PhantomJS
  MessageChannel.toString() === '[object MessageChannelConstructor]'
)) {
    const channel = new MessageChannel();
    const port2 = channel.port2;
    channel.port1.onmessage = flushCallbacks;
    macroTimerFunc = () => {
        port2.postMessage(1);
    };

} else {
    /* istanbul ignore next */
    macroTimerFunc = () => {
        setTimeout(flushCallbacks, 0);
    };
}

// Determine microtask defer implementation.
/* istanbul ignore next, $flow-disable-line */
if (typeof Promise !== 'undefined' && isNative(Promise)) {
    const p = Promise.resolve();
    microTimerFunc = () => {
        p.then(flushCallbacks);
        // 在有问题的UIWebViews中，Promise.then 不会完全中断，但是它可能会陷入一种奇怪的状态，
        // 回调被推入MicroTask队列，但是队列不会被刷新，直到浏览器需要做一些其他的工作，
        // 例如处理一个计时器。因此，我们可以通过添加一个空计时器来“强制”刷新MicroTask队列。
        if (isIOS) setTimeout(noop);
    };
} else {
    // fallback to macro
    microTimerFunc = macroTimerFunc;
}