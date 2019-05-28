import {
    createRef,
    useState,
    useEffect,
    useMemo,
} from 'react';

/**
 * 大数据渲染hook
 * @param {array} data 数据
 * @param {number} range 实际渲染数量的 1/2
 * @param {number} height 视口高度
 * @param {number} minDistance 最小触发距离
 * @param {function} querySelect 
 */
export default function useBigDataRender({
    data = [],
    range = 50,
    height = 300,
    minDistance = 50,
    querySelect,
}) {
    /**
     * 用于包裹内容的容器， 通过offsetTop控制位置
     */
    const contentRef = createRef();

    /**
     * 总数据量小于 range * 2，直接渲染
     */
    const shouldRenderDirectly = data.length < (range * 2);

    /**
     * --- --- --
     * main hooks
     * --- --- --
     * 
     * 
     * 从index开始截取 到 (step+2)*range 用于渲染
     */
    const [step, setStep] = useState(0);

    /**
     * 控制内容wrap元素
     */
    const [offsetTop, setOffsetTop] = useState(0);

    /**
     * 是否滚动到底部，阻止在底部时重复触发
     */
    const [isBottom, setIsBottom] = useState(false);

    /**
     * 所有数据的总高度
     */
    const [totalHeight, setTotalHeight] = useState('auto');

    /**
     * 所有数据的总高度
     */
    const [contentHeight, setContentHeight] = useState(0);

    /**
     * data初始化或更新完成， rangeHeightList、totalHeight 已被初始化
     */
    const [rangeHeightListCompleted, setCompleted] = useState(false);
    // const [rangeHeightList, setRangeHeightList] = useState(new Array(Math.ceil(data.length / range)));

    /**
     * 超速滚动情况
     */
    const [timer, setTimer] = useState(null);

    /**
     * 是否超速
     */
    const [overSpeed, setOverSpeed] = useState(false);

    /**
     * 就是scrollTop，用于算速度
     */
    const [prevScrollTop, setPrevScrollTop] = useState(0);

    /**
     * 记录上次触发scroll时间的时间，用于算速度
     */
    const [prevTime, setPrevTime] = useState(0);

    /**
     * 处理视口容器滚动事件
     * @param {event} e 
     */
    const handleScroll = (e) => {
        /**
         * - 直接渲染的情况没必要执行
         * 
         * - 当大数据渲染组件内部放了一些可以滚动的元素时，元素的scroll也会触发此函数
         */
        if (
            shouldRenderDirectly
            || e.target !== contentRef.current.parentElement.parentElement
        ) {
            return;
        }

        const wrapEl = e.target;
        const scrollTop = wrapEl.scrollTop;
        console.log('scroll', scrollTop);

        /**
         * 存储上一次滚动的时间，该时间用于计算滚动速度
         */
        const time = Number(new Date());

        /**
         * 速度 px/ms 
         */
        const speed = Math.abs(scrollTop - prevScrollTop) / (time - prevTime);

        /**
         * 保存滚动位置 时间
         */
        setPrevTime(time);
        setPrevScrollTop(scrollTop);

        /**
         * 当速度大于20px/ms，判断为超速，此时没必要一直计算渲染，等停下再计算
         */
        if (speed > 20) {
            setOverSpeed(true);

            /**
             * 延迟函数，判断如果 100ms 内没触发第二次超速，则开始计算渲染
             */
            clearTimeout(timer);
            setTimer(setTimeout(() => {
                // setOverSpeed(false);
                // console.log('重置！！');
                // const [nextStep, nextOffsetTop] = computeStepAndOffsettopByScrollTop(scrollTop, contentHeight);
                // setStepAndOffsetTop(nextStep, nextOffsetTop);
            }, 200));
            return;
        }

        /**
         * 向下滚动，内容上移
         */
        if (scrollTop > prevScrollTop) {
            /**
             * 距最底部内容滚动到视口小于 dist 距离长度时，更换数据
             * 滚动时的位置计算 要根据 content 元素实时高度计算
             */
            const curDistance = offsetTop + contentHeight - scrollTop - height;
            if (curDistance < minDistance) {
                const abs = Math.abs(curDistance);
                const addStep = Math.floor(abs / (contentHeight * 2)) || 1;
                const nextStep = step + addStep;
                setStepAndOffsetTop(nextStep);
            }
        } else {
            /**
             * 向上滚动，内容下移
             */
            const curDistance = scrollTop - offsetTop;
            if (curDistance < minDistance) {
                const abs = Math.abs(curDistance);
                const reduceStep = Math.floor(abs / (contentHeight * 2)) || 1;
                const nextStep = step - reduceStep;
                setStepAndOffsetTop(nextStep);
            }
        }
    };

    /**
     * 设置step和offsetTop（滚动事件处理的最终步骤）
     * @param {number} nextStep 
     * @param {undefined|number} nextOffsetTop 
     */
    const setStepAndOffsetTop = (nextStep, nextOffsetTop) => {
        if (nextStep <= 0) {
            // 顶部
            setStep(0);
            setOffsetTop(0);
            setIsBottom(false);
            return;
        }
        const last = data.length - nextStep * range;
        if ((2 * range) >= last) {
            // 底部
            if (isBottom) {
                return;
            }
            // 容错
            if (last < range) {
                nextStep -= 1;
            }
            setIsBottom(true);
        } else {
            // 中间
            setIsBottom(false);
        }
        /**
          * 在最底部的时候，情况如下图例：
          * 图例: 
          * |---| 为 1 range
          * |--- --- --- --- --- --- --- --- --- -|    实际总数据量
          * |--- ---|--- ---|--- ---|--- ---|--- -|    每一间隔代表实际渲染的 数据
          * |---|---|---|---|---|---|---|---|          index递增情况
          * 可以看到，因为step 以 range 为一个单位递增或递减
          * 所以即使满足 (nextStep + 2) * range >= data.length - 1
          * 渲染的数据量也不会小于一个range，即，不会导致问题
          */
        setStep(nextStep);
        /* eslint-disable */
        nextOffsetTop = nextOffsetTop === undefined
            ? computeOffsetTopByStep(nextStep)
            : nextOffsetTop;
        /* eslint-enable */
        setOffsetTop(nextOffsetTop);
    };

    /**（TODO）
     * 根据step计算计算 offsetTop
     * @param {number} step 
     */
    const computeOffsetTopByStep = function (step) {
        let newOffsetTop = step * contentHeight / 2;
        return newOffsetTop;
    };

    /**（TODO）
     * 根据当前的scrollTop计算step和offsetTop
     * @param {*} scrollTop 
     * @param {*} height 
     */
    const computeStepAndOffsettopByScrollTop = function (scrollTop, height) {
        if (scrollTop === 0 || height === 0) {
            return [0, 0];
        }
        const step = Math.floor(scrollTop / height);
        const offsetTop = computeOffsetTopByStep(step);
        return [step, offsetTop];
    };

    /**（同步执行）
     * data长度改变时，重置数据及状态
     */
    useMemo(() => {
        setOverSpeed(false);
        setCompleted(false);
        clearTimeout(timer);

        /**
         * 如果切换到直接渲染，则归位元素样式到原生状态
         */
        if (shouldRenderDirectly) {
            setStep(0);
            setOffsetTop(0);
            setTotalHeight('auto');
        }

        /**
         * 假设data = 3000，range = 50，在滚动到接近底部，假设此时step为58，
         * 如果将data切换成1200条，此时：
         * data.slice(step, (step + 2) * range) => data.slice(58, (58 + 2) * 50) => []
         * 返回值将为空数组，导致无节点渲染，故将step重置为0，待更新后再根据scrollTop计算出
         * 实际的step
         */
        if (step * range > data.length) {
            setStep(0);
        }
    }, [data.length]);

    /**（didMounted, didUpdate）
     * data长度改变，节点更新后，重新计算step
     */
    useEffect(() => {
        setCompleted(true);

        if (shouldRenderDirectly) {
            return;
        }

        /**（TODO）
         * 获取渲染出来的内容高度，并估算总高度
         */
        const contentHeight = contentRef.current.clientHeight;
        const totalHeight = data.length / (range * 2) * contentHeight;

        /**
         * 如果内容高度小于视口容器高度，报错
         */
        if (process.env.NODE_ENV === 'development' && contentHeight < height) {
            throw RangeError(
                'looks like 2 * range(' + range + ') data\'s total height are less ' +
                'than the height you set to big-data-render-hook(' + contentHeight + '<' + height + ')' +
                'maybe you need to increase the range to > ' + range
            );
        }

        /**
         * recompute step，对应上方data由3000=>1200的情况
         */
        if (step === 0 && prevScrollTop !== 0) {
            const scrollTop = totalHeight < prevScrollTop
                ? (totalHeight - contentHeight - 1)
                : prevScrollTop;
            const [nextStep, nextOffsetTop] = computeStepAndOffsettopByScrollTop(scrollTop, contentHeight);
            setStepAndOffsetTop(nextStep, nextOffsetTop);
        }
        setContentHeight(contentHeight);
        setTotalHeight(totalHeight);
    }, [data.length]);

    /**（didMounted, didUpdate）
     * step更新后，再次校验内容是否移动到视口内
     */
    useEffect(() => {
        if (overSpeed) {
            return;
        }
        const scrollTop = contentRef.current.parentElement.parentElement.scrollTop;
        const curDistance = offsetTop + contentHeight - scrollTop - height;
        // if (curDistance < minDistance) {
        //     const [nextStep, nextOffsetTop] = computeStepAndOffsettopByScrollTop(scrollTop, contentRef.current.clientHeight);
        //     setStepAndOffsetTop(nextStep, nextOffsetTop);
        // } else if ((scrollTop - offsetTop) < minDistance) {
        //     const [nextStep, nextOffsetTop] = computeStepAndOffsettopByScrollTop(scrollTop, contentRef.current.clientHeight);
        //     setStepAndOffsetTop(nextStep, nextOffsetTop);
        // }
        // if (scrollTop < offsetTop || curDistance < minDistance) {
        //     const [nextStep, nextOffsetTop] = computeStepAndOffsettopByScrollTop(scrollTop, contentHeight);
        //     setStepAndOffsetTop(nextStep, nextOffsetTop);
        // }
        console.log('didUpdate）', scrollTop);

        console.log(scrollTop < offsetTop, curDistance < minDistance);

    }, [overSpeed]);


    /**
     * 当前范围渲染数据的起始索引值
     */
    const currentIndex = step * range;

    /**
     * 
     * hook return value
     */
    return {
        /**
         * 超速
         */
        overSpeed: overSpeed,

        /**
         * 状态及数据
         */
        index: currentIndex,
        shouldRenderDirectly,

        /**
         * 容器
         */
        containerStyle: {
            height: height,
            position: 'relative',
            overflowY: 'auto',
        },
        handleContainerScroll: handleScroll,

        /**
         * 占位div高度
         */
        placeholderHeight: totalHeight,

        /**
         * 内容
         */
        contentRef,
        contentStyle: { transform: `translate3d(0,${offsetTop}px,0)`, },
        data: shouldRenderDirectly ? data : data.slice(currentIndex, (step + 2) * range),
    };
};
