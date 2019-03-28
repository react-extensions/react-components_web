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
            index: 0,
        };
        this.step = 1;
        this.containerEl = React.createRef();
        this.renderNodeQueue = [];

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
        if(data.length < range) return;
        this.setState({
            totalHeight: this.containerEl.current.scrollHeight * (data.length / range)
        });
    }
    getItem(index, el) {
        if (!el) return;
        this.renderNodeQueue[index] = ReactDOM.findDOMNode(el);
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
                const queue = this.renderNodeQueue;
                const distance = scrollTop - this.state.offsetTop - minDistance;
                for (let i = 0, len = queue.length; i < len; i++) {
                    if (!queue[i]) return;
                    if (queue[i].offsetTop > distance) {

                        let index = i - 1 + this.state.index;
                        const prevItem = queue[i - 1];
                        let offsetTop = (prevItem ? prevItem.offsetTop : 0) + this.state.offsetTop;

                        const lastIndex = this.props.data.length - this.props.range;
                        const lastOffsetTop = wrapEl.scrollHeight - containerEl.clientHeight;

                        if (index > lastIndex || offsetTop > lastOffsetTop) {
                            index = lastIndex;
                            offsetTop = lastOffsetTop;
                        }

                        this.setState({
                            index: index,
                            offsetTop: offsetTop
                        });
                        return;
                    }
                }
            }
        }
        // 向上滚动，内容下移
        else {
            const curDistance = scrollTop - this.state.offsetTop;
            if (curDistance < minDistance) {
                // console.log('上滚触发')

                const distance = this.props.height + minDistance + curDistance;
                const queue = this.renderNodeQueue;
                for (let i = 0, len = queue.length; i < len; i++) {
                    if (!queue[i]) return;

                    if (queue[i].offsetTop > distance) {

                        let index = this.state.index + 1 - (this.props.range - i);
                        let offsetTop = this.state.offsetTop - (containerEl.clientHeight - distance);

                        if (index < 0 || offsetTop < 0) {
                            index = 0;
                            offsetTop = 0;
                        }

                        this.setState({
                            index: index,
                            offsetTop: offsetTop
                        });
                        return;
                    }
                }
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
            index,
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
                                {
                                    React.Children.map(children(data.slice(index, index + range)), (child, index) => (
                                        React.cloneElement(child, Object.assign({}, child.props, { ref: this.getItem.bind(this, index) }))
                                    ))
                                }
                            </div>
                        )
                    }
                </div>
            </div>
        );
    }
}

BigDataRender.defaultProps = {
    range: 25, // 一页展示项目的数量, 要求项目总高度要大于容器高度
    height: 200, // 容器高度
    distance: 50 // 最小触发距离 单位px
};

BigDataRender.propTypes = {
    distance: PropTypes.number,
    range: PropTypes.number,
    height: PropTypes.number,
};

export default BigDataRender;