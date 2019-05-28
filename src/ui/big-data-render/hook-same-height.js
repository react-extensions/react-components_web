// TODO: 来回切换数据可能导致白屏

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
 */
export default function useBigDataRender({
    data = [],
    range = 50,
    height = 300,
}) {
    const doubleRange = range * 2;
    /**
     * 用于包裹内容的容器， 通过offsetTop控制位置
     */
    const contentRef = createRef();

    /**
     * 总数据量小于 range * 2，直接渲染
     */
    const shouldRenderDirectly = data.length < doubleRange;

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
     * 超速滚动情况
     */
    const [timer, setTimer] = useState(null);

    /**
     * flag，标志正在滚动
     */
    const [scrolling, setScrolling] = useState(true);

    /**
     * flag，标志有数据更新
     */
    const [hasDataChanged, setHasDataChanged] = useState(false);

    /**
     * 当前范围渲染数据的起始索引值
     */
    const currentIndex = step * range;

    /**
     * 处理视口容器滚动事件
     */
    const handleScroll = () => {
        /**
         * - 直接渲染的情况没必要执行
         * 
         * - 当大数据渲染组件内部放了一些可以滚动的元素时，元素的scroll也会触发此函数
         */
        if (shouldRenderDirectly) {
            return;
        }

        setScrolling(true);
        clearTimeout(timer);
        setTimer(setTimeout(() => {
            setScrolling(false);
        }, 32));
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
        if (doubleRange >= last) {
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

        nextOffsetTop = nextOffsetTop === undefined
            ? computeOffsetTopByStep(nextStep)
            : nextOffsetTop;

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
     */
    const computeStepAndOffsettopByScrollTop = function (scrollTop) {
        if (scrollTop === 0 || contentHeight === 0) {
            return [0, 0];
        }
        const step = Math.floor(scrollTop / (contentHeight / 2));
        const offsetTop = computeOffsetTopByStep(step);
        return [step, offsetTop];
    };

    /**（同步执行）
     * data长度改变时，重置数据及状态
     */
    useMemo(() => {
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
        if (currentIndex > data.length) {
            setStep(0);
            setOffsetTop(0);
            setIsBottom(false);
        }
    }, [data.length]);

    /**（didMounted, didUpdate）
     * data长度改变，节点更新后，重新计算step
     */
    useEffect(() => {
        if (shouldRenderDirectly) {
            return;
        }
        /**
         * 数据更新后要重新计算位置，设置isDataChange为true,触发一次下方的 useEffect
         */
        setHasDataChanged(true);

        /**（TODO）
         * 获取渲染出来的内容高度，并估算总高度
         */
        const contentHeight = contentRef.current.clientHeight;
        const totalHeight = (data.length / doubleRange) * contentHeight;

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
         * 重新存储高度信息
         */
        setContentHeight(contentHeight);
        setTotalHeight(totalHeight);
    }, [data.length]);

    /**
     * 滚动完成后，重新计算位置
     */
    useEffect(() => {
        if (scrolling && !hasDataChanged) {
            return;
        }
        const scrollTop = contentRef.current.parentElement.parentElement.scrollTop;
        const [nextStep, nextOffsetTop] = computeStepAndOffsettopByScrollTop(scrollTop);
        setHasDataChanged(false);
        setStepAndOffsetTop(nextStep, nextOffsetTop);
    }, [scrolling, hasDataChanged]);

    /**
     * 
     * hook return value
     */
    return {
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
