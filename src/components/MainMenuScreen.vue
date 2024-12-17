<script setup lang="ts">
import {onMounted, ref} from "vue";
import { defineProps } from 'vue';
import {FlowController} from "../engine/FlowController.ts";

const menuRef = ref<HTMLElement | null>(null);

const props = defineProps<{
  flowController: FlowController;
}>();


onMounted(() => {
  menuRef.value?.querySelector('button')?.focus()
})

</script>

<template>
  <div class="menu-container" ref="menuRef">
    <h1>Here be main menu</h1>
    <button @click="props.flowController.startGame()">Start Game</button>
  </div>
</template>

<style scoped>
</style>
