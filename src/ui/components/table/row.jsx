import React from 'react'
import Icon from '../icon'
import ExpandRow from './expand-row'
import {
    CHECK_TYPE
} from './const-data';
import cn from '../class-name'

/**
 * 有 固定列 (有没有 syncRow)  需同步 ==>>>>>
 * hover  同步
 * checkbox  点击表格行 同步
 * 高度同步
 */

function diff(o, n, c) {
    return o !== n && (o === c || n === c)
}

class Row extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            checked: false,
            collapse: true,
            expandContent: null,
            hoverIndex: -1,
            expandTrHeight: 0
        }

        this.colWidthList = []

        if (props.syncRow) {
            this.expandTr = React.createRef()
        }

        this.checked = this.checked.bind(this)

    }



    componentWillReceiveProps(N_P) {
        const O_P = this.props
            , rowIndex = O_P.rowIndex
            , checkState = O_P.checkState // 1 多选  2 单选  0 没有

            , O_STATUS = O_P.checkStatus
            , N_STATUS = N_P.checkStatus

            , O_SYNC_CHECK = O_P.syncData.check || {}
            , N_SYNC_CHECK = N_P.syncData.check || {}

            , O_SYNC_EXPAND = O_P.syncData.expand || {}
            , N_SYNC_EXPAND = N_P.syncData.expand || {}



        // 控制一下性能
        // 同步表格行数据

        /* HOVER */
        if (diff(O_P.syncData.hover, N_P.syncData.hover, rowIndex)) {
            this.setState({ hoverIndex: N_P.syncData.hover })
        }

        /* CHECK */
        if (checkState === CHECK_TYPE.CHECKBOX) { // 多选

            if (N_STATUS !== O_STATUS) { // table全选
                if (N_STATUS === 1) {
                    this.setState({ checked: true })
                } else if (N_STATUS === -1) {
                    this.setState({ checked: false })
                }
            }

            if (N_STATUS !== 1 && N_STATUS !== -1 && rowIndex === N_SYNC_CHECK.index) {
                this.setState({ checked: N_SYNC_CHECK.checked })
            }

        } else if (checkState === CHECK_TYPE.RADIO) {  // 单选
            if (diff(O_SYNC_CHECK.index, N_SYNC_CHECK.index, rowIndex)) {
                this.setState({ checked: N_SYNC_CHECK.index === rowIndex })
            }
        }

        /* EXPAND */
        if (diff(O_SYNC_EXPAND.index, N_SYNC_EXPAND.index, rowIndex)) {
            this.setState({ expandContent: N_SYNC_EXPAND.content, collapse: !(N_SYNC_EXPAND.index === rowIndex) })
        }
        // 同步expandTr高度
        if (N_SYNC_EXPAND.index === rowIndex && N_P.syncData.expandTrHeight !== this.state.expandTrHeight) {
            N_P.isFixed && this.setState({ expandTrHeight: N_P.syncData.expandTrHeight })
        }

    }
    shouldComponentUpdate(N_P, N_S) {
        const O_P = this.props
            , O_S = this.state

        return O_P.columns !== N_P.columns
            || O_P.tr !== N_P.tr
            || O_P.rowIndex !== N_P.rowIndex
            || N_S.checked !== O_S.checked
            || N_S.hoverIndex !== O_S.hoverIndex
            || N_S.collapse !== O_S.collapse
            || N_S.expandTrHeight !== O_S.expandTrHeight
    }
    /*
    * 有expandTr时，展开或关闭后，同步高度
    *
    * */
    componentDidUpdate(prevP, prevS) {
        const syncRow = prevP.syncRow
        if (prevS.collapse !== this.state.collapse && prevS.collapse && syncRow && !prevP.isFixed) {
            //this.expandTr.current.clientHeight  在ie9中获取不到值
            //.getBoundingClientRect().height    在普通浏览器中又获取不到值
            const el = this.expandTr.current
            const height = /MSIE 9/i.test(window.navigator.userAgent) ? el.getBoundingClientRect().height : el.clientHeight
            syncRow('expandTrHeight', height)
        }
    }
    /**
     * 点击表格单元格
     * */
    clickRow(colIndex, prop, e) {
        const props = this.props

        // 如果表格为 checkbox 或 radio， 则点击行时， 选中改行
        if (props.checkState !== CHECK_TYPE.NONE) {
            this.checked(e)
        }
        props.onTdClick(e, props.tr, props.rowIndex, prop, colIndex)

    }
    // 具有多选功能的表格
    checked(e) {
        e && e.stopPropagation()

        const bool = !this.state.checked
        const props = this.props

        // 发送数据给table
        props.onChecked(props.tr, bool, props.rowIndex)

        if (props.syncRow) {  // 只有 有固定列的时候, 才会有 props.syncRow
            props.syncRow('check', { index: props.rowIndex, checked: bool })
        } else {
            this.setState({ checked: bool })
        }

    }
    // 具有扩展功能的表格
    expand(content, e) {
        e.stopPropagation()
        const collapse = this.state.collapse
        const props = this.props

        if (props.syncRow && props.isFixed) {
            props.syncRow('expand', { index: collapse ? props.rowIndex : -1, content })
        } else {
            this.setState({
                collapse: !collapse,
                expandContent: content
            });
        }

    }

    // 鼠标移入样式
    toggleRowBG(type) {

        const { rowIndex, syncRow } = this.props

        if (syncRow) {
            syncRow('hover', type > 0 ? rowIndex : -1)
        } else {
            this.setState({ hoverIndex: type > 0 ? rowIndex : -1 })
        }

    }

    /**
     *
     * 计算宽度
     *
     * */

    collectWidth(col, el) {
        if (!el) return;
        this.props.onRowMount(col, el.offsetWidth)
    }

    // .______       _______ .__   __.  _______   _______ .______
    // |   _  \     |   ____||  \ |  | |       \ |   ____||   _  \
    // |  |_)  |    |  |__   |   \|  | |  .--.  ||  |__   |  |_)  |
    // |      /     |   __|  |  . `  | |  |  |  ||   __|  |      /
    // |  |\  \----.|  |____ |  |\   | |  '--'  ||  |____ |  |\  \----.
    // | _| `._____||_______||__| \__| |_______/ |_______|| _| `._____|

    renderTdContentWrap(col, child) {
        return (
            <div title={(typeof child === 'string' || typeof child === 'number') ? child : ''}
             className={'u-td-content' + (col.width ? ' _fill' : '') + (col.className ? ` ${col.className}` : '')}
              ref={this.collectWidth.bind(this, col)}>
                {child}
            </div>
        )
    }
    renderTdContent(col) {
        const { columns, tr, rowIndex, isBottom } = this.props//  syncExpandRow, isFixed, 
        const { checked, collapse } = this.state

        return isBottom
            ? this.renderTdContentWrap(col, tr[col.type || col.prop] || null)
            : (col.type === 'checkbox' || col.type === 'radio')
                ? (<Icon type={checked ? 'check-fill' : 'check'} onClick={this.checked} />)
                : col.type === 'expand'
                    ? (<Icon type='down-fill'
                        className={collapse ? ' u-turn-right' : ''}
                        onClick={this.expand.bind(this, columns[col.__i__].content)} />)
                    : col.type === 'index'
                        ? rowIndex + 1
                        : (tr[col.prop] || tr[col.prop] === 0 || col.filter) && this.renderTdContentWrap(col,  col.filter ? col.filter(tr[col.prop], Object.assign({}, tr), rowIndex) : tr[col.prop])

    }
    mapRow() {

        return (
            this.props.columns.map((col, j) => {
                const align = col.type ? ' _align-center' : cn(col.align, '_align-')
                return (
                    <td key={j}
                        className={'u-td' + align}
                        onClick={this.clickRow.bind(this, j, col.prop)}
                    >{this.renderTdContent(col)}</td>
                )
            })
        )
    }
    render() {
        const props = this.props
        if (!props.tr) return null
        const state = this.state


        return props.isBottom
            ? (<tr className={'u-tr'}>{this.mapRow()}</tr>)
            : (
                <React.Fragment>
                    <tr className={'u-tr ' + (props.bgColor || '') + ((state.hoverIndex === props.rowIndex || state.checked) ? ' _hover' : '')}
                        onMouseEnter={this.toggleRowBG.bind(this, 1)}
                        onMouseLeave={this.toggleRowBG.bind(this, -1)}
                    >
                        {this.mapRow()}
                    </tr>
                    {
                        !state.collapse && (
                            <tr className='expand-tr' ref={this.expandTr} style={props.isFixed ? { height: state.expandTrHeight } : null}>
                                <td colSpan={props.columns.length} className='expand-td'>
                                    {!props.isFixed ? <ExpandRow content={state.expandContent} tr={props.tr} /> : null}
                                </td>
                            </tr>
                        )
                    }
                </React.Fragment>
            )

    }
}

export default Row