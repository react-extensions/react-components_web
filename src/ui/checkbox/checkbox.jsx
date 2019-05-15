import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import Context from './context';
import config from './config';

class Checkbox extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            checked: props.defaultChecked,
            isControlled: false, // 非受控组件
        };
        this.toggleCheck = this.toggleCheck.bind(this);
    }
    static getDerivedStateFromProps(props) {
        return {
            isControlled: props.hasOwnProperty('checked')
        };
    }
    toggleCheck(e) {
        const checked = e.target.checked;
        this.props.onChange(checked, this.props.value);
        if (this.state.isControlled) {
            return;
        }
        this.setState({
            checked: checked
        });
    }

    render() {

        const {
            children,
            className,
            checked: propsChecked,
            defaultChecked,
            onChange,
            value,
            disabled,
            checkedIcon,
            notCheckedIcon,
            ...rest
        } = this.props;

        const {
            isControlled,
            checked: stateChecked
        } = this.state;

        const checked = isControlled ? propsChecked : stateChecked;
        const Icon = checked ? (checkedIcon || config.icon.Check) : (notCheckedIcon || config.icon.NotCheck);

        return (
            <label className={'r-checkbox-wrapper ' + (className || '')+(disabled? ' _disabled':'')} {...rest} >
                <span className={'r-checkbox-inner'}>
                    <input type='checkbox'
                        className='r-checkbox'
                        onChange={this.toggleCheck}
                        checked={checked}
                        disabled={disabled}
                    />
                    <Icon className={checked ? ' _checked' : ''}/>
                </span>
                {children &&  <span className='checkbox-children'>{children}</span>}
            </label>
        );
    }
}


Checkbox.propTypes = {
    children: PropTypes.node,       // label
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // 唯一标识符
    checked: PropTypes.bool,
    defaultChecked: PropTypes.bool, // 初始默认选中
    className: PropTypes.string,    // 自定义类名
    checkedIcon: PropTypes.oneOfType([PropTypes.func, PropTypes.element]),
    notCheckedIcon: PropTypes.oneOfType([PropTypes.func, PropTypes.element]),
};

Checkbox.defaultProps = {
    onChange: (v) => {
        if (process.env.NODE_ENV === 'development') {
            console.log('checkbox => ', v);
        }
    },
    defaultChecked: false,
};


export default function (props) {
    return (
        <Context.Consumer>
            {
                ({onChange, value, isGroup} = {} )=> {
                    return isGroup ?
                        <Checkbox
                            {...props}
                            checked={value.includes(props.value)}
                            onChange={onChange}
                        /> :
                        <Checkbox  {...props} />;
                }
            }
        </Context.Consumer>
    );
}