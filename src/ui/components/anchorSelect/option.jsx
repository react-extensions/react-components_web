import React from 'react';
import PropTypes from 'prop-types';
import {
    Consumer
} from './context'

class AnchorSelectOption extends React.Component {
    shouldComponentUpdate(nextProps) {
        const { selectedMap, id } = this.props
        const nextSubMap = nextProps.selectedMap
        const subMap = selectedMap
        return nextSubMap[id] !== subMap[id]
    }
    componentWillUnmount() {
        const { parent, id, selectedMap } = this.props
        if (selectedMap[id]) {
            parent.toggleOptionSelect(id, false)
        }
    }
    render() {
        const {
            parent, selectedMap,
            children, id
        } = this.props
        const isSelected = selectedMap[id]
        return (
            <div
                className={'_option-item' + (isSelected ? ' _active' : '')}
                onClick={() => { parent.toggleOptionSelect(id, !isSelected) }}
            >
                {children}
            </div>
        )
    }

}

AnchorSelectOption.propTypes = {
    // 代表着该项的唯一id
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    children: PropTypes.node.isRequired
};

export default function AnchorSelectOptionConsumer(props) {
    return (
        <Consumer>
            {obj => <AnchorSelectOption {...obj} {...props} />}
        </Consumer>
    )
}
