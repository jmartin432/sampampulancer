<template>
  <div id="audio-controls">
    <button id="toggle-audio-btn" @click="toggleAudio" ref="audioTgl">Off</button>
    <button id="record-btn" @click="handleRecord" :disabled="!audioOn || recording">Record</button>
    <button id="play-btn" @click="togglePlay" ref="playTgl" :disabled="!audioOn || recording || !haveSample">Play</button>
    <input type="range" min="-12" max="12" step=".01" class="slider" id="metronome" v-model="metronome">
    <input type="range" min="0" max="900" step="1" class="slider" id="sample-start" v-model="sampleStart">
    <div class="audio-control" id="modulator-control">
      <svg v-bind:width="modControlParams.size" v-bind:height="modControlParams.size">
        <rect v-for="(item) in modulatorSliders"
              v-bind:key="item.id"
              v-bind:x="item.x" v-bind:y="item.y" v-bind:width="item.width" v-bind:height="item.height" rx="3"
              stroke="#1c1b1b" fill="#7a807c"
              v-bind:transform="item.transform">
          <!--              :stroke="item.on ? '#1c1b1b': '#a6a1a1'"-->
        </rect>
        <circle class="draggable modulator"
                v-for="(item, index) in modulatorKnobs"
                v-bind:key="item.id" v-bind:id="'mod-knob-' + index" v-bind:cx="item.cx" v-bind:cy="item.cy" v-bind:r="item.r"
                stroke="black" :fill="item.on ? '#f22933': '#ed9a9e'"
                v-bind:transform="item.transform"
                @mousedown="startUpdateModulator" @mousemove="updateModulator"
                @mouseup="endUpdateModulator" @mouseleave="endUpdateModulator">
        </circle>
        <circle class="static"
                v-for="(item, index) in modulatorToggles"
                v-bind:key="item.id" v-bind:id="'mod-toggle-' + index" v-bind:cx="item.cx" v-bind:cy="item.cy" v-bind:r="item.r"
                v-bind:transform="item.transform"
                stroke="black" :fill="item.on ? '#edaf09': '#edd491'"
                @click="toggleModulator(index)">
        </circle>
        <rect v-bind:x="modControlParams.size / 2" v-bind:y="modControlParams.size / 2"
              width="140" height="6" rx="3"
              stroke="aqua" fill="aqua"
              v-bind:transform="playheadTransform" />
      </svg>
    </div>
    <div id="synth-engine-container">
      <SynthEngine
          v-bind:audioOn="audioOn"
          v-bind:metronome="metronome"
          v-bind:sampleStart="sampleStart"
          v-bind:modulators="modulators"
          v-bind:recording="recording"
          v-bind:playing="playing"
          v-bind:nextNote="nextNote"
      >Synth Engine</SynthEngine>
    </div>
  </div>
</template>

<script>
import store from '@/store'
import SynthEngine from "@/components/SynthEngine";
// import { bus } from '@/main'

export default {
  name: "Audio-Controls",
  components: {SynthEngine},
  data () {
    return {
      audioCtx: null,
      audioOn: false,
      metronome: '6.0',
      sampleStart: '0',
      recording: false,
      haveSample: false,
      playing: false,
      timerId: null,
      modControlParams: {
        size: 350
      },
      modulationControlCenter: 125,
      updatingModulator: null,
      playhead: -1.57079632679,
      playheadInterval: 25, // milliseconds
      previousNow: null,
      nextNote: -1,
      schedule: false,
      centerAngles: [
        -2.82743338823,
        -2.19911485751,
        -1.57079632679,
        -0.94247779607,
        -0.31415926535,
        0.31415926535,
        0.94247779607,
        1.57079632679,
        2.19911485751,
        2.82743338823
      ],
      modulators: [
          {on: true, freq: 600, angle: -2.82743338823},
          {on: true, freq: 600, angle: -2.19911485751},
          {on: true, freq: 600, angle: -1.57079632679},
          {on: true, freq: 600, angle: -0.94247779607},
          {on: true, freq: 600, angle: -0.31415926535},
          {on: true, freq: 600, angle: 0.31415926535},
          {on: true, freq: 600, angle: 0.94247779607},
          {on: true, freq: 600, angle: 1.57079632679},
          {on: true, freq: 600, angle: 2.19911485751},
          {on: true, freq: 600, angle: 2.82743338823}
        ],
      dataStore: store.state
    }
  },
  watch: {
    // recording: function (value) {
    //   console.log('recording changed: ', value)
    //   if (!value) this.playing = true
    // },
    // playing: function () {
    //   this.$refs.playTgl.innerText = this.playing ? 'Stop' : 'Play';
    // },
  },
  computed: {
    modulatorSliders: function () {
      return this.modulators.map(modulator => {
        let newObj = {}
        newObj['x'] = this.modControlParams.size / 2
        newObj['y'] = this.modControlParams.size / 2
        newObj['width'] = 100
        newObj['height'] = 6
        newObj['on'] = modulator.on
        newObj['transform'] = `rotate(${modulator.angle * 180.0 / Math.PI} ${this.modControlParams.size / 2} ${this.modControlParams.size / 2}) translate(40 -3)`
        return newObj
      })
    },
    modulatorKnobs: function () {
      return this.modulators.map(modulator => {
        let convertedFreq = this.convertRange(modulator.freq, 400, 1000, 0, 100)
        let newObj = {}
        newObj['cx'] = this.modControlParams.size / 2
        newObj['cy'] = this.modControlParams.size / 2
        newObj['r'] = 10
        newObj['on'] = modulator.on
        newObj['transform'] = `rotate(${modulator.angle * 180.0 / Math.PI}
          ${this.modControlParams.size / 2} ${this.modControlParams.size / 2})
          translate(${40 + convertedFreq} 0)`
        return newObj
      })
    },
    modulatorToggles: function () {
      return this.modulators.map(modulator => {
        let newObj = {}
        newObj['cx'] = this.modControlParams.size / 2
        newObj['cy'] = this.modControlParams.size / 2
        newObj['r'] = 10
        newObj['on'] = modulator.on
        newObj['transform'] = `rotate(${modulator.angle * 180.0 / Math.PI}
          ${this.modControlParams.size / 2}
          ${this.modControlParams.size / 2}) translate(160 0)`
        return newObj
      })
    },
    playheadTransform: function () {
      return `rotate(${this.playhead * 180.0 / Math.PI}
        ${this.modControlParams.size / 2}
        ${this.modControlParams.size / 2}) translate(0 -3)`
    }
  },
  methods: {
    toggleAudio: function () {
      console.log('here', this.audioOn)
      if (this.audioOn === false) {
        this.$refs.audioTgl.innerText = 'On'
        this.audioOn = true
      } else {
        this.$refs.audioTgl.innerText = 'Off'
        this.audioOn = false
      }
    },
    handleRecord: function () {
      if (!this.recording)
        this.recording = true
      setTimeout( () => {
        this.haveSample = true
        this.recording = false
        this.startPlay()
      }, 1000)
    },
    togglePlay: function () {
      if (!this.playing) {
        this.startPlay()
      } else {
        this.playing = false
        this.$refs.playTgl.innerText = 'Play'
        this.previousNow = null
        clearInterval(this.timerId)
      }
    },
    startPlay: function () {
      this.playing = true
      this.$refs.playTgl.innerText = 'Stop'
      if (this.timerId != null) { clearInterval(this.timerId)}
      this.timerId = window.setInterval(this.updatePlayhead, this.playheadInterval)
    },
    updatePlayhead: function () {
      const now = Date.now()
      let interval = (this.previousNow === null) ? 0.0 : now - this.previousNow
      this.playhead += ( interval * Math.PI * this.metronome ) / ( 1000 * 30.0)
      this.previousNow = now
      if (this.metronome > 0 && this.playhead > Math.PI) {
        this.playhead = -1 * Math.PI
      }
      if (this.metronome < 0 && this.playhead < -1 * Math.PI) {
        this.playhead = Math.PI
      }
      if (this.playhead < 0) {
        for (let i = 0; i < 5; i++){
          if (Math.abs(this.playhead - this.modulators[i].angle) < .1) {
            this.nextNote = i
            return
          }
        }
      } else {
        for (let i = 5; i < 10; i++){
          if (Math.abs(this.playhead - this.modulators[i].angle) < .1) {
            this.nextNote = i
            return
          }
        }
      }
      this.nextNote = -1
    },
    toggleModulator: function (index) {
      this.modulators[index].on = !this.modulators[index].on
    },
    startUpdateModulator: function (event) {
      this.updatingModulator = event.target.id.replace('mod-knob-', '')
    },
    updateModulator: function (event) {
      if (this.updatingModulator === null) return
      let index = this.updatingModulator
      let relX = event.offsetX - this.modControlParams.size / 2
      let relY = event.offsetY - this.modControlParams.size / 2
      let distance = this.clamp(Math.sqrt(Math.pow(relX, 2) + Math.pow(relY, 2)), 40, 140)
      this.modulators[index].freq = this.convertRange(distance - 40, 0, 100, 400, 1000)
      let angle = Math.atan2(relY, relX)
      this.modulators[index].angle = this.clamp(angle, this.centerAngles[index] - .1, this.centerAngles[index] + .1)
    },
    endUpdateModulator: function () {
      this.updatingModulator = null
    },
    convertRange: function (oldVal, oldMin, oldMax, newMin, newMax) {
      return (((oldVal - oldMin) * (newMax - newMin)) / (oldMax - oldMin)) + newMin
    },
    clamp: function (val, min, max) {
      return val > max ? max : val < min ? min : val;
    }
  }
}
</script>

<style scoped>
input {
  display: block;
}

.static {
  cursor: pointer;
}

.draggable {
  cursor: move;
}

.audio-control {
  border: 1px solid aquamarine;
}

</style>