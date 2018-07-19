

function Context() {
  this.value = null

  this.Provider = (props) => {
    this.value = props.value
    return props.children
  }

  this.Customer =  (props) => {
    return props.children(this.value)
  }

}

export default function createContext() {
  return new Context()
}