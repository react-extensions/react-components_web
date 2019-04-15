/*
 * @Author: LI SHUANG
 * @Email: fitz-i@foxmail.com
 * @Description: 
 * @Date: 2019-03-13 18:14:57
 * @LastEditTime: 2019-04-03 13:39:15
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

import React from 'react';
import useBigDataRender from './hooks';

function BigDataRender({
                           data,
                           height,
                           range,
                           children
                       }) {

    const {
        // 容器
        containerStyle,
        handleContainerScroll,
        // 轨道
        trackHeight,
        //  内容
        contentRef,
        contentStyle,
        data: subData,
        index,
        // overSpeed,
        // 状态及数据
        shouldRenderDirectly,
    } = useBigDataRender({
        data,
        height,
        range
    });

    return (
        <div
            onScroll={handleContainerScroll}
            style={containerStyle}
        >
            <div style={shouldRenderDirectly ? null : {height: trackHeight}}>
                {
                    shouldRenderDirectly ?
                        children(data) :
                        (
                            <div
                                ref={contentRef}
                                style={contentStyle}
                            >
                                {
                                    children(subData, index)
                                }
                            </div>
                        )
                }
            </div>
        </div>
    );
}

export default BigDataRender;