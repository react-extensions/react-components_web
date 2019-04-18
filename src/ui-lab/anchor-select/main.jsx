import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
    Provider
} from './context';
import {animation} from '@/libs/utils';

const anchorList = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'Y', 'Z', '#'];

class AnchorSelect extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedMap: {} // 选中项组成的map
        };
        // 受控组件
        this.isControlled = props.hasOwnProperty('selectedQueue');

        this.activeAnchorMap = {}; // 上方  激活的锚点 Map

        this.anchorElMap = {}; // 存储 下方部分 所有锚点元素

        this.optionsWrapperEl = React.createRef();
        this.getAnchorEl = this.getAnchorEl.bind(this);
        this.toggleOptionSelect = this.toggleOptionSelect.bind(this);
    }


    static getDerivedStateFromProps(props) {
        if (!props.selectedQueue) {
            return null;
        }
        const obj = {};
        props.selectedQueue.forEach(id => {
            obj[id] = true;
        });

        return {
            selectedMap: obj
        };

    }
    /**
     * 强制更新下，激活顶部锚点列表状态
     */
    componentDidMount() {
        this._isMounted = true;
        this.forceUpdate();
    }

    /**
     * 点击一个选项
     * @param {number|string} id 点击项的唯一 id
     * @param {boolean} shouldSelected 是否应该选中
     */
    toggleOptionSelect(id, shouldSelected) {
        const newState = Object.assign({}, this.state.selectedMap);
        if (!shouldSelected) {
            delete newState[id];
        } else {
            newState[id] = true;
        }

        const arr = [];
        for (let id in newState) {
            if (newState[id]) {
                arr.push(id);
            }
        }
        this.props.onSelectChange(arr);

        // 非受控组件
        if (!this.isControlled) {
            this.setState({
                selectedMap: newState
            });
        }
    }

    /**
     * 切换顶部哪些锚点有效 并激活有效锚点
     * @param {string} anchor 
     * @param {boolean} isActive 
     */
    toggleActiveAnchor(anchor, isActive) {
        this.activeAnchorMap[anchor] = isActive;
        if (this._isMounted) {
            this.forceUpdate();
        }
    }
    /**
     * 获取锚点元素
     * @param {string} anchor 
     * @param {*} el 
     */
    getAnchorEl(anchor, el) {
        if (!el) {return;}
        this.anchorElMap[anchor] = el;
    }
    /**
     * 点击上方字母，定位到相应的锚点
     * @param {string} anchor 
     */
    positionAnchor(anchor) {
        if (this.breakAnim) {
            this.breakAnim();
        }
        const wrapperEl = this.optionsWrapperEl.current;
        const anchorEl = this.anchorElMap[anchor];
        if (!anchorEl) {return;}
        const target = anchorEl.offsetTop;
        this.breakAnim = animation(wrapperEl.scrollTop, target, v => {
            wrapperEl.scrollTop = v;
        });
    }

    render() {

        return (
            // <div className='n-anchor-select'>
            <div className='n-anchor-select-container'>
                <div className='_anchor-wrapper'>
                    {
                        anchorList.map(anchor => (
                            <span
                                className={'_anchor-item' + (this.activeAnchorMap[anchor] ? ' _active' : '')}
                                key={anchor}
                                onClick={this.positionAnchor.bind(this, anchor)}
                            >
                                {anchor}
                            </span>
                        ))
                    }
                </div>
                <div className='_select-all-btn'>全部</div>
                <div className='_options-wrapper' ref={this.optionsWrapperEl}>
                    <div className='_track'>
                        <Provider value={{
                            parent: this,
                            selectedMap: this.state.selectedMap
                        }}>
                            {this.props.children}
                        </Provider>
                    </div>
                </div>
            </div>
            // {/* </div> */}
        );
    }
}

AnchorSelect.propTypes = {
    onSelectChange: PropTypes.func,
    anchorList: PropTypes.array
};


AnchorSelect.defaultProps = {
    onSelectChange: () => null,
    anchorList: anchorList
};

export default AnchorSelect;

