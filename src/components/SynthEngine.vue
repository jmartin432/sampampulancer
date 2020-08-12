<template>
  <div id="synth-engine"></div>
</template>

<script>
import store from "@/store";
// import ModulatorWorklet from "@/modules/ModulatorWorklet.js";
// import { bus } from '@/main'

// const fs = require('fs');

// console.log(ModulatorWorklet)

export default {
  name: "SynthEngine",
  props: {
    audioOn: {
      type: Boolean
    },
    metronome: {
      type: String,
      required: true
    },
    sampleStart: {
      type: String,
      required: true
    },
    modulators: {
      type: Array,
      required: true
    },
    recording: {
      type: Boolean,
      required: true
    },
    playing: {
      type: Boolean,
      required: true
    },
    nextNote: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      dataStore: store.state,
      recorderNode: null,
      sampleBuffer: null,
      mediaRecorder: null,
      currentNoteStart: null,
      playStart: null,
      lookAhead: .1
    }
  },
  watch: {
    audioOn: function (value) {
      console.log('audioOn changed: ', value)
      value ? this.initializeAudio() : this.destroyAudio()
    },
    recording: function (value) {
      console.log('recording changed: ', value)
      value ? this.startRecord() : this.stopRecord()
    },
    // playing: function (value) {
    //   console.log('playing changed: ', value)
    //   value ? this.playAudio() : this.stopAudio()
    // },
    nextNote: function (index) {
      if (index > -1) {
        let when = this.audioCtx.currentTime + Math.abs((0.1 * 30 ) / ( Math.PI * this.metronome))
        this.scheduleNote(index, when)
      }
    }
  },
  computed: {
    ready: function () {
      return (!!this.audioCtx && !!this.mediaRecorder)
    },
    metronomeSeconds: function () {
      return this.metronome / 1000
    },
    sampleStartSeconds: function () {
      return this.sampleStart / 1000
    },
    noteLengthSeconds: function () {
      return this.sampleBuffer.duration - this.sampleStartSeconds
    }
  },
  methods: {
    initializeAudio: function () {
      console.log('initializing audio')
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)({sampleRate: 44100})
      this.addModulatorModule()
      this.sampleBuffer = this.audioCtx.createBuffer;
      this.createRecordStream()
    },
    addModulatorModule: async function () {
      console.log('adding modulator module')
      try {
        await this.audioCtx.audioWorklet.addModule(
            'modules/ModulatorWorklet.js',
            {
              credentials: 'omit',
            })
      } catch (e) {
        console.log('error:', e)
        return null
      }
    },
    destroyAudio: function () {
      console.log('destroying audio')
      this.audioCtx.close()
    },
    createRecordStream: async function () {
      let mediaRecorder
      let blobToBuffer = this.blobToBuffer
      if (navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia(
            {
              audio: true,
              video: false
        }).then(function (stream) {
          console.log(stream)
          const mimeType = 'audio/webm'
          let chunks = []
          mediaRecorder = new MediaRecorder(stream, { type: mimeType })

          mediaRecorder.ondataavailable = function(e) {
            chunks.push(e.data);
          }

          mediaRecorder.onstop = function() {
            console.log('recording stopped')
            console.log(chunks)
            blobToBuffer(chunks[chunks.length - 1])
          }
        }).catch(function (err) {
          console.log('The following gUM error occurred: ' + err)
        });
      } else {
        console.log('new getUserMedia not supported on your browser!');
      }
      this.mediaRecorder = mediaRecorder
      console.log(this.mediaRecorder)
    },
    startRecord: function () {
      console.log('starting record')
      this.mediaRecorder.start()
    },
    stopRecord: function () {
      console.log('stopping record')
      this.mediaRecorder.stop()
    },
    blobToBuffer: function (blob) {
      console.log('received blob: ', blob)
      let audioCtx = this.audioCtx
      const fileReader = new FileReader();

      fileReader.onloadend = () => {
        let arrayBuffer = fileReader.result;
        audioCtx.decodeAudioData(arrayBuffer, (buffer) => {
          console.log(buffer.duration)
          this.sampleBuffer = buffer
        });
      };
      fileReader.readAsArrayBuffer(blob);
    },
    scheduleNote: function (index, when) {
      console.log(this.noteLengthSeconds)
      const noteOn = this.modulators[index].on
      let freq = this.modulators[index].freq
      console.log('scheduling note', index, noteOn, freq, when)
      this.currentNoteStart = when
      if (!noteOn) return
      const sampleSource = this.audioCtx.createBufferSource()
      sampleSource.buffer = this.sampleBuffer
      const oscillator = this.audioCtx.createOscillator()
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(freq, when)
      const gainNode = this.audioCtx.createGain()
      gainNode.gain.setValueAtTime(0, when)
      gainNode.gain.setTargetAtTime(1, when, 0.01)
      gainNode.gain.setTargetAtTime(0, when + this.noteLengthSeconds - .25, 0.01)
      const modulator = new AudioWorkletNode(this.audioCtx, "modulator-worklet", {numberOfInputs: 2});
      oscillator.connect(modulator, 0, 1)
      sampleSource.connect(modulator, 0, 0)
      modulator.connect(gainNode).connect(this.audioCtx.destination)
      oscillator.start(when)
      oscillator.stop(when + this.noteLengthSeconds)
      sampleSource.start(when, this.sampleStartSeconds)
      sampleSource.stop(when + this.noteLengthSeconds)
    },
  },
  created() {
  }
}
</script>

<style scoped>

</style>