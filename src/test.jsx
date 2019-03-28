import React, { Component } from 'react';

class test extends Component {
    render() {
        return (
            <div>
                {
                    React.cloneElement(this.props.children, Object.assign({
                        ref: el=>{
                            console.log(el)
                            this.el = el
                        }
                    }, this.props.children.props))
                }
            </div>
        );
    }
}

export default test;