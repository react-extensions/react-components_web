import React from 'react'

class Input extends React.PureComponent {
  constructor(props) {
    super(props)
    // 必须在一开始就判断有没有这个属性，不然根据render中的写法
    // hasIcon会影响节点类型，更换节点类型会导致正在输入的输入框失去焦点
    // 例如当从 hasIcon = false 变成 true时， 节点<input/> 会被替换成 <span><input/></span>
    // 此时会导致输入框失去焦点
    this.needWrap = props.hasOwnProperty('iconBefore')
      || props.hasOwnProperty('iconAfter')
      || props.hasOwnProperty('fixAfter')
      || props.hasOwnProperty('fixBefore')
  }

  render() {
    const {
      htmlType,
      className,
      iconBefore,
      iconAfter,
      fixBefore,
      fixAfter,
      status,
      ...restProps
    } = this.props

    const cN = (className ? (' ' + className) : '')
      + (fixAfter ? ' _fix-after' : '')
      + (fixBefore ? ' _fix-before' : '')

    const sN = (status ? (' _' + status) : '')

    return !this.needWrap
      ? (<input {...restProps} type={htmlType} className={'u-plain-input' + cN + sN}/>)
      : (
        <span className={'u-input-wrapper__outer ' + cN}>
               {fixBefore && <span className={'u-input-fix _before'}>{fixBefore}</span>}
              <span className={'u-input-wrapper__inner'}>
                {iconBefore && <span className={'u-input-icon _before'}>{iconBefore}</span>}
                <input {...restProps}
                       type={htmlType}
                       className={
                         'u-plain-input'
                         + (!!iconBefore ? ' _icon-before' : '')
                         + (!!iconAfter ? ' _icon-after' : '')
                         + sN
                       }
                />
                {iconAfter && <span className={'u-input-icon _after'}>{iconAfter}</span>}
              </span>
            {fixAfter && <span className={'u-input-fix _after'}>{fixAfter}</span>}
        </span>
      )

  }
}

Input.defaultProps = {
  htmlType: 'text'
}

export default Input