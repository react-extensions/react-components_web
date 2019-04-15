// path: '/display'

import React, { Component } from 'react';
import {
    Button,
    Pagination,
    // Icon,
} from '@/ui'

import './style.less'

class Display extends Component {
    // constructor() {
    //     super()
    // }
    render() {
        return (
            <div
                className='display'
                style={{
                    padding: 50,
                    // background: '#00BCD4'
                }}>
                <div>
                    <Pagination total={123} />
                </div>
                <br />
                <br />
                <br />
                <br />
                <div>
                    <Button type='primary' prefix={'loading'}>主按钮</Button>
                    <Button type='danger' ghost>危险按钮</Button>
                    <Button type='danger' shape='square'>危险按钮</Button>

                    <Button.Group>
                        <Button >杭州</Button>
                        <Button prefix={'file'} >上海</Button>
                        <Button  >成都</Button>
                        <Button>武汉</Button>
                    </Button.Group>
                </div>
            </div>
        );
    }
}

export default Display;