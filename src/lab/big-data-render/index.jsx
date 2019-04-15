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

import React, {Component} from 'react';
import PropTypes from 'prop-types';

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
            totalHeight: this.containerEl.current.clientHeight / 2 * (data.length / range)
        });
    }

    /**
     * 监听滚动事件
     * @param {*} e
     */
    handleScroll(e) {
        const props = this.props;

        props.onScroll && props.onScroll(e);

        if (props.data.length < props.range) {
            return;
        }

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


        const minDistance = 0; //this.props.distance
        const containerEl = this.containerEl.current;

        // 向下滚动，内容上移
        if (scrollTop > prevScrollTop) {

            // 距最底部内容滚动到视口小于 dist 距离长度时，更换数据
            const curDistance = this.state.offsetTop +
                containerEl.clientHeight -
                scrollTop -
                this.props.height;

            if (curDistance < minDistance) {
                const step = this.state.step + 1;
                this.setState({
                    offsetTop: (containerEl.clientHeight / 2) * step,
                    step: step,
                });
            }
        }
        // 向上滚动，内容下移
        else {
            const curDistance = scrollTop - this.state.offsetTop;
            if (curDistance < minDistance) {
                const step = this.state.step - 1;
                this.setState({
                    offsetTop: (containerEl.clientHeight / 2) * step,
                    step: step
                });
            }
        }
    }

    render() {
        console.log('render big-data-render')
        const {
            data,
            range,
            style,
            children,
            className,
            forwardRef,
            trackClassName
        } = this.props;
        const {
            step,
            totalHeight,
            offsetTop,
        } = this.state;

        const shouldRenderDirectly = data.length < range;

        const extendStyle = Object.assign({}, {
            height: this.props.height,
            position: 'relative',
            overflowY: 'auto',
            overflowX: 'auto'
        }, style);

        return (
            <div
                onScroll={this.handleScroll}
                style={extendStyle}
                className={className || ''}
                ref={forwardRef}
            >
                <div className={trackClassName} style={shouldRenderDirectly ? null : {height: totalHeight}}>
                    {
                        shouldRenderDirectly ?
                            children(data) :
                            (
                                <div
                                    ref={this.containerEl}
                                    style={{transform: `translate3d(0,${offsetTop}px,0)`}}
                                >
                                    {
                                        children(data.slice(step * range, (step + 2) * range), this.step)
                                    }
                                </div>
                            )
                    }
                </div>
                {this.props.render}
            </div>
        );
    }
}



BigDataRender.defaultProps = {
    range: 20, // 一页展示项目的数量, 要求项目总高度要大于容器高度
    height: 200, // 容器高度
    shouldRenderDirectly: false, // 不启用大数据渲染模式
    // distance: 0 // 最小触发距离 单位px
};

BigDataRender.propTypes = {
    // distance: PropTypes.number,
    range: PropTypes.number,
    height: PropTypes.number,
    shouldRenderDirectly: PropTypes.bool
};

export default BigDataRender;