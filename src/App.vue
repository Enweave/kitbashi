<script setup lang="ts">

import {FlowController, Screen} from "./engine/FlowController.ts";
import MainMenuScreen from "./components/MainMenuScreen.vue";
import GameScreen from "./components/GameScreen.vue";
import CreditsScreen from "./components/CreditsScreen.vue";
import {onMounted, ref} from "vue";

const ASPECT_RATIO = 10 / 9;

const containerRef = ref<HTMLElement | null>(null);
const screenRef = ref<HTMLElement | null>(null);

const flowController = new FlowController();

let resizeScreen = function () {
  if (containerRef.value && screenRef.value) {
    const containerWidth = containerRef.value.clientWidth;
    const containerHeight = containerRef.value.clientHeight;
    const containerAspectRatio = containerWidth / containerHeight;

    if (containerAspectRatio > ASPECT_RATIO) {
      screenRef.value.style.width = `${containerHeight * ASPECT_RATIO}px`;
      screenRef.value.style.height = `${containerHeight}px`;
    } else {
      screenRef.value.style.width = `${containerWidth}px`;
      screenRef.value.style.height = `${containerWidth / ASPECT_RATIO}px`;
    }
  }
}

onMounted(() => {
  resizeScreen();
  window.addEventListener('resize', () => {
    resizeScreen();
  });
})

</script>

<template>
<div id="container" class="container" ref="containerRef">
  <div id="screen" class="screen" ref="screenRef">
    <main-menu-screen :flowController="flowController" v-if="flowController.currentScreen.value === Screen.MainMenu"/>
    <game-screen :flowController="flowController" v-if="flowController.currentScreen.value === Screen.Game"/>
    <credits-screen :flowController="flowController" v-if="flowController.currentScreen.value === Screen.Credits"/>
  </div>
</div>
</template>

<style scoped>
</style>
