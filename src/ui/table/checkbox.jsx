import Checkbox from '../checkbox';
import React from 'react';

export default function (props) {
    const {rowData, rowIndex, getCheckboxProps, ...rest} = props;
    const otherProps = getCheckboxProps(rowData, rowIndex);
    return <Checkbox {...otherProps} {...rest} />;
};