// path: '/page/table'
// title: 'Table'

import React, {Component} from 'react';
import {
    Table,
    Button
} from '@/ui';

let rows = [];
let rows2 = [];
for (let i = 0; i < 200; i++) {
    rows.push({
        one: i,
        two: i,
        three: i,
        four: i,
        five: i,
        id: i
    });
    rows2.push({
        one: i+40,
        two: i+40,
        three: i+40,
        four: i+40,
        five: i+40,
        id: i+40
    });
}

const columns = [
    {
        type: 'expand',
        content: () => (
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
        width: 600,
        render: (v)=>{
            return <div style={{color: 'red'}}>{v}</div>;
        }
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
        render: (...args) => {
            return <div style={{color: 'blue', cursor: 'pointer'}}>编辑</div>;
        }
    }
];

export default class TableExample extends Component {
    constructor(props) {
        super(props);
        this.state = {
            bool: false,
            arr: []
        };
        this.handleChange  = this.handleChange.bind(this);
    }

    toggle() {
        this.setState({
            bool: !this.state.bool,
            // arr: !this.state.bool ? rows.map(row=>row.id) : []
        });
    }
    handleChange(v){
        this.setState({arr:v});
    }
    render() {
        return (
            <div className="table-example">
             

                <Button type='primary' onClick={this.toggle.bind(this)}>toggle</Button>
                <br/>
                <p>{String(this.state.bool)}</p>
                <br/>
                <Table columns={columns}
                    rows={this.state.bool ? rows : rows2}
                    tableHeight={600}
                    // onRow={
                    //     (data) => {
                    //         return {
                    //             // onClick: (...args)=>{console.log(...args)}
                    //
                    //         }
                    //     }
                    // }
                    rowKey={'id'}
                    rowSelection={{
                        getCheckboxProps: (data)=> ({
                            disabled: data.id===1
                        }),
                        onChange:(v, x)=>{this.handleChange(v); console.log(v, x);},
                        // selectedRowKeys: this.state.arr
                        selectedRowKeys: this.state.arr
                    }}
                />

            </div>
        );
    }
}

