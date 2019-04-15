import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './style.less'
import {
    Provider
} from './context'


const anchorList = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'Y', 'Z', '#']


class anchorSelect extends Component {
    constructor(props) {
        super(props)
        this.state = {
            selectedMap: {},
            anchorList: []
        }

        this.anchorMap = {} // 存储所有锚点元素
        this.selectedQueue = []

        this.optionsWrapperEl = React.createRef()
        this.getAnchorEl = this.getAnchorEl.bind(this)
    }
    getDrivedStateFromProps(props, state) {
        if(!props.data) return null
        const obj = {}
        // props.data.map

        return {
            anchorList: props.data.map
        }
    }
    /**
     * 获取锚点元素
     * @param {string} anchor 
     * @param {*} el 
     */
    getAnchorEl(anchor, el) {
        if (!el) return
        this.anchorMap[anchor] = el
    }
    /**
     * 点击上方字母，定位到相应的锚点
     * @param {string} anchor 
     */
    positionAnchor(anchor) {
        if (this.breakAnim) {
            this.breakAnim()
        }
        const wrapperEl = this.optionsWrapperEl.current
        const anchorEl = this.anchorMap[anchor]
        if (!anchorEl) return
        const target = anchorEl.offsetTop
        this.breakAnim = animation(wrapperEl.scrollTop, target, v => {
            wrapperEl.scrollTop = v
        })
    }
    /**
     * 点击一个选项
     * @param {any} option 
     */
    selectOption(option, anchor) {
        const key = option[this.props.optionKeyName]
        const selectedMap = this.state.selectedMap
        const subMap = selectedMap[anchor] || {}
        const shouldSelected = !subMap[key]

        this.setState({
            selectedMap: Object.assign({}, selectedMap, {
                [anchor]: Object.assign({}, subMap, {
                    [key]: shouldSelected
                })
            })
        })

        if (shouldSelected) {
            this.selectedQueue.push(option)
        } else {
            this.selectedQueue = this.selectedQueue.filter(item => item !== option)
        }
        console.log(this.selectedQueue)
        this.props.onSelectChange(this.selectedQueue)
    }
    render() {
        const optionKeyName = this.props.optionKeyName
        const optionValueName = this.props.optionValueName
        const selectedMap = this.state.selectedMap
        return (
            <div className='n-anchor-select'>
                <div className='n-anchor-select-container'>
                    <div className='_anchor-wrapper'>
                        {
                            anchorList.map(anchor => (
                                <span
                                    className='_anchor-item'
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
                            {
                                menuList.map(group => (
                                    <div className='_options-group' key={group.anchor}>
                                        <div className='_options-anchor'
                                            ref={this.getAnchorEl.bind(this, group.anchor)}
                                        >
                                            {group.anchor}
                                        </div>
                                        <div className='_option-list'>
                                            {
                                                group.list.map(item => {
                                                    const key = item[optionKeyName]
                                                    const subMap = selectedMap[group.anchor] || {}
                                                    return (
                                                        <div
                                                            key={key}
                                                            className={'_option-item' + (subMap[key] ? ' _active' : '')}
                                                            onClick={this.selectOption.bind(this, item, group.anchor)}
                                                        >
                                                            {item[optionValueName]}
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                    <div className='_statistics-info'></div>
                </div>
            </div>
        );
    }
}

anchorSelect.propTypes = {
    optionKeyName: PropTypes.string,
    optionValueName: PropTypes.string,
    onSelectChange: PropTypes.func,

};

function map(suffix) {
    const arr = []
    for (let i = 0; i < 20; i++) {
        arr.push({
            name: suffix + '-' + i,
            id: i
        })
    }
    return arr
}

const menuList = [
    {
        anchor: 'A',
        list: map('安')
    },
    {
        anchor: 'B',
        list: map('八')
    },
    {
        anchor: 'C',
        list: map('才')
    },
    {
        anchor: 'D',
        list: map('等')
    },
    {
        anchor: 'E',
        list: map('噩')
    },
]


anchorSelect.defaultProps = {
    onSelectChange: () => { },
    optionKeyName: 'id',
    optionValueName: 'name',
    data: menuList
}

export default anchorSelect;




/**
 * 缓动函数
 * @param {number} current 当前数值
 * @param {number} target  目标数值
 * @param {func} callback  回调函数
 * @param {number} step    缓动值
 */
function animation(current, target, callback, step = 3) {
    let shouldBreak = false
    const supportAnimFrame = typeof window !== 'undefined' && window.requestAnimationFrame
    const asyncFn = supportAnimFrame ? window.requestAnimationFrame : setTimeout
    // 缓动函数
    const animFn = () => { current += (target - current) / step }
    // 帧动画
    (function doAnim() {
        if (!shouldBreak && Math.abs(target - current) > 0.5) {
            animFn()
            callback(current, false)
            asyncFn(() => {
                !shouldBreak && doAnim()
            }, 17)
        } else {
            callback(current, true)
        }
    })();
    // 终止动画
    return function breakAnim() {
        shouldBreak = true
    }
}