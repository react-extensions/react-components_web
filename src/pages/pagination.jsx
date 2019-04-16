// path: '/pagination'

import React, { Component } from 'react';
import {
    Pagination,
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
                <Pagination total={123} />
            </div>
        );
    }
}

export default Display;