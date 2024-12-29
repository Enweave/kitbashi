<script setup lang="ts">
import { InputActions, InputController } from '../../game/InputController.ts';
import { defineProps, ref, watch } from 'vue';

const props = defineProps<{
  inputController: InputController;
  action: InputActions;
}>();

let listening = ref<boolean>(false);
let currentKeyCode = ref<string>(
  props.inputController.getKeyCode(props.action)
);

watch(props.inputController.newKeyBindListening, (action) => {
  if (action !== props.action) {
    listening.value = false;
  }
});

watch(props.inputController.lastKeyCodePressed, (keyCode) => {
  if (listening.value) {
    props.inputController.assignKey(props.action, keyCode);
    props.inputController.disarmNewKeyBindListening();
    listening.value = false;
  }

  currentKeyCode.value = props.inputController.getKeyCode(props.action);
});

const onAssignKey = () => {
  props.inputController.armNewKeyBindListening(props.action);
  listening.value = true;
};

const onResetKey = () => {
  props.inputController.resetKey(props.action);
  currentKeyCode.value = props.inputController.getKeyCode(props.action);
};

const onCancel = () => {
  props.inputController.disarmNewKeyBindListening();
  listening.value = false;
};
</script>

<template>
  <label>{{ action }}</label>
  <label>{{ currentKeyCode }}</label>
  <button v-show="!listening" @click="onAssignKey">
    Assign
  </button>
  <button v-show="!listening" @click="onResetKey">
    Reset
  </button>
  <label v-show="listening">
    Press a key to assign
  </label>
  <button v-show="listening" @click="onCancel">
    Cancel
  </button>
</template>

<style scoped></style>
