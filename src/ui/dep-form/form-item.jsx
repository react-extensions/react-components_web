import React, {Component} from 'react';

class FormItem extends Component {
  componentDidMount() {
    const props = this.props
    props.interfaces(props.name, props.dependence)
  }

  render() {
    return React.cloneElement(children, Object.assign({},children.props || {}, {interfaces: getInterfaces}))
  }
}

export default FormItem;