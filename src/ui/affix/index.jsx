import React, {
    useRef,
    useEffect,
    useState
} from 'react';
import PropTypes from 'prop-types';

Affix.propTypes = {
    closest: PropTypes.bool, // 设置成true，会自动查找最接近的可以滚动的父元素
    offsetTop: PropTypes.number
}

Affix.defaultProps = {
    offsetTop: 0
}

export default function Affix(props) {
    const elRef = useRef()
    const [offsetTop, setOffsetTop] = useState(0)
    const [isFixed, setIsFixed] = useState(false)
    const [stateTarget, setStateTarget] = useState(null)
    const [distanceFromAffixToTargetTop, set_D_F_A_T_T_T] = useState(0) // 如果滚动元素不是window，获取位置

    useEffect(() => {
        const el = elRef.current
        let scrollHandleFn
        let target = window

        if (props.closest) {
            let distance = distanceFromAffixToTargetTop
            target = stateTarget

            // didMount 只执行一次
            if (!stateTarget) {
                target = getClosestScrollParent(el) || window
                distance = (
                    el.getBoundingClientRect().top
                    + target.scrollTop
                    - props.offsetTop
                    - target.getBoundingClientRect().top
                );
                set_D_F_A_T_T_T(distance)
                setStateTarget(target)
            }

            scrollHandleFn = function (e) {
                const needFix = e.target.scrollTop > distance
                if (needFix !== isFixed) {
                    setOffsetTop(target.getBoundingClientRect().top)
                    setIsFixed(needFix)
                }
            }
        }
        // 针对window滚动
        else {
            // 针对window滚动的监听函数
            scrollHandleFn = function () {
                const needFix = el.getBoundingClientRect().top <= props.offsetTop
                if (needFix !== isFixed) {
                    setIsFixed(needFix)
                }
            }
        }

        target.addEventListener('scroll', scrollHandleFn)
        return () => {
            target.removeEventListener('scroll', scrollHandleFn)
        }
    })

    return (
        <div className='n-affix' ref={elRef} >
            <div style={isFixed ? { position: 'fixed', top: offsetTop + props.offsetTop } : null}>
                {props.children}
            </div>
        </div>
    )
}


/**
 * 获取最靠近的可滚动的父元素
 * @param {DOM el} target 
 */
function getClosestScrollParent(target) {
    let parent = target.parentElement
    while (parent) {
        if (parent.scrollHeight > parent.offsetHeight) {
            return parent
        }
        parent = parent.parentElement
    }
    return null
}

