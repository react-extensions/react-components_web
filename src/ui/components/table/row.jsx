import React from 'react'
import Icon from '../icon'
import ExpandRow from './expand-row'
import {
    CHECK_TYPE
} from './const-data';
import cn from '../class-name'

const HEIGHT = 'HEIGHT'
const HOVER = 'HOVER'
const CHECK = 'CHECK'
const EXPAND = 'EXPAND'
const EXPAND_HEIGHT = 'EXPAND_HEIGHT'

class Subject {
    constructor(){
        this.observerQueue = []
        this.height = 0
    }
    emit(key, value, vm) {
        key === HEIGHT && (this.height = value)
        this.observerQueue.forEach(item=>item !== vm && item.updateSync(key, value))
    }
    addObserver(observer) {
        this.observerQueue.push(observer)
        return function(callback){
            this.observerQueue.splice(this.observerQueue.indexOf(observer), 1)
            callback(this.observerQueue.length)
        }
    }
    resize() {
        this.observerQueue.forEach(item=>item.forceUpdate())
    }
}


function diff(o, n, c) {
    return o !== n && (o === c || n === c)
}

/**
 * 
 * @prop [array] rowIndex
 */
class Row extends React.Component {
    constructor(props) {
        super(props)

        let syncObj = props.syncQueue[props.rowIndex]

        if (props.needSync) {
            this.expandTr = React.createRef()
            if(!syncObj) {
                syncObj = new Subject()
                props.syncQueue[props.rowIndex] = syncObj
            }
            this.removeObjserver = syncObj.addObserver(this)
            this.syncObj = syncObj
        }
        

        this.state = {
            checked: false,  // 选中
            collapse: true,  // 折叠
            expandContent: null, // 扩展行内容
            isHover: false,      // 鼠标移入
            expandTrHeight: 0,   // 扩展行 高度
            trHeight: props.isFixed ? syncObj.height:null       // 行宽度
        }
        this.mounted = false

        

        this.checked = this.checked.bind(this)
        this.getTrHeight = this.getTrHeight.bind(this)

    }
    componentDidMount() {
        this.mounted = true
    }
   
    shouldComponentUpdate(N_P, N_S) {
        const O_P = this.props
            , O_S = this.state

        return O_P.columns !== N_P.columns
            || O_P.tr !== N_P.tr
            || O_P.rowIndex !== N_P.rowIndex
            || N_S.checked !== O_S.checked
            || N_S.isHover !== O_S.isHover
            || N_S.collapse !== O_S.collapse
            || N_S.expandTrHeight !== O_S.expandTrHeight
            || N_S.trHeight !== O_S.trHeight
    }
    /*
    * 有expandTr时，展开或关闭后，同步高度
    *
    * */
    componentDidUpdate(prevP, prevS) {
     
        if (prevS.collapse !== this.state.collapse && prevS.collapse && prevP.needSync && !prevP.isFixed) {
            //this.expandTr.current.clientHeight  在ie9中获取不到值
            //.getBoundingClientRect().height    在普通浏览器中又获取不到值
            const el = this.expandTr.current
            const height = /MSIE 9/i.test(window.navigator.userAgent) ? el.getBoundingClientRect().height : el.clientHeight
            this.syncObj.emit(EXPAND_HEIGHT, height, this)
        }
    }
    componentWillUnmount() {
        this.removeObjserver && this.removeObjserver(len=>{
            len === 0 && (this.props.syncQueue[this.props.rowIndex] = null);
        })
    }
    /**
     * 更新同步数据
     * @param {*} key 
     * @param {*} value 
     */
    updateSync(key, value) {
        if(key === HEIGHT) {
            this.setState({trHeight: value})
        } else if(key === HOVER) {
            this.setState({isHover: value})
        }
    }

    /**
     * 获取tr高度
     * @param {*} el 
     */
    getTrHeight(el) {
        if(!el || !this.props.needSync) return
        const height = el.clientHeight
        if(this.syncObj.height !== height ) {
            this.syncObj.emit(HEIGHT, height, this)
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
        const isChecked = !this.state.checked  // 是否选中
        
        const props = this.props

        // 发送数据给table
        props.onChecked(props.tr, isChecked, props.rowIndex)

        this.setState({ checked: isChecked })

        if (props.needSync) { 
            this.syncObj.emit(CHECK, isChecked, this)
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

    /**
     * 鼠标移入移出样式
     */
    toggleRowBG(isOn) {
        this.setState({ isHover: isOn > 0 })
        if (this.props.needSync) {
            this.syncObj.emit(HOVER, isOn > 0, this)
        }
    }

    /**
     * 收集td宽度
     * @param {*} col 
     * @param {*} el 
     */
    collectWidth(col, el) {
        if (!el || this.mounted) return;
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
            ? (<tr className={'u-tr'} ref={this.getTrHeight} style={{height: state.trHeight}}>{this.mapRow()}</tr>)
            : (
                <React.Fragment>
                    <tr className={'u-tr' + cn(props.bgColor) + ((state.isHover || state.checked) ? ' _hover' : '')}
                        onMouseEnter={this.toggleRowBG.bind(this, 1)}
                        onMouseLeave={this.toggleRowBG.bind(this, -1)}
                        ref={!props.isFixed && this.getTrHeight} style={{height: state.trHeight}}
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