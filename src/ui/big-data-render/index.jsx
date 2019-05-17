/*
 * @Author: LI SHUANG
 * @Email: fitz-i@foxmail.com
 * @Description: 
 * @Date: 2019-03-13 18:14:57
 * @LastEditTime: 2019-05-15 15:35:26
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
        // 占位div
        placeholderHeight,
        //  内容
        contentRef,
        contentStyle,
        data: subData,
        index,
        // overSpeed,
        // 状态及数据
       
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
            <div style={{ height: placeholderHeight }}>
                <div
                    ref={contentRef}
                    style={contentStyle}
                >
                    {children(subData, index)}
                </div>
            </div>
        </div>
    );
}

export default BigDataRender;