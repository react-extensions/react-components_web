import React, {Component} from 'react';
import './style.less';
import BigData from './lab/big-data-render-pro';
import Table from './lab/table';

let rows = [];
for (let i = 0; i < 1000; i++) {
    rows.push({
        one: i,
        two: i,
        three: i,
        four: i,
        five: i,
        id: i
    });
}

const columns = [
    {
        type: 'expand',
        content: ()=>(
            <div>
                <h1>1111111</h1>
                <h1>wwwwwwwwwwwwww</h1>
                <h1>xxxxxxxxxxxx</h1>
            </div>
        )
    },
    {
        type: 'checkbox'
    },
    {
        prop: 'one',
        title: '第一行'
    },
    {
        prop: 'two',
        title: '第二行',
        width: 300
    },
    {
        prop: 'three',
        title: '第三行',
        width: 600

    },
    {
        prop: 'four',
        title: '第四行',
        className: 'four',
        width: 600,
        needSort: true

    },
    {
        prop: 'five',
        title: '第五行',
        fixed: 'right',

    },
    {
        title: '操作',
        fixed: 'right',
        filter: () => (
            <div style={{color: 'blue', cursor: 'pointer'}}>编辑</div>
        )
    }
];

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            bool: true
        };
    }

    toggle() {
        this.setState({
            bool: !this.state.bool
        });
    }

    render() {

        return (
            <div className="App">
                <button type={'button'} onClick={this.toggle.bind(this)}>toggle</button>
                <p>{String(this.state.bool)}</p>
                <Table columns={columns}
                       rows={rows}
                       tableHeight={600}
                       onSelectRowChange={(v) => {
                           console.log(v);
                       }}
                       onRow={
                           (data, index) => {
                               if (index === 2) {
                                   return {
                                       disabled: this.state.bool,
                                   };
                               }
                               return null;
                           }
                       }
                       rowKey={'id'}
                       disabledRows={[]}
                />
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
        );
    }
}

export default App;
