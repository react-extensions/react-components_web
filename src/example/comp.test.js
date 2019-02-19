import React from 'react';
import Count from './comp';
import {
    shallow,
    configure
} from 'enzyme'
import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });

test('Count change the number when cliced the btn', () => {
  const count = shallow( <Count /> );
  expect(count.find('h1').text()).toEqual('0')
  count.find('button').at(1).simulate('click')
  count.find('button').at(1).simulate('click')
  expect(count.find('h1').text()).toEqual('2')
  count.find('button').at(0).simulate('click')
  expect(count.find('h1').text()).toEqual('1')

});
