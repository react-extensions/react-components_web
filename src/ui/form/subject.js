export default class Subject {
  constructor(){
    this.observerQueue = []
  }
  addObserver(observer) {
    this.observerQueue.push(observer)
  }
  notify(){
    this.observerQueue.forEach(item=>item.update())
  }
}