import React from 'react'
import Context from './index'
export default function (Comp) {
  return function (props) {
    return <Context.Customer>
      { value => <Comp msg={value} {...props}/> }
    </Context.Customer>
  }
}