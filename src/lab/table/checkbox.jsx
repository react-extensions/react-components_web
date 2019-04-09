import Checkbox from '../../ui/components/checkbox';
import React from 'react';

export default function(props) {
    const { type, rowData, rowIndex,getCheckboxProps=()=>{},...rest} = props;
    const otherProps = getCheckboxProps(rowData, rowIndex);
    return <Checkbox {...otherProps}  {...rest} />
};