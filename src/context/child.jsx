import React, { Component } from 'react';
import getContext from './hoc'
class child extends Component {
  componentDidMount() {
    console.log(this.props.msg)
  }
  render() {
    return (
      <div>
        <h1>msgs</h1>
        from context: 
      </div>
    );
  }
}

export default getContext(child)