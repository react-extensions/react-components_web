import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
    Consumer,
    Provider
} from './context';

class AnchorSelectGroup extends Component {
    shouldComponentUpdate(nextProps) {
        return nextProps.selectedMap !== this.props.selectedMap;
    }
    componentDidMount() {
        this.emit(true);
    }
    componentWillUnmount() {
        this.emit(false);
    }
    emit(isActive) {
        this.props.parent.toggleActiveAnchor(this.props.anchor, isActive);
    }
    render() {
        const {
            parent, selectedMap,
            anchor, children
        } = this.props;
        return (
            <div className='_options-group' key={anchor}>
                <div className='_options-anchor'
                    ref={el => parent.getAnchorEl(anchor, el)}
                >
                    {anchor}
                </div>
                <div className='_option-list'>
                    <Provider value={{ parent, selectedMap }}>
                        {children}
                    </Provider>
                </div>
            </div>
        );
    }
}

AnchorSelectGroup.propTypes = {
    anchor: PropTypes.string.isRequired,
    // children: PropTypes.arrayOf(PropTypes.instanceOf(Option)).isRequired
};


export default function AnchorSelectGroupConsumer(props) {
    return (
        <Consumer>
            {obj => <AnchorSelectGroup {...props} {...obj} />}
        </Consumer>
    );
}