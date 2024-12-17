<script setup lang="ts">
import {onMounted} from "vue";
import {defineProps} from 'vue';
import {FlowController} from "../engine/FlowController.ts";

const props = defineProps<{
  flowController: FlowController;
}>();


onMounted(() => {
  console.log('Credits mounted')
})

</script>

<template>
  <div class="menu-container">
    <h1>Credits go here</h1>
    <button @click="props.flowController.mainMenu()">Main menu</button>
  </div>
</template>

<style scoped>
</style>
