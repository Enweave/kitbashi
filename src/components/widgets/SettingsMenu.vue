<script setup lang="ts">
import { FlowController } from '../../game/FlowController.ts';
import { InputController } from '../../game/InputController.ts';
import KeyBindingsMenu from './KeyBindingsMenu.vue';
import SoundLevelSlider from '../SoundComponents/SoundLevelSlider.vue';
import { ref } from 'vue';

enum TabTypes {
  TOUCH = 'Touch/Mobile',
  SOUND = 'Sound',
  KEY_BINDINGS = 'Keyboard',
}

const currentTab = ref<TabTypes>(TabTypes.TOUCH);

const props = defineProps({
  flowController: FlowController,
  inputController: InputController,
});

const isFullscreen = ref<boolean>(false);

const fullscreenToggle = () => {
  if (document.fullscreenElement) {
    document
      .exitFullscreen()
      .catch((err) => {
        console.error(err);
      })
      .then(() => {
        isFullscreen.value = false;
      });
  } else {
    document.documentElement
      .requestFullscreen()
      .catch((err) => {
        console.error(err);
      })
      .then(() => {
        isFullscreen.value = false;
      });
  }
};
</script>
<template>
  <h2 style="text-align: center">Settings</h2>
  <div class="tabz">
    <button
      class="kitbashi-button tab"
      :class="{ active: currentTab == tab }"
      v-for="tab in Object.values(TabTypes)"
      :key="tab"
      @click="currentTab = tab as TabTypes"
    >
      {{ tab }}
    </button>
  </div>
  <div v-if="currentTab == TabTypes.SOUND">
    <sound-level-slider
      title="SFX"
      v-model="props.flowController.sfxLevel"
      v-if="props.flowController"
    ></sound-level-slider>
    <sound-level-slider
      title="Music"
      v-model="props.flowController.musicLevel"
      v-if="props.flowController"
    ></sound-level-slider>
  </div>
  <div v-if="currentTab == TabTypes.KEY_BINDINGS">
    <key-bindings-menu
      v-if="props.inputController"
      :input-controller="props.inputController"
    ></key-bindings-menu>
  </div>
  <div v-if="currentTab == TabTypes.TOUCH">
    <div class="touch-settings">
      <label>On-screen controls</label>
      <button
        class="kitbashi-button"
        @click="props.inputController?.screenGamepad.toggleEnabled"
      >
        <span v-if="props.inputController?.screenGamepad.enabled.value"
          >Disable</span
        >
        <span v-else>Enable</span>
      </button>
      <label>Vertical adjustment</label>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        :value="props.inputController?.screenGamepad.offsetTop.value"
        @input="
          (e: Event) => {
            props.inputController?.screenGamepad.setOffsetTop(e.target);
          }
        "
      />
      <label>Horizontal adjustment</label>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        :value="props.inputController?.screenGamepad.separation.value"
        @input="
          (e: Event) => {
            props.inputController?.screenGamepad.setSeparation(e.target);
          }
        "
      />
      <label>Invert</label>
      <button
        class="kitbashi-button"
        @click="props.inputController?.screenGamepad.toggleReversed"
      >
        <span v-if="props.inputController?.screenGamepad.reversed.value"
          >Disable</span
        >
        <span v-else>Enable</span>
      </button>
      <label>Fullscreen</label>
      <button class="kitbashi-button" @click="fullscreenToggle">
        <span v-if="isFullscreen">Disable</span><span v-else>Enable</span>
      </button>
    </div>
  </div>
</template>

<style scoped lang="sass">
@use "../../assets/style/partials/variables" as v
.tabz
  display: grid
  grid-template-columns: repeat(3, 1fr)
  @media (max-width: v.$smol_screen_width)
    grid-template-columns: 1fr
  @container (width < #{v.$smol_screen_width})
    grid-template-columns: 1fr
.touch-settings
  display: grid
  grid-template-columns: repeat(2, 1fr)
  gap: v.$gutter
  align-items: baseline

button.kitbashi-button.tab
  background: transparent
  color: v.$color_a_light
  z-index: 1
  &:before
    content: ''
    position: absolute
    bottom: 0
    left: 0
    width: 100%
    height: 1px
    background-color: v.$color_b_dark
    transition: height 0.3s
    z-index: -1
  &.active
    &:after
      width: 0
    &:before
      height: 100%
</style>
