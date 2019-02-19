import React, { Component } from 'react';

class Count extends Component {
    constructor(props) {
        super(props)
        this.state = {
            count: 0
        }
    }
    reduce() {
        if(this.state.count < 1) return
        this.setState({
            count: this.state.count - 1
        })
    }
    add() {
        this.setState({
            count: this.state.count + 1
        })
    }
    render() {
        return (
            <div>
                <button type='button' onClick={this.reduce.bind(this)}>-</button>
                <button type='button' onClick={this.add.bind(this)}>+</button>
                <h1>{this.state.count}</h1>
            </div>
        );
    }
}

export default Count;