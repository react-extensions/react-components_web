import React, { Component } from 'react';

class Test extends Component {
  render() {
    return (
      <div className='queue' ref={el => this.transitionElem = el}>
        1 <br />
        2 <br />
        3 <br />

      </div>
    );
  }
}

export default Test;