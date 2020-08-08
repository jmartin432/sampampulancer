<template>
  <div class="modal" id="initialize-audio-modal">
    <h1 id="modal-header"></h1>
    <p id="modal-text">Sound?</p>
    <button id="yes-audio-button">Yes</button>
    <button id="no-audio-button">No</button>
  </div>
</template>

<script>
import store from "@/store";

export default {
  name: "InitalizeModal",
  data () {
    return {
      metronome: 1000,
      modulators: [400, 400, 400, 400 , 400],
      dataStore: store.state
    }
  },
  methods: {

  },
  mounted() {

  }
}
</script>

<style scoped>
#modal-container{
    position: fixed;
    display: block;
    z-index: 20;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    z-index: 200;
    background-color: rgba(0,0,0,0.3);
}

.modal {
    position: fixed;
    top: 30%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    width: 30%;
    height: 30%;
    overflow: auto;
    color: #fff;
    background-color: rgb(0,0,0);
    background-color: rgba(0,0,0,0.9);
}

</style>