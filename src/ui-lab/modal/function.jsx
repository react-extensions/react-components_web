import React from 'react';
import ReactDOM from 'react-dom'
import View from './view'
import * as TYPES from './const'


function alert(options) {
  render(options, TYPES.ALERT)
}

function confirm(options) {
  render(options, TYPES.CONFIRM)
}

let container = null

let toggle = false

function render(options = {}, type) {
  if(!container) {
    container = document.body.appendChild(document.createElement('div'))
  }
  options.type = type
  toggle = !toggle
  options._toggle = toggle
  options._isFunction = true
  ReactDOM.render( <View {...options} onChange/>, container)
}


export  {
  alert,
  confirm
}