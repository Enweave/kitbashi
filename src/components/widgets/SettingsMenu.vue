<script setup lang="ts">
import { FlowController } from '../../game/FlowController.ts';
import { InputController } from '../../game/InputController.ts';
import KeyBindingsMenu from './KeyBindingsMenu.vue';
import SoundLevelSlider from '../SoundComponents/SoundLevelSlider.vue';
import { ref } from 'vue';

enum TabTypes {
  SOUND = 'Sound',
  KEY_BINDINGS = 'Controls',
}

const currentTab = ref<TabTypes>(TabTypes.SOUND);

const props = defineProps({
  flowController: FlowController,
  inputController: InputController,
});
</script>

<template>
  <div>
    <button
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
</template>

<style scoped></style>
