import React from 'react';
import * as TYPES from './const'
import Icon from '../icon'
import Button from '../button'

/**
 * @prop {any} title  头部标题, 不传 不渲染
 * @prop {any} content 内容
 * @prop {any} footer  底部按钮区, 默认为按钮, 传入会替换, 显示的传入footer={null} 隐藏底部
 * @prop {any} cancelContent  取消按钮里的内容
 * @prop {any} okContent  确认按钮里的内容
 * @props {boolean} removeCloseBtn  是否需要右上角的关闭按钮
 * @prop {boolean} visible  控制显示隐藏
 * @prop {string} containerClass  蒙版
 * @prop {string} className  容器
 * @prop {object} maskStyle
 * @prop {object} style
 *
 */


class Modal extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      isVisible: props.visible || props._isFunction,
    }
    this.onOk = this.onOk.bind(this)
    this.onCancel = this.onCancel.bind(this)
  }


  UNSAFE_componentWillReceiveProps(nextP) {
    if(nextP.visible !== this.props.visible) {
      this.setState({isVisible: nextP.visible})
    }
    if(nextP._toggle !== this.props._toggle && nextP._isFunction && !this.state.isVisible) {
      this.setState({isVisible: true})
    }
  }
  onCancel(e) {
    const fn = this.props.onCancel
    let shouldClose = true
    /* 如果 onCancel函数 返回 false, 则不会关闭模态框 */
    if(fn) {
      shouldClose = fn(e) !== false
    }

    if(!this.props.hasOwnProperty('visible') && shouldClose) {
      this.setState({ isVisible: false})
    }
  }
  onOk(e) {
    const props = this.props
    const fn = props.onOk
    fn && fn(e)

    if(!props._isFunction) return

    this.setState({ isVisible: false})

  }

  render() {
    const props = this.props
    const isVisible = this.state.isVisible
    const pN = props.className
    const cN = 'u-modal'
      + (!props.title ? ' _no-title' : '')
      + (!props._isFunction ? ' _not-fn':'')
      + (' _' + props.type.toLowerCase())
      + (pN ? (' '+pN) : '')

    const maskN = 'u-modal-container '
      + (!isVisible ? '_hidden ' : '')
      + (props.needMask ? '_mask ': '')
      + (props.containerClass||'')

    return (
      <div className={maskN} style={props.containerStyle}>

        <div className={'u-modal-position-box'}>
          <div
            className={cN}
            style={Object.assign({width: 406}, props.style, (props.width ? {width: props.width}:null))}
          >
            {/* 右上角关闭按钮*/}
            {
              !props.removeCloseBtn && (
                <button className={'u-modal-close-btn'} onClick={this.onCancel}>
                  <Icon type={'close'} />
                </button>
              )
            }

            {/* title */}
            { props.title && <div className={'u-modal-header'}>{props.title}</div>}

            {/* content */}
            <div className={'u-modal-body'}>
              {/*<div className={'u-modal-body-content'}>*/}
              {isVisible && (props.children || props.content)}
              {/*</div>*/}
            </div>

            {/* footer */}
            {/* 如果传了footer，就用props.footer。 如果显式的定义footer={null}, 则不渲染footer*/}
            {
              props.footer || ( props.footer === null ? null : (
                  <div className={'u-modal-footer border-top'}>
                    {
                      props.footerRender || (
                        <React.Fragment>
                          {/*alert模式下只需要 ok*/}
                          {
                            props.type !== TYPES.ALERT ? (
                              <Button
                                className={'u-modal-btn _cancel border-right'}
                                onClick={this.onCancel}
                              >
                                {props.cancelContent || '取消'}
                              </Button>
                            ) : null
                          }

                          <Button
                            className={'u-modal-btn _ok'}
                            onClick={this.onOk}
                            type={'primary'}
                            disabled={props.disabledOkBtn}
                          >
                            {props.okContent || '确定'}
                          </Button>
                        </React.Fragment>
                      )
                    }
                  </div>
                )
              )
            }
          </div>
        </div>
      </div>
    )
  }
}

Modal.defaultProps = {
  type: '',
  removeCloseBtn: false,
  needMask: true
}


export default Modal