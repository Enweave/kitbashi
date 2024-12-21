<script setup lang="ts">
// props
import {defineProps, nextTick, onMounted, ref} from "vue";

import {SFXPlayer} from "../../engine/SoundController.ts";

const audioRef = ref<HTMLAudioElement | null>(null);

const props = defineProps<{
  sfxPlayer: SFXPlayer;
}>();

onMounted(() => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioContext();
  let source: MediaElementAudioSourceNode | null = null;

  source = audioCtx.createMediaElementSource(audioRef.value!);

  const gainNode = audioCtx.createGain();
  const panNode = audioCtx.createStereoPanner();

  source.connect(gainNode);
  gainNode.connect(panNode);
  panNode.connect(audioCtx.destination);

  audioRef.value!.onended = () => {
    props.sfxPlayer.busy = false;
  }

  props.sfxPlayer.playCallback = () => {
    audioRef.value!.src = props.sfxPlayer.currentSrc;
    gainNode.gain.value = props.sfxPlayer.volume;
    panNode.pan.value = props.sfxPlayer.balance;
    nextTick(() => {
      audioRef.value!.currentTime = 0;
      audioCtx.resume();
      audioRef.value!.play();
    });
  }
})

</script>

<template>
  <audio ref="audioRef" style="display: none"></audio>
  <!--  <audio src="./sound/sfx/LASRGun_Particle%20Compressor%20Fire_01.wav" ref="audioRef" style="display: none"></audio>-->
</template>

<style scoped>

</style>