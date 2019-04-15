import React from 'react';
import Icon from '../icon';

export default {
    icon: {
        ArrowUp: props => (<Icon type='caret-up' {...props} />),
        ArrowDown: props => (<Icon type='caret-down' {...props} />),
        Loading: props => (<Icon type='loading' {...props} />),
        Check: props => (<Icon type='check-square' {...props} />),
        HalfCheck: props => (<Icon type='check-square' {...props} />),
        NotCheck: props => (<Icon type='border' {...props} />)
    }
}