import React, { Component } from 'react';
import './style.less'
import BigData from './lab/big-data-render-pro'
import Table from './lab/table'

let rows = []
for (let i = 0; i < 1000; i++) {
    rows.push({
        one: i,
        two: i,
        three: i,
        four: i,
        five: i
    })
}

const columns = [
    {
        type: 'checkbox'
    },
    {
        prop: 'one',
        label: '第一行'
    },
    {
        prop: 'two',
        label: '第二行'
    },
    {
        prop: 'three',
        label: '第三行'
    },
    {
        prop: 'four',
        label: '第四行'
    },
    {
        prop: 'five',
        label: '第五行'
    }
]

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {

        }
    }

    render() {

        return (
            <div className="App" >
                {/* <Table columns={columns} rows={rows} tableHeight={600} /> */}
                <BigData data={rows}>
                    {
                        data => (
                            <table>
                                <tbody>
                                    {
                                        data.map(item => (
                                            <tr key={item.one}>
                                                <td>{item.one}</td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        )
                    }
                </BigData>
            </div>
        )
    }
}

export default App
