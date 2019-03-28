import React from 'react';
import PropTypes from 'prop-types';
import Context from './context';
const { Consumer } = Context;


class Option extends React.Component {

    shouldComponentUpdate(nextProps) {
        const nS = nextProps.selected;
        const cS = this.props.selected;
        const id = this.props.id;
        return nS !== cS && (nS === id || cS === id);
    }
    render() {
        const {
            children,
            id,
            selected,
            parent
        } = this.props;

        return (
            <div className={'r-select-option' + (id === selected ? ' _active' : '')}
                onClick={() => parent.toggleOption(id, children)}
            >
                {children}
            </div>
        );
    }
};

Option.propTypes = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};


export default class Comsumer extends React.Component {
    render() {
        return (
            <Consumer>
                {
                    obj => <Option {...obj} {...this.props} />
                }
            </Consumer>
        );
    }
};