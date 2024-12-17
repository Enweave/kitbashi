<script setup lang="ts">
import {onMounted, ref} from "vue";
import {defineProps} from 'vue';
import {FlowController} from "../engine/FlowController.ts";
import IngameMenu from "./IngameMenu.vue";
import {MainLoop} from "../engine/MainLoop.ts";

const props = defineProps<{
  flowController: FlowController;
}>();

const rootRef = ref<HTMLElement | null>(null);

onMounted(() => {
  const mainLoop = new MainLoop(props.flowController);
  mainLoop.start();
})
</script>

<template>
  <div class="root" ref="rootRef"></div>
  <ingame-menu :flowController="props.flowController"></ingame-menu>
</template>