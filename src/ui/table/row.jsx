import React from 'react';
import ExpandRow from './expand-row';
import Checkbox from './checkbox';
import PropTypes from 'prop-types';
import cn from './utils/class-name';
import Icon from '../icon';

const HOVER = 'HOVER';
const HEIGHT = 'HEIGHT';
const EXPAND = 'EXPAND';
const EXPAND_HEIGHT = 'EXPAND_HEIGHT';

const isIE9 = /MSIE 9/i.test(window.navigator.usergent);

class Subject {
    constructor(height) {
        this.observerQueue = [];
        this.height = height;
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

    resize() {
        this.observerQueue.forEach(item => {
            item.forceUpdate();
        });
    }
}


class Row extends React.Component {
    constructor(props) {
        super(props);

        // 创建Subject对象
        let syncObj = props.syncRowMap[props.rowKey];

        if (props.needSync) {
            this.expandTr = React.createRef();
            if (!syncObj) {
                syncObj = new Subject(props.height);
                props.syncRowMap[props.rowKey] = syncObj;
            }
            this.removeObjserver = syncObj.addObserver(this);
            this.syncObj = syncObj;
        }

        this.state = {
            isCollapse: true,  // 折叠
            expandContent: null, // 扩展行内容
            expandTrHeight: 0,   // 扩展行 高度
            isHover: false,      // 鼠标移入
            trHeight: syncObj ? syncObj.height : (props.height || null)       // 行宽度
        };

        this.mounted = false;
        this.getTrHeight = this.getTrHeight.bind(this);
    }

    componentDidMount() {
        this.mounted = true;
    }

    shouldComponentUpdate(N_P, N_S) {
        const C_P = this.props;
        const C_S = this.state;

        return N_S.isHover !== C_S.isHover ||
            C_P.columns !== N_P.columns ||
            C_P.rowData !== N_P.rowData ||
            C_P.rowIndex !== N_P.rowIndex ||
            C_P.rowKey !== N_P.rowKey ||
            N_S.isCollapse !== C_S.isCollapse ||
            N_S.expandTrHeight !== C_S.expandTrHeight ||
            N_S.trHeight !== C_S.trHeight;
    }


    componentWillUnmount() {
        this.removeObjserver && this.removeObjserver(len => {
            if (len === 0) {
                delete this.props.syncRowMap[this.props.rowKey];
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
        if (!el){
            return;
        }
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
    }


    // 具有扩展功能的表格
    expand(expandContent, e) {
        // 阻止触发 click
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
        if (this.props.isFixed || this.state.isCollapse || !this.props.needSync) {
            return;
        }
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
        if (!el) {
            return;
        }
        this.props.onRowMount(col, el.offsetWidth);
    }

    render() {
        const props = this.props;

        if (!props.rowData) {
            return null;
        }

        const state = this.state;

        return props.isBottom ?
            (
                <tr
                    className={'r-tr'}
                    ref={this.getTrHeight}
                    style={{height: state.trHeight}}
                >
                    {this.mapRow()}
                </tr>
            ) :
            (
                <React.Fragment>
                    <tr className={
                        cn(
                            'r-tr',
                            props.bgColor,
                            state.isHover && '_active',
                            props.className
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
                            <tr className='r-expand-tr'
                                ref={this.expandTr}
                                style={props.isFixed ? {height: state.expandTrHeight} : null}>
                                <td colSpan={props.columns.length} className='r-expand-td'>
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
            className={cn('r-td-content', (col.width ? '_fill' : ''))}
            ref={!this.mounted && this.collectWidth.bind(this, col)}>
            {child}
        </div>
    );
};

const renderTdContent = function (col) {
    const {rowData, rowIndex, rowKey, isBottom, rowSelection} = this.props;
    const {isCollapse} = this.state;
    return isBottom ?
        renderTdContentWrap.call(this, col, rowData[col.type || col.prop] || null) :
        col.type === 'checkbox' ?
            (
                <Checkbox
                    value={rowKey}
                    rowData={rowData}
                    rowIndex={rowIndex}
                    getCheckboxProps={rowSelection.getCheckboxProps}
                />
            ) :
            col.type === 'radio' ?
                (
                    null
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
                            (rowData[col.prop] || rowData[col.prop] === 0 || col.render) &&
                            renderTdContentWrap.call(
                                this,
                                col,
                                (
                                    col.render ?
                                        col.render(
                                            rowData[col.prop],
                                            Object.assign({}, rowData),
                                            rowIndex
                                        ) :
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
                    className={cn('r-td', col.type ? '_align-center' : (col.align ? `_align-${col.align}` : ''), col.className)}
                    onClick={this.clickRow.bind(this, j, col.prop)}
                >
                    {renderTdContent.call(this, col)}
                </td>
            );
        })
    );
};


const noWork = () => null;

Row.defaultProps = {
    disabled: false,
    onClick: noWork,
    height: 60
};

Row.propTypes = {
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
    height: PropTypes.number
};

export default Row;