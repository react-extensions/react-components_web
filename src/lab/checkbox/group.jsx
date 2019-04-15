import React from 'react';
import PropTypes from 'prop-types';
import Context from './context';


class Group extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            value: []
        };
        this.onChildChange = this.onChildChange.bind(this);
    }

    static getDerivedStateFromProps(props) {
        return {
            isControlled: props.hasOwnProperty('value')
        };
    }

    onChildChange(checked, id) {
        const {
            isControlled,
            value: stateValue
        } = this.state;
        const {
            value: propsValue,
        } = this.props;

        let queue = [...(isControlled ? propsValue : stateValue)];

        if (checked) {
            queue.push(id);
        } else {
            queue.splice(queue.indexOf(id), 1);
        }

        this.props.onChange([...queue]);

        if (isControlled) {
            return;
        }
        this.setState({
            value: queue
        });
    }

    render() {
        const {
            value: propsValue,
            children,
        } = this.props;
        const {
            isControlled,
            value: stateValue
        } = this.state;
        const value = isControlled ? propsValue : stateValue;

        return (
            <Context.Provider value={{
                onChange: this.onChildChange,
                value: value,
                isGroup: true
            }}>
                {children}
            </Context.Provider>
        );
    }
}


/* Group props 类型检查 */
Group.propTypes = {
    className: PropTypes.string, //自定义类名
    value: PropTypes.array,
};

Group.defaultProps = {
    onChange: () => {
    }
};

export default Group;
