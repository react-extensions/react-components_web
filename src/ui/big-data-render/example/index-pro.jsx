import React, { Component } from 'react';
import BigDataRender from '../index-pro';
import Mock from 'mockjs';
const list = [];
for(let i = 0; i < 3010; i++) {
    list.push({
        index: i,
        num: Mock.Random.natural(30, 100),
    });
}

class index extends Component {
    render() {
        return (
            <div style={{padding: 40}}>
                {/* <h1>大数据渲染</h1> */}
                <div style={{border: '3px solid rgba(200,200,200,0.5)', borderRadius: 4}}>
                    <BigDataRender data={list} range={30}>
                        {
                            (subData) =>{
                                return subData.map((item)=>(
                                    <div key={item.index} style={{height: item.num}}>{item.index}</div>
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