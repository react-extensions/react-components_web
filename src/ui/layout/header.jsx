import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

class Header extends React.PureComponent {
    render() {
        const {
            children,
            fixed,
            className,
        } = this.props;

        return (
            <header className={cn('r-layout-header', {'_fixed': fixed}, className)}>
                {children}
            </header>
        );
    }
}

Header.propTypes = {
    fixed: PropTypes.bool,

};

export default Header;
