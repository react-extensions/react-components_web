import React, { Component } from 'react';
import BigDataRender from '../index';

function getList(num = 3010) {
    const list = [];
    for (let i = 0; i < num; i++) {
        list.push(i);
    }
    return list;
}
class index extends Component {
    state = {
        list: getList(),
    }
    render() {
        const toggleList = () => {
            this.setState({
                list: getList(50)
            })
        }
        return (
            <div style={{ padding: 40 }}>
                <button onClick={toggleList}>
                    toggle
                </button>
                {/* <h1>大数据渲染</h1> */}
                <div style={{ border: '3px solid rgba(200,200,200,0.5)', borderRadius: 4 }}>
                    <BigDataRender data={this.state.list} range={30}>
                        {
                            (subData) => {
                                return subData.map(item => (
                                    <div key={item}>{item}</div>
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