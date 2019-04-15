/* eslint-disable */
import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import './style.less';
import {
    debounce
} from '@/libs/utils';
import Icon from '../icon';

Pagination.propTypes = {
    total: PropTypes.number,
    size: PropTypes.number,
    range: PropTypes.number,
    layoutSize: PropTypes.oneOf(['small']),
    simple: PropTypes.bool
};

Pagination.defaultProps = {
    total: 0, //  Number  一共多少条数据
    size: 5, //  Number  一页要显示多少条数据
    range: 5,   //  Number  大于多少页时显示缩略按钮
    // layoutSize: 'small',
    // simple: true
};

export default function Pagination(props) {

    const [active, setActive] = useState(1);
    const [input, setInput] = useState(1);
    const [size, setSize] = useState(props.size);
    const [pages, setPages] = useState(Math.ceil(props.total / props.size));
    let switchPageDelay = debounce(switchPage, 500);

    /**
     * 切换页码
     * @param {number} newActive
     * @param {number} step +1 -1
     */
    function switchPage(newActive, step) {
        if (typeof newActive === 'string') {
            newActive = newActive === '-'
                ? active - props.range
                : active + props.range;
        }
        // 矫正范围
        newActive = newActive === 0 ? (active + step) : newActive;
        newActive = newActive < 1 ? 1 : (newActive > pages ? pages : newActive);

        if (props.simple) {
            setInput(newActive);
        }
        setActive(newActive);
    }

    // 选择一页显示几条数据
    // function changeMode(v) {
    //     const pages = Math.ceil(props.total / v)
    //     setPages(pages)
    //     setActive(1)
    //     setSize(v)
    // }

    /**
     * 处理输入跳转
     * @param {event} e
     */
    function handleInput(e) {
        let v = e.target.value;
        setInput(v);
        v = parseInt(v);
        if (!v) {
            return;
        }
        switchPageDelay(v > pages ? pages : v);
    }

    /**
     * 生成用于渲染的数组
     */
    function genRenderList() {
        let list = [];
        const range = props.range;
        // 前5页进行处理, 后五页时,把起点限制为 pages - range - 1  
        let start = active < range
            ? 1
            : (
                (active + Math.ceil(range / 2)) < pages
                    ? active - Math.floor(range / 2)
                    : pages - (range - 1)
            );
        // 后range页时, 进行处理, 其他 end 始终 等于 start + 5
        let end = start + range > pages
            ? pages + 1
            : start + range;

        for (let i = start; i < end; i++) {
            list.push(i);
        }
        if (start > 2) {
            list = [1, '-'].concat(list);
        }
        if (end < pages) {
            list = list.concat(['+', pages]);
        }
        return list;
    }

    // 触发onChange
    useEffect(() => {
        const fn = props.onChange;
        fn && fn(active, size);
    }, [active, size]);


    /**
     * 主功能区的按钮
     */
    const renderBtnList = function () {
        return genRenderList().map((item, i) => {
            const isPrev = item === '-';
            const isNext = item === '+';
            const isEllipsis = isPrev || isNext;
            const cn = (isEllipsis ? ' _ellipsis' : '') + (active === item ? ' _active' : '');
            return (
                <li className={'n-pagination-item'}
                    key={i}
                    onClick={() => switchPage(item)}
                >
                    <button
                        className={'_btn' + cn}
                        htmltype='button'
                        title={isEllipsis ? `向${isPrev ? '前' : '后'}${props.range}页` : `跳转到${item}页`}
                    >
                        {isPrev && <Icon type='doubleleft'/>}
                        {isNext && <Icon type='doubleright'/>}
                        {isEllipsis ? '•••' : item}
                    </button>
                </li>
            );
        });
    };
    /**
     * 输入框
     */
    const renderInput = function () {
        return (
            <input
                type='text'
                title={input}
                value={input}
                aria-label={`跳转到${input}页`}
                className='n-pagination-input'
                onChange={e => handleInput(e)}
            />
        );
    };

    /**
     * 简易模式
     */
    const renderSimple = function () {
        const label = `共${pages}页`;
        return (
            <li className='n-pagination-item _simple' aria-label={`第${input}页`}>
                {renderInput()}
                <span className='_symbol'>/</span>
                <span title={label} aira-label={label}>{pages}</span>
            </li>
        );
    };


    /**
     * 辅功能区
     */
    const renderTools = function () {
        return (
            <React.Fragment>
                {/* 信息显示区 */}
                <div className='n-pagination-tool'>
                    <span className='n-pagination-info'>{`共${props.total}条`}</span>
                </div>
                {/* 输入跳转区 */}
                <div className='n-pagination-tool'>
                    {
                        pages > props.range ? (
                            <label className='n-pagination-input-wrapper'>
                                跳至{renderInput()}页
                            </label>
                        ) : null
                    }
                </div>
            </React.Fragment>
        );
    };

    const isSimple = props.simple;

    return (
        <div className={cn('n-pagination', props.className, (isSimple || props.layoutSize) && '_small')}
             aria-label='分页'>
            {/* 主功能区 */}
            <ul className='n-pagination-item-wrapper'>
                <li className='n-pagination-item'>
                    <button
                        title='上一页'
                        htmltype='button'
                        className='_btn _prev'
                        disabled={active === 1}
                        // aria-disabled={active === 1}
                        onClick={() => switchPage(0, -1)}
                    >
                        <Icon type='left'/>
                    </button>
                </li>
                {
                    isSimple ? renderSimple() : renderBtnList()
                }
                <li className='n-pagination-item'>
                    <button
                        title='下一页'
                        htmltype='button'
                        className='_btn _next'
                        disabled={active === pages}
                        onClick={() => switchPage(0, 1)}
                    >
                        <Icon type='right'/>
                    </button>
                </li>
            </ul>
            {/* 辅功能区 */}
            {!isSimple && renderTools()}
        </div>
    );
}


