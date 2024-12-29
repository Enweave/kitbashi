<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { defineProps } from 'vue';
import { FlowController } from '../../game/FlowController.ts';
import { InputController } from '../../game/InputController.ts';
import SettingsMenu from './SettingsMenu.vue';

const props = defineProps<{
  flowController: FlowController;
  inputController: InputController;
}>();
const menuRef = ref<HTMLElement | null>(null);
const menuClass = computed(() => {
  return props.flowController.paused.value
    ? 'ingame-menu active'
    : 'ingame-menu';
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
      <div class="menu-head">
        <h1>Pause</h1>
        <button @click="props.flowController.mainMenu()">Main menu</button>
      </div>
      <settings-menu
        :flow-controller="props.flowController"
        :input-controller="props.inputController"
      >
      </settings-menu>
    </div>
  </div>
</template>
