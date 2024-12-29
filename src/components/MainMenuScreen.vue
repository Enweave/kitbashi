<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { defineProps } from 'vue';
import { FlowController } from '../game/FlowController.ts';
import { InputController } from '../game/InputController.ts';
import SettingsMenu from './widgets/SettingsMenu.vue';

const menuRef = ref<HTMLElement | null>(null);

const props = defineProps<{
  flowController: FlowController;
  inputController: InputController;
}>();

onMounted(() => {
  menuRef.value?.querySelector('button')?.focus();
});
</script>

<template>
  <div class="menu-container" ref="menuRef">
    <div class="menu-head">
      <h1>Kitbashi!</h1>
      <button class="kitbashi-button" @click="props.flowController.startGame()">Start Game</button>
    </div>
    <settings-menu
      :flow-controller="props.flowController"
      :input-controller="props.inputController"
    >
    </settings-menu>
  </div>
</template>
