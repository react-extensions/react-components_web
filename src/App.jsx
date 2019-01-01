import React, { Component } from 'react';
import {
    Table,
    Input,
    Button
} from './ui'


const columns = [
    {
        label: '姓名',
        prop: 'name',
        // width: 10

    },
    {
        label: '年龄',
        prop: 'age',
        width: 50

    },
    {
        label: '工作',
        prop: 'job',
        width: 70

    },
    {
        label: '备注',
        prop: 'note',
        width: 120

    }, {
        label: '备注',
        prop: 'note',
        width: 120

    }, {
        label: '备注',
        prop: 'note',
        width: 120

    },
     {
        label: '备注',
        prop: 'note',
        // width: 720

    },
     {
        label: '备注',
        prop: 'note',
        // fixed:'left',
        width: 120
    },
     {
        label: '备注',
        prop: 'note',
        // fixed:'right',
        width: 120
    }
]
const rows = [
    {
        name: '李十三',
        age: '22',
        job: 'bug制造师',
        note: '娃娃啊沙发沙发士大夫 士大夫撒是否是 士大夫是士大夫'
    },
    {
        name: '李十三',
        age: '221',
        job: 'bug制造师',
        note: '娃娃啊沙发沙发士大夫 士大夫撒是否是 士大夫是士大夫'

    },
    {
        name: '李十三',
        age: '21232',
        job: 'bug制造师',
        note: '娃娃啊沙发沙发士大夫 士大夫撒是否是 士大夫是士大夫'

    },
    {
        name: '李十三',
        age: '2',
        job: 'bug制造师',
        note: '娃娃啊沙发沙发士大夫 士大夫撒是否是 士大夫是士大夫'
    },
]


class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
        rows: []
    }

  }
  handleClick(){
      this.setState({
          rows: rows.concat(this.state.rows)
      })
  }

  render() {
    return (
      <div className="App">
      <div style={{background: 'red',lineHeight: '20px',}}>
          <span style={{lineHeight: '20px',display:'inline-block',background:'black'}}>123213213</span>
      </div>
        <Button  onClick={this.handleClick.bind(this)}>{'click'}</Button>
        <Input/>
        <Table 
            tableHeight={300}   
            columns={columns} 
            rows={this.state.rows}
            // type='tile'
        />
        1231
      </div>
    )
  }
}

export default App
