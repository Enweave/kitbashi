<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { defineProps } from 'vue';
import { FlowController } from '../game/FlowController.ts';
import SoundLevelSlider from './SoundComponents/SoundLevelSlider.vue';

const menuRef = ref<HTMLElement | null>(null);

const props = defineProps<{
  flowController: FlowController;
}>();

onMounted(() => {
  menuRef.value?.querySelector('button')?.focus();
});
</script>

<template>
  <div class="menu-container" ref="menuRef">
    <h1>Kitbashi!</h1>
    <button @click="props.flowController.startGame()">Start Game</button>
    <sound-level-slider
      title="SFX"
      v-model="flowController.sfxLevel"
    ></sound-level-slider>
    <sound-level-slider
        title="Music"
        v-model="flowController.musicLevel"
    ></sound-level-slider>
  </div>
</template>
