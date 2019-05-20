/*
 * @Author: L.S
 * @Email: fitz-i@foxmail.com
 * @Description: 
 * @Date: 2019-04-04 13:50:14
 * @LastEditTime: 2019-05-20 18:59:12
 */

//
// .______   .______        ______   
// |   _  \  |   _  \      /  __  \  
// |  |_)  | |  |_)  |    |  |  |  | 
// |   ___/  |      /     |  |  |  | 
// |  |      |  |\  \----.|  `--'  | 
// | _|      | _| `._____| \______/  oooooooooooooooooooooooooooooooooooooooooooooo
//

import {
    createRef,
    useState,
    useEffect,
    useMemo,
} from 'react';

export default function useBigDataRender({
    data = [],
    range = 50,
    height = 300,
    querySelect
}) {
    const contentRef = createRef();

    const [step, setStep] = useState(0); // 从index开始截取 到 (step+2)*range 用于渲染
    const [offsetTop, setOffsetTop] = useState(0); // 控制内容wrap元素
    const [totalHeight, setTotalHeight] = useState('auto'); // 所有数据的总高度
    const [isBottom, setIsBottom] = useState(false); // 是否滚动到底部了
    const [rangeHeightListCompleted, setCompleted] = useState(false); // data初始化或更新完成， rangeHeightList、totalHeight 已被初始化
    const [rangeHeightList, setRangeHeightList] = useState(new Array(Math.ceil(data.length / range)));
    // 超速滚动
    const [timer, setTimer] = useState(null);
    const [overSpeed, setOverSpeed] = useState(false); // 速度是不是太快了
    const [prevScrollTop, setPrevScrollTop] = useState(0); // 就是scrollTop，用于算速度
    const [prevTime, setPrevTime] = useState(0); // 记录上次触发scroll时间的时间，用于算速度

    // 总数据量小于 range * 2，直接渲染
    const shouldRenderDirectly = data.length < (range * 2);


    /**
     * 处理容器滚动
     * @param {event} e 
     */
    const handleScroll = function (e) {
        if (shouldRenderDirectly || e.target !== contentRef.current.parentElement.parentElement) {
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
            setTimer(setTimeout(() => {
                console.log(`重置！`, scrollTop);
                console.table({
                    range,
                    step,
                    scrollTop,
                    shouldRenderDirectly,
                });
                setOverSpeed(false);
                const [nextStep, nextOffsetTop] = getIndexAndOffsetTopByScrollTop(scrollTop);
                console.table({
                    nextStep,
                    nextOffsetTop,
                });
                setStepAndOffsetTop(nextStep, nextOffsetTop);
            }, 100));
            return;
        }

        //this.props.distance
        const minDistance = 50;
        // 向下滚动，内容上移
        if (scrollTop > prevScrollTop) {
            // 距最底部内容滚动到视口小于 dist 距离长度时，更换数据
            // 滚动时的位置计算 要根据 content 元素实时高度计算
            const curDistance = offsetTop + contentRef.current.clientHeight - scrollTop - height;
            if (curDistance < minDistance) {
                const nextStep = step + 1;
                setStepAndOffsetTop(nextStep, getOffsetTopByIndex(nextStep));
            }
        }
        // 向上滚动，内容下移
        else {
            const curDistance = scrollTop - offsetTop;
            if (curDistance < minDistance) {
                const nextStep = step - 1;
                setStepAndOffsetTop(nextStep, getOffsetTopByIndex(nextStep));
            }
        }
    };

    /**
     * 设置数据区间的起始位置并移动 content div
     * 这是一个没有‘副作用’ 的函数
     * @param {number} nextStep 
     */
    const setStepAndOffsetTop = (nextStep, nextOffsetTop) => {
        // 顶部
        if (nextStep <= 0) {
            setStep(0);
            setOffsetTop(0);
            setIsBottom(false);
            return;
        }
        // 底部
        const last = data.length - nextStep * range;
        if ((2 * range) >= last) {
            if (isBottom) {
                return;
            }
            // 容错
            if (last < range) {
                nextStep -= 1;
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
        // 可以看到，因为step 以 range 为一个单位递增或递减
        // 所以即使满足 (nextStep + 2) * range >= data.length - 1
        // 渲染的数据量也不会小于一个range
        setStep(nextStep);
        setOffsetTop(nextOffsetTop);
    };

    const getOffsetTopByIndex = function (nextStep) {
        let newOffsetTop = 0;
        for (let i = 0; i < nextStep; i++) {
            newOffsetTop += rangeHeightList[i];
        }
        return newOffsetTop;
    };
    /**
     * 根据传入的视口容器scrollTop
     * 遍历并累加 rangeHeightList 各项的值（高度）
     * 直到总高度 大于 scrollTop
     * 返回 [step, 不大于scrollTop的总高度]
     * 当shuldRenderDirectly为 True时， 不可调用此方法，因为不存在 rangeHeightList
     * @param {number} scrollTop 
     */
    const getIndexAndOffsetTopByScrollTop = function (scrollTop) {
        let totalHeight = 0;
        for (let i = 0, len = rangeHeightList.length; i < len; i++) {
            totalHeight += rangeHeightList[i];
            if (totalHeight > scrollTop) {
                return [i, totalHeight - rangeHeightList[i]];
            }
        }
        return [0, 0];
    };
    /**
     * 计算
     */
    const computeRangeAndTotalHeight = function () {
        if (shouldRenderDirectly) {
            return;
        }
        // 第一range数据渲染出的节点数组
        const nodeList = [].slice.call(querySelect(contentRef.current), 0, range);
        // 节点总高度
        const newRangeHeight = nodeList.reduce((prev, cur) => (prev + cur.clientHeight), 0);
        // 
        const firstRangeHeight = rangeHeightListCompleted ? rangeHeightList[0] : newRangeHeight;
        let newTotalHeight = 0;
        const newRangeHeightList = [];

        // const x = parseInt(((data.length / range) % 1) * 10);



        for (let i = 0, len = rangeHeightList.length; i < len; i++) {
            if (i === step) {
                newTotalHeight += newRangeHeight;
                newRangeHeightList.push(newRangeHeight);
            } else {
                const result = rangeHeightList[i] || firstRangeHeight;
                newTotalHeight += result;
                newRangeHeightList.push(result);
            }
        }

        setTotalHeight(newTotalHeight);
        setRangeHeightList(newRangeHeightList);
    };
    // 同步执行
    useMemo(() => {
        // data改变时，重置数据 及状态
        setOverSpeed(false);
        clearTimeout(timer);
        setCompleted(false);
        setRangeHeightList(new Array(Math.ceil(data.length / range)));
        if (shouldRenderDirectly) {
            setTotalHeight('auto');
            setStep(0);
            setOffsetTop(0);
        }

        // 假设data 有 3000条， 当滚动到底部时，此时 step * range 假设为 2920
        // 如果将data切换成 1200 条，data.slice(step, (step + 2) * range)的
        // 返回值将为空数组， 导致无节点渲染
        // 所以设置成 0 
        // 
        if (step * range > data.length) {
            setStep(0);
        }
    }, [data.length]);

    // 异步执行
    useEffect(() => {
        // 初始化及 data更新，节点渲染完成后，重新计算总高度及
        // 第一range范围内节点高度
        setCompleted(true);
        computeRangeAndTotalHeight();
    }, [data.length]);

    useEffect(() => {
        // data更新 =>节点渲染完成并计算完高度后
        // 根据数据量不同，调整当前视口要显示的数据
        if (!rangeHeightListCompleted || shouldRenderDirectly) {
            return;
        }
        // 对应上方提到的
        // 假设data 有 3000条， 当滚动到底部时，此时 step 假设为 2920, 
        // 此时的prevScrollTop 肯定大于将 data切换成 1200 条时的 totalHeight
        const scrollTop = totalHeight < prevScrollTop ? (totalHeight - rangeHeightList[0] * 2) : prevScrollTop;
        const [nextStep, nextOffsetTop] = getIndexAndOffsetTopByScrollTop(scrollTop);
        setStepAndOffsetTop(nextStep, nextOffsetTop);
    }, [rangeHeightListCompleted]);

    useEffect(() => {
        // 初始化完成之后， 每当index更新后，都去动态的获取第一range范围内节点的高度
        if (!rangeHeightListCompleted) {
            return;
        }
        computeRangeAndTotalHeight();
    }, [step]);

    const startIndex = step * range;
    return {
        // 超速了
        overSpeed: overSpeed,
        // 状态及数据
        index: startIndex,
        shouldRenderDirectly,
        // 容器
        containerStyle: {
            height: height,
            position: 'relative',
            overflowY: 'auto',
        },
        handleContainerScroll: handleScroll,
        // 占位div高度
        placeholderHeight: totalHeight,
        // 内容
        contentRef,
        contentStyle: {
            transform: `translate3d(0,${offsetTop}px,0)`,
        },
        data: shouldRenderDirectly ? data : data.slice(startIndex, (step + 2) * range),
    };
};
