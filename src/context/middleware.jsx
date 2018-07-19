import React, { Component } from 'react';
import Child from './child'
class middleware extends Component {
  render() {
    return (
      <div>
        <h1>Middleware</h1>
        <Child/>
      </div>
    );
  }
}

export default middleware;