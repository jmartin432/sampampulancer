export default {
  debug: true,
  state: {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
  },
  setWidth (value) {
    if (this.debug) console.log('setWidth triggered with', value)
  },
  setHeight (value) {
    if (this.debug) console.log('setHeight triggered with', value)
  }
}
