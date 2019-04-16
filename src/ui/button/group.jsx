import React from 'react';

export default function BtnGroup(props) {
    return (
        <div className='r-btn-group' aria-label='按钮组合'>
            {props.children}
        </div>
    );
}
