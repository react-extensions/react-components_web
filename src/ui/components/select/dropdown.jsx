import React, { Component } from 'react';
import Context from './context';
const { Consumer } = Context;

class Dropdown extends Component {
    computeDropdownPosition() {
        const rect = this.props.parent.selectRef.current.getBoundingClientRect();
        return {
            left: rect.left,
            top: rect.bottom,
            width: rect.width
        }
    }
    render() {

        return (
            <div
                className='r-dropdown-container'
                style={this.computeDropdownPosition()}
                ref={this.props.refP}
            >
                {
                    this.props.children
                }

            </div>
        );
    }
};


export default React.forwardRef((props, ref) =>{
    return (
        <Consumer>
            {
                ({parent}) => <Dropdown parent={parent} refP={ref} {...props} />
            }
        </Consumer>
    );
}); 