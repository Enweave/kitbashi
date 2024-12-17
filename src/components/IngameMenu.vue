<script setup lang="ts">
import {computed, ref, watch} from "vue";
import {defineProps} from 'vue';
import {FlowController} from "../engine/FlowController.ts";

const props = defineProps<{
  flowController: FlowController;
}>();
const menuRef = ref<HTMLElement | null>(null);
const menuClass = computed(() => {
  return props.flowController.paused.value ? 'ingame-menu active' : 'ingame-menu';
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
    </div>
  </div>
</template>

<style scoped>
</style>
