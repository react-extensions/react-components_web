/*
 * @Author: L.S
 * @Email: fitz-i@foxmail.com
 * @Description: 
 * @Date: 2019-04-04 13:50:14
 * @LastEditTime: 2019-04-16 16:33:48
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

import React, {useState, useEffect} from 'react';

function useBigDataRender({data = [], range = 50, height = 300}) {

    const [index, setIndex] = useState(0);
    const [offsetTop, setOffsetTop] = useState(0);
    const [totalHeight, setTotalHeight] = useState(0);
    const [prevScrollTop, setPrevScrollTop] = useState(0);
    const [isBottom, setIsBottom] = useState(false);
    const [prevTime, setPrevTime] = useState(0);
    const [overSpeed, setOverSpeed] = useState(false);
    // const [prevScrollLeft, setPrevScrollLeft] = useState(0);

    const [timer, setTimer] = useState(null);
    const contentRef = React.createRef();
    const shouldRenderDirectly = data.length < range;

    const setStepAndOffsetTop = (nextIndex, halfContainerHeight) => {
        // 最底部
        if (nextIndex + (2 * range) > data.length - 1) {
            if (isBottom) {
                return;
            }
            setIsBottom(true);
            setIndex(nextIndex);
            setOffsetTop(halfContainerHeight * Math.ceil(nextIndex / range));
            // setIndex(data.length - (2 * range));
            // setOffsetTop(totalHeight - halfContainerHeight * 2);
        }
        // 顶部
        else if (nextIndex <= 0) {
            setIndex(0);
            setOffsetTop(0);
        }
        // 中间
        else {
            setIsBottom(false);
            setIndex(nextIndex);
            setOffsetTop(halfContainerHeight * Math.ceil(nextIndex / range));
        }
    };

    const handleScroll = function (e) {
        if (shouldRenderDirectly) {
            return;
        }
        const wrapEl = e.target;
        const minDistance = 0; //this.props.distance
        const scrollTop = wrapEl.scrollTop;
        const containerEl = contentRef.current;
        const containerHeight = containerEl.clientHeight;
        const halfContainerHeight = containerHeight / 2;
        // 保存滚动位置
        setPrevScrollTop(scrollTop);

        // const scrollLeft = wrapEl.scrollLeft;
        // if(Math.abs(scrollLeft-prevScrollLeft )> Math.abs(scrollTop-prevScrollTop)) {
        //     setPrevScrollLeft(scrollLeft);
        //     return;
        // }

        // 超速了， 没必要渲染，等停下再渲染
        const time = Number(new Date());
        setPrevTime(time);
        if (Math.abs(scrollTop - prevScrollTop) / (time - prevTime) > 20) {
            setOverSpeed(true);
            clearTimeout(timer);
            setTimer(setTimeout(() => {
                setOverSpeed(false);
                const ranges = Math.floor(scrollTop / halfContainerHeight);
                setStepAndOffsetTop(ranges * range, halfContainerHeight);
            }, 100));
            return;
        }

        // 向下滚动，内容上移
        if (scrollTop > prevScrollTop) {
            // 距最底部内容滚动到视口小于 dist 距离长度时，更换数据
            const curDistance = offsetTop +
                containerHeight -
                scrollTop -
                height;
            if (curDistance < minDistance) {
                setStepAndOffsetTop(index + range, halfContainerHeight);
            }
        }
        // 向上滚动，内容下移
        else {
            const curDistance = scrollTop - offsetTop;
            if (curDistance < minDistance) {
                setStepAndOffsetTop(index - range, halfContainerHeight);
            }
        }
    };

    // 计算总高度
    useEffect(() => {
        if (shouldRenderDirectly) {
            return;
        }
        setTotalHeight(contentRef.current.clientHeight / 2 * (data.length / range));
    }, [data]);


    return {
        // 轨道
        trackHeight: totalHeight,

        // 内容
        contentRef,
        contentStyle: {transform: `translate3d(0,${offsetTop}px,0)`},
        data: shouldRenderDirectly ? shouldRenderDirectly : data.slice(index, index + (2 * range)),

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
        overSpeed: overSpeed
    };

}

export default useBigDataRender;