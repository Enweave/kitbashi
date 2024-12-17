<script setup lang="ts">
import {onMounted} from "vue";
import {defineProps} from 'vue';
import {FlowController} from "../engine/FlowController.ts";

const props = defineProps<{
  flowController: FlowController;
}>();

onMounted(() => {
  console.log('GameScreen mounted')
})
</script>

<template>
  <div class="menu-container">
    <h1>Here be game</h1>
    <button @click="props.flowController.mainMenu()">Main menu</button>
    <button @click="props.flowController.credits()">Credits</button>
  </div>
</template>