<script setup lang="ts">

import {FlowController, Screen} from "./engine/FlowController.ts";
import MainMenuScreen from "./components/MainMenuScreen.vue";
import GameScreen from "./components/GameScreen.vue";
import CreditsScreen from "./components/CreditsScreen.vue";
import {onMounted, ref} from "vue";
import {InputController} from "./engine/InputController.ts";
import {ASPECT_RATIO} from "./engine/Constants.ts";
import {Vector2} from "./engine/Utils.ts";

const containerRef = ref<HTMLElement | null>(null);
const screenRef = ref<HTMLElement | null>(null);

const flowController = new FlowController();
const inputController = new InputController(flowController);

let resizeScreen = function () {
  if (containerRef.value && screenRef.value) {
    const containerWidth = containerRef.value.clientWidth;
    const containerHeight = containerRef.value.clientHeight;
    const containerAspectRatio = containerWidth / containerHeight;

    let resultWidth: number;
    let resultHeight: number;

    if (containerAspectRatio > ASPECT_RATIO) {
      resultWidth = containerHeight * ASPECT_RATIO;
      resultHeight = containerHeight;

    } else {
      resultWidth = containerWidth;
      resultHeight = containerWidth / ASPECT_RATIO;
    }

    screenRef.value.style.width = `${resultWidth}px`;
    screenRef.value.style.height = `${resultHeight}px`;

    flowController.viewportContainerSize.value = new Vector2(resultWidth, resultHeight);
  }
}

onMounted(() => {
  resizeScreen();
  window.addEventListener('resize', () => {
    resizeScreen();
  });

  window.addEventListener('orientationchange', () => {
    resizeScreen();
  });
})

</script>

<template>
  <div id="container" class="container" ref="containerRef">
    <div id="screen" class="screen" ref="screenRef">
      <main-menu-screen :flowController="flowController" v-if="flowController.currentScreen.value === Screen.MainMenu"/>
      <game-screen :flowController="flowController" :inputController="inputController" v-if="flowController.currentScreen.value === Screen.Game"/>
      <credits-screen :flowController="flowController" v-if="flowController.currentScreen.value === Screen.Credits"/>
    </div>
  </div>
</template>

<style scoped>
</style>
