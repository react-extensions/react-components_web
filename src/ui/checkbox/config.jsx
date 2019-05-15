import React from 'react';
import Icon from '../icon';

export default {
    icon: {
        Check: props => (<Icon type='check-square' {...props} />),
        NotCheck: props => (<Icon type='border' {...props} />)
    }
};