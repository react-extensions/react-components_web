import React, { Component } from 'react';

class child extends Component {
    constructor(props) {
        super(props)
        this.state = {
            text: 'child'
        }
    }
    changeMsg() {
        this.setState({
            text: '12312'
        })
    }
    componentDidMount(){
        console.log('child', this)
    }
    render() {
        return (
            <div>
                {this.state.text}
            </div>
        );
    }
}

export default child;