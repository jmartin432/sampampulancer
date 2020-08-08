<template>
    <canvas id="canvas" v-bind:width="canvasWidth" v-bind:height="canvasHeight"></canvas>
</template>

<script>
import store from '../store'

export default {
  name: "Canvas",
  data () {
    return {
      dataStore: store.state,
      width: store.state.width,
      height: store.state.height
    }
  },
  computed: {
    canvasWidth: function () {
      return this.width
    },
    canvasHeight: function () {
      return this.height
    },
  },
  // created() {
  //   let canvas = document.getElementById('canvas')
  //   canvas.setAttribute('width', store.state.width.toString())
  //   canvas.setAttribute('height', store.state.height.toString())
  // },
}
</script>

<style scoped>
  #canvas-container {
  margin: 0px;
  width: 100vw;
  height: 100%;
  position: absolute;
  z-index: 0
}
</style>