// path: '/button'

import React, { Component } from 'react';
import {
    Button,
} from '@/ui';
class Display extends Component {
   
    render() {
        return (
            <div
                className='display'
                style={{
                    padding: 50,
                    // background: '#00BCD4'
                }}>
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