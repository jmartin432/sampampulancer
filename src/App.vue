<template>
  <div id="main">
    <div id='container'>
      <div id="audio-controls-container">
        <AudioControls parentGetData="getData">Audio</AudioControls>
      </div>
      <div id="visual-controls-container">
        <VisualControls parentGetData="getData">Visual</VisualControls>
      </div>
      <div id="canvas-container">
        <Canvas></Canvas>
      </div>
    </div>
  </div>
</template>

<script>
import AudioControls from './components/AudioControls.vue'
import VisualControls from './components/VisualControls.vue'
import Canvas from './components/Canvas.vue'
import store from './store'

export default {
  name: 'App',
  components: {
    AudioControls,
    VisualControls,
    Canvas
  },
  data () {
    return {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
      dataStore: store.state
    }
  },
  methods: {
    handleResize: function () {
      store.setWidth(document.documentElement.clientWidth)
      store.setHeight(document.documentElement.clientHeight)
    }
  },
  created() {
    window.addEventListener("resize", this.handleResize);
  },
  destroyed() {
    window.removeEventListener("resize", this.handleResize);
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
