import React, { Component } from 'react';
import './style.scss'
import BigData from './lab/big-data-render'



const children = [];
for (let i = 0; i < 1000; i++) {
    children.push( i);
}


class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    render() {

        return (
            <div className="App" >
                <BigData data={children}>
                    {
                        data => {
                            return data.map((item, index) => {
                                return <div key={index} className='render-item'>
                                    {item}
                                </div>
                            })
                        }
                    }
                </BigData>
            </div>
        )
    }
}

export default App
