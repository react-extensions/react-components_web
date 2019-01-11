import React, { Component } from 'react';

class parent extends Component {
    componentDidMount() {
        console.log(this.props.children)
    }
    render() {
        return (
            <div>
                {this.props.children}
            </div>
        );
    }
}

export default parent;