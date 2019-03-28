import React, { Component } from 'react';
import './style.scss'
import BigData from './lab/big-data-render'
import Select from './ui/components/select'



const children = [];
for (let i = 0; i < 1000; i++) {
    children.push(i);
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
                <Select data={children}>
                    {
                        data => (
                            <BigData data={data}>
                                {
                                    data => {
                                        return data.map((item, index) => {
                                            return <Select.Option key={item} id={item}>{item}</Select.Option>
                                        })
                                    }
                                }
                            </BigData>
                        )
                    }
                </Select>

            </div>
        )
    }
}

export default App
