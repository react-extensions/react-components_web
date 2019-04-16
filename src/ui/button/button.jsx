import React from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
// import Icon from '../icon'


Button.propTypes = {
    ghost: PropTypes.bool,
    icon: PropTypes.node,
    disabled: PropTypes.bool,
    size: PropTypes.oneOf(['large', 'small', 'default']),
    shape: PropTypes.oneOf(['circle', 'square', 'default']),
    htmlType: PropTypes.oneOf(['button', 'submit', 'reset']),
    type: PropTypes.oneOf(['primary', 'dashed', 'default', 'danger']),
    children: PropTypes.node
};

Button.defaultProps = {
    type: 'default',
    htmlType: 'button'
};

function Button(props) {
    const {
        htmlType,
        children,
        className,
        type,
        size,
        ghost,
        shape,
        prefix,
        suffix,
        ...rest
    } = props;

    const cnStr = cn(
        'r-btn',
        className,
        type && `_type-${type}`,
        size && `_size-${size}`,
        ghost && `_ghost`,
        shape && `_shape-${shape}`,
        prefix && `_prefix`,
        suffix && `_suffix`
    );
    return (
        <button
            title={children}
            {...rest}
            type={htmlType}
            className={cnStr}
        >
            {prefix}
            {children && <span className='r-btn-text'>{children}</span>}
            {suffix}
        </button>
    );
}

export default Button;