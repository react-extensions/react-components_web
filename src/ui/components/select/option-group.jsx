

/* OptionGroup */
class OptionGroup extends React.Component {

  handleClick(e, v) {
    // e.stopPropagation()
    this.parent().setState({
      selected: v
    })
  }
  parent() {
    return this.context.Select
  }
  render() {
    const { label, value, children } = this.props
    return (
      <ul className="select-group__wrap" onClick={e => this.handleClick(e, { value, label })} >
        <li className="select-group__title">
          {label}
        </li>
        <li>
          <ul className="select-group">
            {children}
          </ul>
        </li>
      </ul>
    )
  }
}

OptionGroup.contextTypes = {
  Select: PropTypes.any
}