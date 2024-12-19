<script setup lang="ts">
import {onMounted, ref} from "vue";
import {defineProps} from 'vue';
import {FlowController} from "../engine/FlowController.ts";
import IngameMenu from "./IngameMenu.vue";
import {MainLoop} from "../engine/MainLoop.ts";
import {InputController} from "../engine/InputController.ts";
import {Scene} from "../engine/SceneController.ts";
import {Player} from "../engine/Actors/Player.ts";
import {Vector2} from "../engine/Utils.ts";
import {VIEWPORT_WIDTH} from "../engine/Constants.ts";
import {Actor} from "../engine/Actors/ActorsBase.ts";

const props = defineProps<{
  flowController: FlowController;
  inputController: InputController;
}>();

const viewportRef = ref<HTMLElement | null>(null);
const debugCanvasRef = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  const mainLoop = new MainLoop(props.flowController);
  const scene = new Scene(props.flowController, viewportRef.value!, debugCanvasRef.value!);

  scene.addActor(new Player(props.inputController), {x: VIEWPORT_WIDTH/2, y: VIEWPORT_WIDTH/2} as Vector2);
  scene.addActor(new Actor(), {x: 100, y: 100} as Vector2);


  mainLoop.addTask(scene);

  mainLoop.start();
})
</script>

<template>
  <div class="viewport" ref="viewportRef">
    <canvas v-show="flowController.showDebugCanvas.value" class="debug-canvas" ref="debugCanvasRef"></canvas>
  </div>

  <ingame-menu :flowController="props.flowController"></ingame-menu>
</template>