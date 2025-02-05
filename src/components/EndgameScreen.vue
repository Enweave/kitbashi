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
      <div class="menu-head">
        <h1>VICTORY!</h1>
        <h2>TOTAL SCORE: {{ flowController.playerState.score }}</h2>
        <h2>HIGHEST SCORE: {{ flowController.playerState.highScore }} <span v-if="flowController.playerState.newRecord.value">(new record)</span></h2>
      </div>
      <button class="kitbashi-button" @click="props.flowController.mainMenu()">
        Main menu
      </button>
    </template>
    <template v-else>
      <div class="menu-head">
        <h1>Game over</h1>
      </div>
      <button class="kitbashi-button" @click="props.flowController.startGame()">
        Retry!
      </button>
      <button class="kitbashi-button" @click="props.flowController.mainMenu()">
        Main menu
      </button>
    </template>
  </div>
</template>
