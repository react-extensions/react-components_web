import React, { Component } from 'react';
import './style.less';
import Header from '@comps/header';
import Menu from '@comps/menu';

class Content extends Component {
    render() {
        return (
            <div className='page content-page'>
                <Header/>
                <div className='page-body'>
                    <div className='_page-side-bar'>
                        <Menu/>
                    </div>
                    <div className='_page-content'>
                        {this.props.renderMarkdown()}
                    </div>
                </div>
            </div>
        );
    }
}

export default Content;