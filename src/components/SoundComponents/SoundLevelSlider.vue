<script setup lang="ts">
const model = defineModel();

import { defineProps, onMounted, ref, watch } from 'vue';
const props = defineProps<{
  title: string;
}>();

const sliderValue = ref(0);

onMounted(() => {
  let v = model.value as { value: number };
  sliderValue.value = v.value;

  watch(sliderValue, (value) => {
    v.value = value;
  });
});
</script>

<template>
  <div class="sound-level-slider">
    <label>{{ props.title }}</label>
    <input type="range" min="0" max="1" step="0.1" v-model="sliderValue" />
  </div>
</template>

<style scoped></style>
