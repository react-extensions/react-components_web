import React from 'react';
import PropTypes from 'prop-types';
import './style.scss';

class Steps extends React.Component {
    render() {
        const steps = this.props.steps;
        const preSteps = steps.slice(0, -1);
        const stepsLen = steps.length - 1;
        const width = (100 / stepsLen) + '%';

        const renderStep = function (isPre, step, index) {
            if (!step) return;
            if (typeof step !== 'object') {
                step = {
                    text: step,
                    prefix: null,
                    note: '未发生飞洒发地方按时的飞洒发十大飞洒地方撒地方'
                };
            }
            return (
                <div className='n-step-item' key={index} style={isPre ? {width: width} : null}>
                    <div className='n-step-node'>
                        <span className={'n-step-sym' + (step.prefix ? '' : ' _index')}>
                            {step.prefix || index + 1}
                        </span>
                        <div className='n-step-text'>
                            <span>{step.text}</span>
                            <div className='n-step-note-text'>
                                {step.note}
                            </div>
                        </div>
                    </div>
                </div>
            );
        };
        return (
            <div className='n-steps'>
                <div className='_responsive'>
                    {
                        preSteps.map((step, index) => {
                            return renderStep(true, step, index);
                        })
                    }
                </div>
                <div className='_static'>
                    {renderStep(false, steps[stepsLen], stepsLen)}
                </div>
            </div>
        );
    }
}

Steps.propTypes = {
    steps: PropTypes.array,

};

export default Steps;