import React, { Component } from 'react';
import BigDataRender from '../index-pro';
import Mock from 'mockjs';

class index extends Component {
    state = {
        list:this.gen(3010),
    }
    toggle(num){
        this.setState({
            list: this.gen(num)
        })
    }
    gen(num) {
        const list = [];
        for (let i = 0; i < num; i++) {
            list.push({
                index: i,
                num: Mock.Random.natural(30, 180),
            });
        }
        return list;
    }
    render() {
        return (
            <div style={{ padding: 40 }}>
                <button onClick={this.toggle.bind(this, 3010)}>3010</button>
                <button onClick={this.toggle.bind(this, 50)}>50</button>
                <button onClick={this.toggle.bind(this, 1200)}>1200</button>

                {/* <h1>大数据渲染</h1> */}
                <div style={{ border: '3px solid rgba(200,200,200,0.5)', borderRadius: 4 }}>
                    <BigDataRender data={this.state.list} range={30} querySelect={el => el.querySelectorAll('.item')}>
                        {
                            (subData) => {
                                return subData.map((item) => (
                                    <div className='item' key={item.index} style={{ height: item.num }}>{item.index}</div>
                                ));
                            }
                        }
                    </BigDataRender>
                </div>
            </div>
        );
    }
}

export default index;