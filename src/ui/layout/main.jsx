import React from 'react';
import cn from 'classnames';

class Main extends React.PureComponent {
    render() {
        const {
            children,
            className,

        } = this.props;
        return (
            <div className={cn('r-layout-main', className, )}>
                {children}
            </div>
        );
    }
}

export default Main;