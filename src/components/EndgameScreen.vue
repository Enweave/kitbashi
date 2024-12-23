<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { defineProps } from 'vue';
import { FlowController } from '../game/FlowController.ts';

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
    <template v-if="flowController.gameWon.value">
      <h1>VICTORY!</h1>
      <button @click="props.flowController.mainMenu()">Main menu</button>
    </template>
    <template v-else>
      <h1>Game over</h1>
      <button @click="props.flowController.startGame()">Retry!</button>
      <button @click="props.flowController.mainMenu()">Main menu</button>
    </template>
  </div>
</template>
