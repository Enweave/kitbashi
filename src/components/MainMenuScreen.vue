<script setup lang="ts">
import {onMounted} from "vue";
import { defineProps } from 'vue';
import {FlowController} from "../engine/FlowController.ts";

const props = defineProps<{
  flowController: FlowController;
}>();


onMounted(() => {
  console.log('Main mounted')
})

</script>

<template>
  <div class="menu-container">
    <h1>Here be main menu</h1>
    <button @click="props.flowController.startGame()">Start Game</button>
  </div>
</template>

<style scoped>
</style>
