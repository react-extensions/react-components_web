/*
 * @Author: LI SHUANG
 * @Email: fitz-i@foxmail.com
 * @Description: 
 * @Date: 2019-03-13 18:14:57
 * @LastEditTime: 2019-03-28 17:41:03
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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';


class BigDataRender extends Component {
    constructor(props) {
        super(props);
        this.state = {
            offsetTop: 0,
            totalHeight: 0,
            step: 0
        };

        this.containerEl = React.createRef();
        this.handleScroll = this.handleScroll.bind(this);
    }
    /**
     * 如果 this.props.data发生变化，全部都要重新执行
     */
    componentDidMount() {
        this.computeSize();
    }
    componentDidUpdate(prevProps) {
        if (prevProps.data !== this.props.data) {
            this.computeSize();
        }
    }
    computeSize() {
        const {
            data,
            range
        } = this.props;
        if (data.length < range) return;
        this.setState({
            totalHeight: this.containerEl.current.clientHeight/2 * (data.length / range)
        });
    }
    /**
     * 监听滚动事件
     * @param {*} e 
     */
    handleScroll(e) {
        const wrapEl = e.target;
        const scrollTop = wrapEl.scrollTop;
        // const time = + new Date();
        const prevScrollTop = this.scrollTop || 0;
        // const prevTime = this.time || time;      

        this.scrollTop = scrollTop;
        // this.time = time;

        // if(Math.abs(scrollTop-prevScrollTop)/ (time-prevTime) > 30) {
        //     clearTimeout(this.timer);
        //     this.timer = setTimeout(()=>{
        //         // console.log('reset')
        //     },32);
        //     return;
        // }


        const minDistance = this.props.distance;
        const containerEl = this.containerEl.current;

        // 向下滚动，内容上移
        if (scrollTop > prevScrollTop) {

            // 距最底部内容滚动到视口小于 dist 距离长度时，更换数据
            const curDistance = this.state.offsetTop +
                containerEl.clientHeight -
                scrollTop -
                this.props.height;

            if (curDistance < minDistance) {
                // console.log('下滚触发')
                const step = this.state.step + 1;
                this.setState({
                    offsetTop: (containerEl.clientHeight/2) * step,
                    step: step,
                })
            }
        }
        // 向上滚动，内容下移
        else {
            const curDistance = scrollTop - this.state.offsetTop;
            if (curDistance < minDistance) {
                const step = this.state.step - 1;
                this.setState({
                    offsetTop: (containerEl.clientHeight/2) * step,
                    step: step
                })
            }
        }
    }
    render() {
        const {
            data,
            range,
            children
        } = this.props;
        const {
            step,
            totalHeight,
            offsetTop
        } = this.state;

        const shouldRenderDriectly = data.length < range;

        return (
            <div
                onScroll={shouldRenderDriectly ? null : this.handleScroll}
                style={{
                    height: this.props.height,
                    position: 'relative',
                    overflowY: 'auto',
                    overflowX: 'hidden'
                }}
            >
                <div style={shouldRenderDriectly ? null : { height: totalHeight }}
                >
                    {
                        shouldRenderDriectly ? children(data) : (
                            <div
                                ref={this.containerEl}
                                style={{ transform: `translate3d(0,${offsetTop}px,0)` }}
                            >
                                {children(data.slice(step * range, (step + 2) * range))}
                            </div>
                        )
                    }
                </div>
            </div>
        );
    }
}

BigDataRender.defaultProps = {
    range: 10, // 一页展示项目的数量, 要求项目总高度要大于容器高度
    height: 200, // 容器高度
    distance: 0 // 最小触发距离 单位px
};

BigDataRender.propTypes = {
    distance: PropTypes.number,
    range: PropTypes.number,
    height: PropTypes.number,
};

export default BigDataRender;