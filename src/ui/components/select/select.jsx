import React from 'react';

import Modal from './modal';
import Context from './context';
import DropDown from './dropdown';
import PropTypes from 'prop-types';

const { Provider } = Context;


function debounce(
    fn, {
        time = 300,
        isEvent,
        argsHandle = (...args)=> args
    }
) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        if(isEvent) {
            args = argsHandle(...args);
        }
        setTimeout(() => {
            Array.isArray(args) ? fn(...args) : fn(args);
        }, time);
    };
}


class Select extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isDropDownShow: false,
            selected: null,
            selectedLabel: '',
            selectedMap: {},
            searchText: '',
        };

        this.selectRef = React.createRef();
        this.dropdownRef = React.createRef();
        this.handleInput = debounce(this.handleInput.bind(this), {
            isEvent: true,
            argsHandle: e => e.target
        });

        this.showDropDown = this.showDropDown.bind(this);
        this.handleGlobalClick = this.handleGlobalClick.bind(this);
    }
    static getDerivedStateFromProps(props, state) {
        if (state.prevData !== props.data) {
            return {
                data: props.data,
            }
        }
        return null;
    }
    /**
     * 显示dropdown
     */
    showDropDown() {
        this.setState({
            isDropDownShow: true
        });
        document.addEventListener('click', this.handleGlobalClick);
    }
    /**
     * 处理全局点击
     * @param {event} e 
     */
    handleGlobalClick(e) {
        if (!this.dropdownRef.current.contains(e.target)) {
            this.setState({
                isDropDownShow: false
            });
            document.removeEventListener('click', this.handleGlobalClick);
        }
    }
    /**
     * 点击选项
     * @param {number|string} id 
     * @param {number|string} label 
     */
    toggleOption(id, label) {
        this.setState({
            selected: id,
            selectedLabel: label
        });
        this.props.onSelectChange(id);
    }
    /**
     * 处理搜索
     * @param {el} el
     */
    handleInput(el) {
        this.setState({
            searchText: el.value
        });
    }
    /**
     * 生成渲染数据
     */
    genRenderData() {
        const data = this.props.data;
        const searchText = this.state.searchText;
        if (!data) return;
        if (!searchText) return data;
        const type = typeof data[0];
        const isBaseType = type === 'string' || type === 'number';
        const isObject = !isBaseType && type === 'object' && !Array.isArray(data[0]);
        const searchFilterKey = this.props.searchFilterKey;
        return data.filter(item => {
            if (isBaseType) {
                return String(item).indexOf(searchText) > -1;
            } else if (isObject) {
                return item[searchFilterKey].indexOf(searchText) > -1;
            }
            return true;
        });
    }

    render() {
        const state = this.state;
        const props = this.props
        let children = props.children;

        if (typeof children === 'function') {
            children = children(this.genRenderData());
        }

        return (
            <div ref={this.selectRef}>
                <div onClick={this.showDropDown}>
                    {this.state.selectedLabel || '选择'}
                    <input onChange={this.handleInput} />
                </div>
                <Modal>
                    <Provider value={{
                        parent: this,
                        selected: state.selected
                    }}>
                        {
                            state.isDropDownShow && (
                                <DropDown ref={this.dropdownRef}>
                                    {children}
                                </DropDown>
                            )
                        }
                    </Provider>
                </Modal>
            </div>
        );
    }
}

Select.defaultProps = {
    searchFilterKey: 'label',
    onSelectChange: () => { },
};

Select.propTypes = {
    data: PropTypes.array,
    // searchFilterKey: PropTypes.oneOf(['label', 'id']),
};

export default Select;