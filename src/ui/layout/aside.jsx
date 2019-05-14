import React from 'react';
import cn from 'classnames';

class Aside extends React.PureComponent {
    render() {
        const {
            className,
            children,
            fixed,

        } = this.props;
        return (
            <div className={cn('r-layout-aside', className, {'_fixed': fixed})}>
                {children}
            </div>
        );
    }
}
export default Aside;