import { Component } from 'react';
import ReactDOM from 'react-dom';

class Modal extends Component {
    constructor() {
        super();
        this.div = document.createElement('div');
    }
    componentDidMount() {
        document.body.appendChild(this.div);
    }
    componentWillUnmount() {
        document.body.removeChild(this.div);
    }
    render() {
        return (ReactDOM.createPortal(this.props.children, this.div));
    }
}

export default Modal;