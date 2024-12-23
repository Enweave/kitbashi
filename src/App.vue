<script setup lang="ts">
import { FlowController, Screen } from './game/FlowController.ts';
import MainMenuScreen from './components/MainMenuScreen.vue';
import GameScreen from './components/GameScreen.vue';
import { onMounted, ref } from 'vue';
import { InputController } from './game/InputController.ts';
import { ASPECT_RATIO } from './game/Constants.ts';
import { Vector2 } from './game/Utils.ts';
import EndgameScreen from './components/EndgameScreen.vue';
import { SoundController } from './game/SoundController.ts';
import SFXPlayerComponent from './components/SoundComponents/SFXPlayerComponent.vue';

const containerRef = ref<HTMLElement | null>(null);
const screenRef = ref<HTMLElement | null>(null);

const soundController = new SoundController();
const flowController = new FlowController(soundController);
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

    flowController.viewportContainerSize.value = new Vector2(
      resultWidth,
      resultHeight
    );
  }
};

onMounted(() => {
  resizeScreen();
  window.addEventListener('resize', () => {
    resizeScreen();
  });

  window.addEventListener('orientationchange', () => {
    resizeScreen();
  });

  flowController.setScreenRef(screenRef);
});
</script>

<template>
  <div id="container" class="container" ref="containerRef">
    <div id="screen" class="screen" ref="screenRef">
      <main-menu-screen
        :flowController="flowController"
        v-if="flowController.currentScreen.value === Screen.MainMenu"
      />
      <game-screen
        :flowController="flowController"
        :inputController="inputController"
        v-if="flowController.currentScreen.value === Screen.Game"
      />
      <endgame-screen
        :flowController="flowController"
        v-if="flowController.currentScreen.value === Screen.EndGame"
      />
    </div>
    <s-f-x-player-component
      v-for="player in soundController.sfxPlayers.value"
      :sfx-player="player"
    ></s-f-x-player-component>
  </div>
  <div style="visibility: hidden">
    <!-- Dirty hack to preload all sprites <-->
    <!-- also, sup, Quinten! -->
    <div class="sprite player"></div>
    <div class="sprite boss"></div>
    <div class="sprite enemy-ram"></div>
    <div class="sprite enemy-shooter"></div>
    <div class="sprite enemy-sniper"></div>
    <div class="sprite enemy-mine"></div>
    <div class="sprite enemy-bomber"></div>
  </div>
</template>

<style scoped></style>
