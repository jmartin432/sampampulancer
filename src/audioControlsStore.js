export default {
  debug: true,
  state: {
    audioOn: false,
    play: false,
    modulators: [400, 400, 400, 400, 400, 400, 400, 400, 400, 400],
    metronome: 1000,
  },
  setPlay () {
    if (this.debug) console.log('Play/Stop triggered')
    this.state.play = !this.state.play
  },
  setMetronome (value) {
    if (this.debug) console.log('setMetronome triggered with', value)
    this.state.metronome = value
  },
  setModulator (index, value) {
    if (this.debug) console.log('setModulator triggered with', index, value)
    this.state.modulators[index] = value
  },
  setAudio (value) {
    if (this.debug) console.log('setAudio triggered with', value)
  }
}