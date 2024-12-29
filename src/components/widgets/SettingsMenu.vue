<script setup lang="ts">
import { FlowController } from '../../game/FlowController.ts';
import { InputController } from '../../game/InputController.ts';
import KeyBindingsMenu from './KeyBindingsMenu.vue';
import SoundLevelSlider from '../SoundComponents/SoundLevelSlider.vue';
import { ref } from 'vue';

enum TabTypes {
  SOUND = 'Sound',
  KEY_BINDINGS = 'Keyboard',
  TOUCH = 'Touch/Mobile',
}

const currentTab = ref<TabTypes>(TabTypes.SOUND);

const props = defineProps({
  flowController: FlowController,
  inputController: InputController,
});
</script>

<template>
  <h2 style="text-align: center">Settings</h2>
  <div class="tabz">
    <button class="kitbashi-button" :class="{ active: currentTab == tab }"
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
    <p>Coming soon...</p>
  </div>
</template>

<style scoped lang="sass">
@use "../../assets/style/partials/variables" as v
.tabz
  display: grid
  grid-template-columns: repeat(3, 1fr)
  @media (max-width: v.$smol_screen_width)
    grid-template-columns: 1fr

button.kitbashi-button
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
