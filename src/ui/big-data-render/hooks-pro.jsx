/*
 * @Author: L.S
 * @Email: fitz-i@foxmail.com
 * @Description: 
 * @Date: 2019-04-04 13:50:14
 * @LastEditTime: 2019-05-15 09:12:16
 */


/**
 * 不确定变量：
 * 1. 视口高度
 * 2. 每个节点高度
 *
 * 体验：
 * 1. 在什么位置替换节点
 * 2. 替换节点后的处理
 *
 */

import { createRef, useState, useEffect } from 'react';

export default function useBigDataRender({ data = [], range = 50, height = 300 }) {

    const [index, setIndex] = useState(0);
    const [offsetTop, setOffsetTop] = useState(0);
    const [totalHeight, setTotalHeight] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);
    const [prevScrollTop, setPrevScrollTop] = useState(0);
    const [isBottom, setIsBottom] = useState(false);
    const [prevTime, setPrevTime] = useState(0);
    const [overSpeed, setOverSpeed] = useState(false);
    const [timer, setTimer] = useState(null);
    // const [prevScrollLeft, setPrevScrollLeft] = useState(0);
    const contentRef = createRef();
    // 总数据量小于 range * 2，直接渲染
    const shouldRenderDirectly = data.length < (range * 2);
    /**
     * 设置数据区间的起始位置并移动 content div
     * @param {number} nextIndex 
     * @param {number} halfContentHeight 
     */
    const setStepAndOffsetTop = (nextIndex, halfContentHeight) => {
        console.log(nextIndex)
        // 顶部
        if (nextIndex <= 0) {
            setIndex(0);
            setOffsetTop(0);
            setIsBottom(false);
            return;
        }
        // 底部
        const last = data.length - nextIndex;
        if ((2 * range) >= last) {
            if (isBottom) {
                return;
            }
            // 容错
            if(last < range){
                nextIndex -= range;
            }
            setIsBottom(true);
        }
        // 中间
        else {
            setIsBottom(false);
        }
        // 在最底部的时候，情况如下图例：
        // 图例: 
        // |---| 为 1 range
        // |--- --- --- --- --- --- --- --- --- -|    实际总数据量
        // |--- ---|--- ---|--- ---|--- ---|--- -|    每一间隔代表实际渲染的 数据
        // |---|---|---|---|---|---|---|---|          index递增情况
        // 可以看到，因为index 以 range 为一个单位递增或递减
        // 所以即使满足 nextIndex + (2 * range) >= data.length - 1
        // 渲染的数据量也不会小于一个range
        setIndex(nextIndex);
        setOffsetTop(halfContentHeight * Math.ceil(nextIndex / range));
    };
    /**
     * 处理容器滚动
     * @param {event} e 
     */
    const handleScroll = function (e) {
        if (shouldRenderDirectly) {
            return;
        }
        const wrapEl = e.target;
        const minDistance = 0; //this.props.distance
        const scrollTop = wrapEl.scrollTop;
        // const contentEl = contentRef.current;
        // const contentHeight = contentEl.clientHeight;
        const halfContentHeight = contentHeight / 2;
        // 保存滚动位置
        setPrevScrollTop(scrollTop);

        // const scrollLeft = wrapEl.scrollLeft;
        // if(Math.abs(scrollLeft-prevScrollLeft )> Math.abs(scrollTop-prevScrollTop)) {
        //     setPrevScrollLeft(scrollLeft);
        //     return;
        // }

        // 判断是否超速
        const time = Number(new Date());
        setPrevTime(time);
        // 速度 px/ms
        const speed = Math.abs(scrollTop - prevScrollTop) / (time - prevTime);
        if (speed > 20) {
            // 超速了， 没必要渲染，等停下再渲染
            setOverSpeed(true);
            clearTimeout(timer);
            setTimer(setTimeout(() => {
                const ranges = Math.floor(scrollTop / halfContentHeight);
                setStepAndOffsetTop(ranges * range, halfContentHeight);
                setOverSpeed(false);
            }, 100));
            return;
        }

        // 向下滚动，内容上移
        if (scrollTop > prevScrollTop) {
            // 距最底部内容滚动到视口小于 dist 距离长度时，更换数据
            const curDistance = offsetTop +
                contentHeight -
                scrollTop -
                height;
            if (curDistance < minDistance) {
                setStepAndOffsetTop(index + range, halfContentHeight);
            }
        }
        // 向上滚动，内容下移
        else {
            const curDistance = scrollTop - offsetTop;
            if (curDistance < minDistance) {
                setStepAndOffsetTop(index - range, halfContentHeight);
            }
        }
    };

    useEffect(() => {
        if (shouldRenderDirectly) {
            return;
        }
        // 计算实际内容高度及 所有内容的总高度
        const contentHeight = contentRef.current.clientHeight;
        setContentHeight(contentHeight);
        setTotalHeight(contentHeight / 2 * (data.length / range));
    }, [data]);


    return {
        // 占位div高度
        placeholderHeight: totalHeight,

        // 内容
        contentRef,
        contentStyle: { transform: `translate3d(0,${offsetTop}px,0)` },
        data: shouldRenderDirectly ? data : data.slice(index, index + (2 * range)),

        // 状态及数据
        index: index,
        shouldRenderDirectly,

        // 容器
        containerStyle: {
            height: height,
            position: 'relative',
            overflowY: 'auto',
            // overflowX: 'hidden'
        },
        handleContainerScroll: handleScroll,
        overSpeed: overSpeed,
    };

};
