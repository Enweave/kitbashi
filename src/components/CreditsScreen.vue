<script setup lang="ts">
import {onMounted, ref} from "vue";
import {defineProps} from 'vue';
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
    <h1>Credits go here</h1>
    <button @click="props.flowController.mainMenu()">Main menu</button>
  </div>
</template>

<style scoped>
</style>
