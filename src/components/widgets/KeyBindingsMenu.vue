<script setup lang="ts">
import { defineProps } from 'vue';
import { InputActions, InputController } from '../../game/InputController.ts';
import AssignableKeyWidget from './AssignableKeyWidget.vue';

const props = defineProps<{
  inputController: InputController;
}>();
</script>

<template>
  <div class="keybind-menu" v-if="props.inputController">
    <p
      v-if="props.inputController.lastErrorMessage.value.length > 0"
      class="error"
    >
      {{ inputController.lastErrorMessage }}
    </p>
    <div class="keybind-grid">
      <assignable-key-widget
        v-for="action in Object.values(InputActions)"
        :key="action"
        :input-controller="props.inputController"
        :action="action"
      ></assignable-key-widget>
    </div>
    <button class="kitbashi-button" @click="props.inputController.resetBindings">Reset bindings</button>
  </div>
</template>

<style scoped></style>
