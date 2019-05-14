import React from 'react';
import cn from 'classnames';

class Container extends React.PureComponent {
    render() {
        const {
            children,
            className,
            cover,

        } = this.props;
        return (
            <div className={cn('r-layout-container', className, {'_cover': cover})}>
                {children}
            </div>
        );
    }
}

export default Container;