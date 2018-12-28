import './style.scss'
import View from './view'
import {alert, confirm} from './function'
import portal from './portal.js'

const Modal = portal(View)


Modal.alert = alert
Modal.confirm = confirm

export default Modal