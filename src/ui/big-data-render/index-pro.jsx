/*
 * @Author: LI SHUANG
 * @Email: fitz-i@foxmail.com
 * @Description: 
 * @Date: 2019-03-13 18:14:57
 * @LastEditTime: 2019-05-14 20:55:11
 */

import React from 'react';
import useBigDataRender from './hooks-pro';

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
        // 占位div
        placeholderHeight,
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
            <div style={shouldRenderDirectly ? null : {height: placeholderHeight}}>
                {
                    shouldRenderDirectly ?
                        children(data) :
                        (
                            <div
                                ref={contentRef}
                                style={contentStyle}
                            >
                                { children(subData, index) }
                            </div>
                        )
                }
            </div>
        </div>
    );
}

export default BigDataRender;