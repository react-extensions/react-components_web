import React from 'react';
import Icon from '../../ui/components/icon';
import ExpandRow from './expand-row';
import Checkbox from './checkbox';
import PropTypes from 'prop-types';

import {
    checkType,
    checkStatus
} from './const-data';
import cn from './utils/class-name';

const {CHECKED, HALF_CHECKED, NOT_CHECKED} = checkStatus;
// 状态
const CHECK = 'CHECK';
//
const HEIGHT = 'HEIGHT';
const HOVER = 'HOVER';
const EXPAND = 'EXPAND';
const EXPAND_HEIGHT = 'EXPAND_HEIGHT';

const isIE9 = /MSIE 9/i.test(window.navigator.usergent);

class Subject {
    constructor() {
        this.observerQueue = [];
        this.height = 0;
    }

    emit(key, value, vm) {
        key === HEIGHT && (this.height = value);
        this.observerQueue.forEach(item => item !== vm && item.updateSync(key, value));
    }

    addObserver(observer) {
        this.observerQueue.push(observer);
        return function (callback) {
            this.observerQueue.splice(this.observerQueue.indexOf(observer), 1);
            callback(this.observerQueue.length);
        }.bind(this);
    }

    // window.resize()
    resize() {
        this.observerQueue.forEach(item => {
            item.forceUpdate();
        });
    }
}


/**
 *
 * @prop [array] rowIndex
 */
class Row extends React.Component {
    constructor(props) {
        super(props);

        // 创建Subject对象
        let syncObj = props.syncRowMap[props.rowIndex];

        if (props.needSync) {
            this.expandTr = React.createRef();
            if (!syncObj) {
                syncObj = new Subject();
                props.syncRowMap[props.rowIndex] = syncObj;
            }
            this.removeObjserver = syncObj.addObserver(this);
            this.syncObj = syncObj;
        }

        const isChecked = props.checkStatus === CHECKED;

        props.onChecked(props.rowData, isChecked, props.rowIndex, false);

        this.state = {
            isChecked: isChecked,  // 选中

            isCollapse: true,  // 折叠
            expandContent: null, // 扩展行内容
            expandTrHeight: 0,   // 扩展行 高度
            isHover: false,      // 鼠标移入
            trHeight: props.isFixed ? syncObj.height : null       // 行宽度
        };

        this.mounted = false;
        this.toggleCheck = this.toggleCheck.bind(this);
        this.getTrHeight = this.getTrHeight.bind(this);

    }

    componentDidMount() {
        this.mounted = true;
    }

    // TODO: 把单选多选这种东西提取成独立的部分
    /**
     * 表格行选中 切换
     * */
    toggleCheck(e) {
        if (this.props.disabled) {
            return;
        }
        e && e.stopPropagation();
        const isChecked = !this.state.isChecked;  // 是否选中

        const props = this.props;

        // 发送数据给table
        props.onChecked(props.rowData, isChecked, props.rowIndex);

        this.setState({isChecked: isChecked});

        if (props.needSync) {
            this.syncObj.emit(CHECK, isChecked, this);
        }

    }

    static getDerivedStateFromProps({checkStatus}) {
        if (checkStatus !== HALF_CHECKED) {
            return {
                isChecked: checkStatus === CHECKED
            };
        }
        return null;
    }

    componentDidUpdate(prevProps, prevState) {
        // 变成全选
        // 或 变成全不选
        if (prevState.isChecked !== this.state.isChecked) {
            if (this.props.disabled) {
                this.props.onChecked(this.props.rowData, false, this.props.rowIndex, false);
            }
        }
}


    shouldComponentUpdate(N_P, N_S) {
        const C_P = this.props;
        const C_S = this.state;

        return N_S.isHover !== C_S.isHover ||
            C_P.columns !== N_P.columns ||
            C_P.rowData !== N_P.rowData ||
            C_P.rowIndex !== N_P.rowIndex ||
            C_P.checkStatus !== N_P.checkStatus ||
            C_P.disabled !== N_P.disabled ||
            N_S.isChecked !== C_S.isChecked ||
            N_S.isCollapse !== C_S.isCollapse ||
            N_S.expandTrHeight !== C_S.expandTrHeight ||
            N_S.trHeight !== C_S.trHeight;
    }


    componentWillUnmount() {
        this.removeObjserver && this.removeObjserver(len => {
            if (len === 0) {
                delete this.props.syncRowMap[this.props.rowIndex];
            }
        });
    }

    /**
     * 更新同步数据
     * @param {*} key
     * @param {*} value
     */
    updateSync(key, value) {
        /* eslint-disable */
        switch (key) {
            case HEIGHT:
                this.setState({trHeight: value});
                break;
            case HOVER:
                this.setState({isHover: value});
                break;
            case CHECK:
                this.setState({isChecked: value});
                break;
            case EXPAND:
                this.setState({
                    isCollapse: value.isCollapse,
                    expandContent: this.props.isFixed ? null : value.expandContent
                }, this.getExpandRowHeight);
                break;
            case EXPAND_HEIGHT:
                this.setState({expandTrHeight: value});
                break;
        }
        /* eslint-enable */
    }

    /**
     * 获取tr高度
     * @param {*} el
     */
    getTrHeight(el) {
        if (!el) return;
        const height = el.clientHeight;
        if (this.syncObj.height !== height) {
            this.syncObj.emit(HEIGHT, height, this);
        }
    }

    /**
     * 点击表格单元格
     * */
    clickRow(colIndex, prop, e) {
        const props = this.props;
        props.onClick(e, props.rowData, props.rowIndex, prop, colIndex);

        // // 如果表格为 checkbox 或 radio， 则点击行时， 选中改行
        // if (props.checkState !== checkType.NONE) {
        //     this.toggleCheck(e);
        // }
    }


    // 具有扩展功能的表格
    expand(expandContent, e) {
        if (this.props.disabled) {
            return;
        }
        // 阻止触发 check
        e.stopPropagation();
        const props = this.props;
        const isCollapse = !this.state.isCollapse;

        if (props.needSync) {
            this.syncObj.emit(EXPAND, {isCollapse, expandContent}, this);
        }

        this.setState({
            isCollapse: isCollapse,
            expandContent: props.isFixed ? null : expandContent
        }, this.getExpandRowHeight);

    }

    /**
     * 获取
     */
    getExpandRowHeight() {
        if (this.props.isFixed || this.state.isCollapse || !this.props.needSync) return;
        //this.expandTr.current.clientHeight  在ie9中获取不到值
        //.getBoundingClientRect().height    在普通浏览器中又获取不到值
        const el = this.expandTr.current;
        const height = isIE9 ? el.getBoundingClientRect().height : el.clientHeight;
        this.syncObj.emit(EXPAND_HEIGHT, height, this);
    }

    /**
     * 鼠标移入移出样式
     */
    toggleRowBG(isOn) {
        if (this.props.disabled) {
            return;
        }
        this.setState({isHover: isOn > 0});
        if (this.props.needSync) {
            this.syncObj.emit(HOVER, isOn > 0, this);
        }
    }

    /**
     * 收集td宽度
     * @param {*} col
     * @param {*} el
     */
    collectWidth(col, el) {
        if (!el) return;
        this.props.onRowMount(col, el.offsetWidth);
    }

    render() {
        const props = this.props;
        if (!props.rowData) return null;
        const state = this.state;
        return props.isBottom
            ? (<tr className={'u-tr'} ref={this.getTrHeight} style={{height: state.trHeight}}>{this.mapRow()}</tr>)
            : (
                <React.Fragment>
                    <tr className={
                        cn(
                            'u-tr',
                            props.bgColor,
                            (state.isHover || state.isChecked) && '_active', props.disabled && '_disabled'
                        )
                    }
                        ref={(props.needSync && !props.isFixed) && this.getTrHeight.bind(this)}
                        onMouseLeave={this.toggleRowBG.bind(this, -1)}
                        onMouseEnter={this.toggleRowBG.bind(this, 1)}
                        style={{height: state.trHeight}}
                    >
                        {mapRow.call(this)}
                    </tr>
                    {
                        !state.isCollapse && (
                            <tr className='u-expand-tr'
                                ref={this.expandTr}
                                style={props.isFixed ? {height: state.expandTrHeight} : null}>
                                <td colSpan={props.columns.length} className='u-expand-td'>
                                    {
                                        !props.isFixed ?
                                            (
                                                <ExpandRow
                                                    content={state.expandContent}
                                                    rowData={props.rowData}
                                                />
                                            ) :
                                            null
                                    }
                                </td>
                            </tr>
                        )
                    }
                </React.Fragment>
            );

    }
}


const renderTdContentWrap = function (col, child) {
    return (
        <div title={(typeof child === 'string' || typeof child === 'number') ? child : ''}
             className={cn('u-td-content', (col.width ? '_fill' : ''))}
             ref={!this.mounted && this.collectWidth.bind(this, col)}>
            {child}
        </div>
    );
};

const renderTdContent = function (col) {
    const {rowData, rowIndex, isBottom} = this.props;
    const { isCollapse} = this.state;

    return isBottom ?
        renderTdContentWrap.call(this, col, rowData[col.type || col.prop] || null) :
        (col.type === 'checkbox' || col.type === 'radio') ?
            (
                <Checkbox />
            ) :
            col.type === 'expand' ?
                (
                    <Icon type='arrow-fill'
                          className={'_expand-btn ' + (isCollapse ? '_right' : '_down')}
                          onClick={this.expand.bind(this, col.content)}/>
                ) :
                col.type === 'index' ?
                    (rowIndex + 1) :
                    (
                        (rowData[col.prop] || rowData[col.prop] === 0 || col.filter) &&
                        renderTdContentWrap.call(
                            this,
                            col,
                            (
                                col.filter ?
                                    col.filter(rowData[col.prop], Object.assign({}, rowData), rowIndex) :
                                    rowData[col.prop]
                            )
                        )
                    );

};

const mapRow = function () {
    return (
        this.props.columns.map((col, j) => {
            return (
                <td key={j}
                    className={cn('u-td', col.type ? '_align-center' : (col.align ? `_align-${col.align}` : ''), col.className)}
                    onClick={this.clickRow.bind(this, j, col.prop)}
                >{renderTdContent.call(this, col)}</td>
            );
        })
    );
};


const noWork = () => null;
Row.defaultProps = {
    disabled: false,
    onClick: noWork,

};

Row.propTypes = {
    disabled: PropTypes.bool,
    onClick: PropTypes.func,

};

export default Row;