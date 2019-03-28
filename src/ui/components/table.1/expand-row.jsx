import React from 'react';

class ExpandRow extends React.PureComponent {
    render() {
        const content = this.props.content;
        return (
            (typeof content === 'function' ? content(this.props.tr) : content)
        );
    }
}

export default ExpandRow;