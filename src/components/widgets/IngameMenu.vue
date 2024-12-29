<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { defineProps } from 'vue';
import { FlowController } from '../../game/FlowController.ts';
import SoundLevelSlider from '../SoundComponents/SoundLevelSlider.vue';
import KeyBindingsMenu from './KeyBindingsMenu.vue';
import { InputController } from '../../game/InputController.ts';

const props = defineProps<{
  flowController: FlowController;
  inputController: InputController;
}>();
const menuRef = ref<HTMLElement | null>(null);
const menuClass = computed(() => {
  return props.flowController.paused.value
    ? 'ingame-menu active'
    : 'ingame-menu';
});

watch(props.flowController.paused, (paused) => {
  if (paused) {
    window.setTimeout(() => {
      menuRef.value?.querySelector('button')?.focus();
    }, 10);
  }
});
</script>

<template>
  <div :class="menuClass" ref="menuRef">
    <div class="menu-container">
      <h1>Pause</h1>
      <button @click="props.flowController.mainMenu()">Main menu</button>
      <sound-level-slider
        title="SFX"
        v-model="flowController.sfxLevel"
      ></sound-level-slider>
      <sound-level-slider
        title="Music"
        v-model="flowController.musicLevel"
      ></sound-level-slider>
      <key-bindings-menu
        :input-controller="props.inputController"
      ></key-bindings-menu>
    </div>
  </div>
</template>
