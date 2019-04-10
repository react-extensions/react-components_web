import React, {Component} from 'react';
import './style.less';
import Table from './lab/table';
import {Checkbox} from './ui';


let rows = [];
for (let i = 0; i < 200; i++) {
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
            bool: false,
            arr: []
        };
        this.handleChange  = this.handleChange.bind(this)
    }

    toggle() {
        this.setState({
            bool: !this.state.bool,
            // arr: !this.state.bool ? rows.map(row=>row.id) : []
        });
    }
    handleChange(v){
        this.setState({arr:v})
    }
    render() {


        return (
            <div className="App">
                {/*<Checkbox.Group value={this.state.arr} onChange={this.handleChange}>*/}
                    {/*{*/}
                        {/*rows.map((row,i)=>{*/}
                            {/*return <Checkbox*/}
                                {/*key={row.id}*/}
                                {/*value={row.id}*/}
                                {/*disabled={this.state.bool ? (i%2)===0: i%3===0}*/}
                            {/*>{row.id}</Checkbox>*/}
                        {/*})*/}
                    {/*}*/}
                {/*</Checkbox.Group>*/}

                <button type={'button'} onClick={this.toggle.bind(this)}>toggle</button>
                <p>{String(this.state.bool)}</p>
                <Table columns={columns}
                       rows={rows}
                       tableHeight={600}
                       onRow={
                           (data) => {
                               if (data.id===1) {
                                   return {
                                       className:'disabled',
                                   };
                               }
                               return null;
                           }
                       }
                       rowKey={'id'}
                       rowSelection={{
                           getCheckboxProps: (data)=> ({
                               disabled: data.id===1
                           }),
                           onChange:v=>{this.handleChange(v); console.log(v)},
                           // selectedRowKeys: this.state.arr
                           selectedRowKeys: this.state.arr
                       }}
                />

            </div>
        );
    }
}

export default App;
