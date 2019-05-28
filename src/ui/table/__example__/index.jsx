import React, { Component } from 'react';
import Table from '../';
import './style.less';
import Select from 'antd/lib/Select';
import 'antd/lib/select/style/css';

const Option = Select.Option;

const children = [];
for (let i = 0; i < 50; i++) {
    children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
}

function handleSelectChange(value) {
    console.log(`Selected: ${value}`);
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
        render: (v) => {
            return <div style={{ color: 'red' }}>{v}</div>;
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
        title: '选择框',
        prop: 'select',
        fixed: 'right',
        width: 200,
        render(text,row, index, a) {
            return (
                <Select
                    placeholder="Please select"
                    defaultValue={['a10', 'c12']}
                    onChange={handleSelectChange}
                    style={{ width: '100%' }}
                >
                    {children}
                </Select>
            );
        }
    },
    {
        title: '操作',
        fixed: 'right',
        render: (...args) => {
            return <div style={{ color: 'blue', cursor: 'pointer' }}>编辑</div>;
        }
    },
];

export default class TableExample extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rows: [],
            arr: []
        };
        this.handleChange = this.handleChange.bind(this);
    }
    componentDidMount() {
        this.toggleData(300);
    }
    toggleData(num) {

        let rows = [];
        for (let i = 0; i < num; i++) {
            rows.push({
                one: i,
                two: i,
                three: i,
                four: i,
                five: i,
                id: i,
                select: i
            });
        }

        this.setState({
            rows: rows,
        });
    }
    handleChange(v) {
        this.setState({ arr: v });
    }
    render() {
        return (
            <div className="table-example">
                <div className='clearfix'>
                    <div className="f-l">
                        <div className='title'>切换数据</div>
                        <button onClick={this.toggleData.bind(this, 50)}>50</button>
                        <button onClick={this.toggleData.bind(this, 1200)}>1200</button>
                        <button onClick={this.toggleData.bind(this, 3101)}>3101</button>
                    </div>

                </div>

                <br />
                <br />
                <br />
                <Table columns={columns}
                    rows={this.state.rows}
                    tableHeight={600}
                    rowKey={'id'}
                    rowSelection={{
                        getCheckboxProps: (data) => ({
                            disabled: data.id === 1
                        }),
                        onChange: (v, x) => { this.handleChange(v); console.log(v, x); },
                        // selectedRowKeys: this.state.arr
                        selectedRowKeys: this.state.arr
                    }}
                // onRow={
                //     (data) => {
                //         return {
                //             // onClick: (...args)=>{console.log(...args)}
                //
                //         }
                //     }
                // }
                />

            </div>
        );
    }
}
