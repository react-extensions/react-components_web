/*
 * @Author: L.S
 * @Email: fitz-i@foxmail.com
 * @Description: 
 * @Date: 2019-04-04 13:50:14
 * @LastEditTime: 2019-05-16 09:42:28
 */

/**
 * 该组件要求每个项目高度相同
 */

import { createRef, useState, useEffect, useMemo } from 'react';

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
    const contentRef = createRef();

    // 总数据量小于 range * 2，直接渲染
    const shouldRenderDirectly = data.length < (range * 2);

    /**
     * 设置数据区间的起始位置并移动 content div
     * @param {number} nextIndex 
     */
    const setStepAndOffsetTop = (nextIndex) => {
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
            if (last < range) {
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
        setOffsetTop((contentHeight / 2) * Math.ceil(nextIndex / range));
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
        const scrollTop = wrapEl.scrollTop;

        // 判断是否超速
        const time = Number(new Date());
        // 速度 px/ms
        const speed = Math.abs(scrollTop - prevScrollTop) / (time - prevTime);
        // 保存滚动位置 时间
        setPrevTime(time);
        setPrevScrollTop(scrollTop);
        if (speed > 20) {
            // 超速了， 没必要渲染，等停下再渲染
            setOverSpeed(true);
            clearTimeout(timer);
            const fixContentHeight = contentHeight;
            setTimer(setTimeout(() => {
                const halfContentHeight = fixContentHeight / 2;
                const ranges = Math.floor(scrollTop / halfContentHeight);
                setStepAndOffsetTop(ranges * range, halfContentHeight);
                setOverSpeed(false);
            }, 100));
            return;
        }

        //this.props.distance
        const minDistance = 0;
        // 滚动时的位置计算 要根据 content 元素实时高度计算


        // 向下滚动，内容上移
        if (scrollTop > prevScrollTop) {
            // 距最底部内容滚动到视口小于 dist 距离长度时，更换数据
            const curDistance = offsetTop +
                contentRef.current.clientHeight -
                scrollTop -
                height;
            if (curDistance < minDistance) {
                setStepAndOffsetTop(index + range);
            }
        }
        // 向上滚动，内容下移
        else {
            const curDistance = scrollTop - offsetTop;
            if (curDistance < minDistance) {
                setStepAndOffsetTop(index - range);
            }
        }
    };

    // data改变时，重置数据
    useMemo(() => {
        setIndex(0);
        setOffsetTop(0);
        setOverSpeed(false);
    }, [data]);
    useEffect(() => {
        contentRef.current.parentElement.parentElement.scrollTop = 0;
    }, [data]);

    useEffect(() => {
        if (shouldRenderDirectly) {
            setContentHeight(0);
            setTotalHeight('auto');
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
