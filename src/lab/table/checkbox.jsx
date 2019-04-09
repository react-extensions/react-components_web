import Checkbox from '../../ui/components/checkbox';
import React from 'react';

export default function(props) {
    const { type, rowData, rowIndex,getCheckboxProps=()=>null,...rest} = props;
    const otherProps = getCheckboxProps(rowData, rowIndex);
    return <Checkbox {...otherProps}  {...rest} />
};