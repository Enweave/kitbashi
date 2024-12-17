<script setup lang="ts">
import {onMounted} from "vue";
import {defineProps} from 'vue';
import {FlowController} from "../engine/FlowController.ts";
import IngameMenu from "./IngameMenu.vue";

const props = defineProps<{
  flowController: FlowController;
}>();

onMounted(() => {
  console.log('GameScreen mounted')
})
</script>

<template>
  <div class="root"></div>
  <ingame-menu :flowController="props.flowController"></ingame-menu>
</template>