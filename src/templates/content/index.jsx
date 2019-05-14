import React, { Component } from 'react';
import './style.less';
import HeaderContent from '@comps/header-content';
import {
    Layout,
} from '@/ui';
import Menu from '@comps/menu';

const {Header, Aside, Main, Container} = Layout;

class Content extends Component {
    render() {
        return (
            <Container className='content-page' cover={true}>
                <Header fixed={true}>
                    <HeaderContent />
                </Header>
                <Aside fixed={true}>
                    <Menu />
                </Aside>
                <Main >
                    <div className='markdown-content-wrap'>
                        {this.props.renderMarkdown()}
                    </div>
                </Main>
            </Container>
        );
    }
}

export default Content;