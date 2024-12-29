<script setup lang="ts">
import { FlowController, Screen } from './game/FlowController.ts';
import MainMenuScreen from './components/MainMenuScreen.vue';
import GameScreen from './components/GameScreen.vue';
import { computed, onMounted, ref } from 'vue';
import { InputController, ScreenGamepad } from './game/InputController.ts';
import { ASPECT_RATIO } from './game/Constants.ts';
import { Vector2 } from './game/Utils.ts';
import EndgameScreen from './components/EndgameScreen.vue';
import { SoundController } from './game/SoundController.ts';
import SFXPlayerComponent from './components/SoundComponents/SFXPlayerComponent.vue';

const screenRef = ref<HTMLElement | null>(null);
const musicRef = ref<HTMLAudioElement | null>(null);
const onscreenJoystickRef = ref<HTMLElement | null>(null);
const onscreenButtonsRef = ref<HTMLElement | null>(null);

const soundController = new SoundController(musicRef);
const flowController = new FlowController(soundController);
const screenGamepad = new ScreenGamepad(
  onscreenJoystickRef,
  onscreenButtonsRef,
  flowController
);
const inputController = new InputController(flowController, screenGamepad);

const wrapperClass = computed(() => {
  return screenGamepad.reversed.value ? 'reversed' : 'normal';
});

let resizeScreen = function () {
  if (screenRef.value) {
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
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
  screenGamepad.postInit();
});
</script>

<template>
  <div class="wrapper" :class="wrapperClass">
    <div class="side side-l">
      <div
        v-show="screenGamepad.enabled.value"
        class="screen-gamepad-joystick"
        ref="onscreenJoystickRef"
      ></div>
    </div>
    <div id="container" class="container">
      <div id="screen" class="screen" ref="screenRef">
        <main-menu-screen
          :flowController="flowController"
          :inputController="inputController"
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
    </div>
    <div class="side side-r">
      <div v-show="screenGamepad.enabled.value" class="onscreen-menu-button">
        <button class="kitbashi-button" @click="flowController.togglePause()">
          <img src="./assets/burger-menu-svgrepo-com.svg" />
        </button>
      </div>
      <div
        v-show="screenGamepad.enabled.value"
        class="screen-gamepad-buttons"
        ref="onscreenButtonsRef"
      ></div>
    </div>
  </div>
  <div style="visibility: hidden">
    <audio ref="musicRef" style="display: none"></audio>
    <s-f-x-player-component
      v-for="player in soundController.sfxPlayers.value"
      :sfx-player="player"
    ></s-f-x-player-component>

    <!-- Dirty hack to preload all sprites <-->
    <!-- also, sup, Quinten! -->
    <div class="sprite player"></div>
    <div class="sprite boss"></div>
    <div class="sprite enemy-ram"></div>
    <div class="sprite enemy-shooter"></div>
    <div class="sprite enemy-sniper"></div>
    <div class="sprite enemy-mine"></div>
    <div class="sprite enemy-bomber"></div>
    <div class="sprite explosion"></div>
    <div class="viewport"></div>
  </div>
</template>

<style scoped></style>
