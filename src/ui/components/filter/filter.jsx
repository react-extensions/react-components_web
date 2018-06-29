import React, { Component } from 'react'
import { Cell } from '@ui/index'
import './filter.scss'
import { Input, Button, DatePicker, Select, Tree } from 'antd';
const { RangePicker } = DatePicker

class Filter extends Component {
  constructor(props) {
    super(props);
    this.state = {}
    this.filter = {
      isprint: 1,   // 是否已打印, 1 全部  2 是  3 否
      reprint: 1,   // 是否重打, 1 全部  2 是  3 否
      trashed: 1,   // 是否作废, 1 全部  2 是  3 否


    }
    this.search = this.search.bind(this)
  }
  onInput(e, type) {
    this.filter[type] = e.target.value
  }
  selectChange(v, type) {
    if (type === 'timeRange') {
      this.filter['rqStart'] = v[0]
      this.filter['rqEnd'] = v[1]
      return
    }
    this.filter[type] = v
  }
  search() {
    this.props.onSearch(this.filter)
  }
  render() {
    const { jksbh, nsrsbh, nsrmc, } = this.props
    const Option = Select.Option
    const TreeNode = Tree.TreeNode
    const renderSelect = function (type) {
      return (
        <Select defaultValue="1" onChange={(v) => this.selectChange(v, type)}>
          <Option value='1'>全部</Option>
          <Option value='2'>是</Option>
          <Option value='3'>否</Option>
        </Select>
      )
    }
    return (
      <div className='filter-area'>
        {
          jksbh && (
            <Cell title='缴款书编号' value={
              <Input placeholder='请输入缴款书编号' onInput={e => this.onInput(e, 'jksbh')} />
            } />
          )
        }

        {
          nsrsbh && <Cell title='纳税人识别号' value={
            <Input placeholder='请输入纳税人识别号' onInput={e => this.onInput(e, 'nsrsbh')} />
          } />
        }

        <Cell title='纳税人名称' value={
          <Input placeholder='请输入纳税人名称' />
        } />
        
        <Cell title='电子税票号码' value={
          <Input placeholder='请输入电子税票号码' />
        } />

        <Cell title='所属税期' value={
          <RangePicker
            format="YYYY-MM-DD"
            placeholder={['开始时间', '结束时间']}
            onChange={(v, v2) => this.selectChange(v2, 'timeRange')}
          // onOk={(v) => this.selectChange(v,'x')}
          />
        } />
        <Cell title='所属税局' value={
          null
          /* <Tree
            checkable
            // onExpand={this.onExpand}
            // expandedKeys={this.state.expandedKeys}
            // autoExpandParent={this.state.autoExpandParent}
            onCheck={this.onCheck}
            checkedKeys={this.state.checkedKeys}
            onSelect={this.onSelect}
            selectedKeys={this.state.selectedKeys}
          >
            {this.renderTreeNodes(treeData)}
          </Tree> */
        } />


        <Cell title='是否已打印' value={renderSelect.call(this, 'isprint')} />
        <Cell title='是否作废' value={renderSelect.call(this, 'trashed')} />
        <Cell title='是否重打' value={renderSelect.call(this, 'reprint')} />

        <Button size="large" onClick={this.search} type="primary" htmlType="button" >查询</Button>
      </div>
    )
  }
}

export default Filter