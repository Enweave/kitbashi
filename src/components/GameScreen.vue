<script setup lang="ts">
import {onMounted, onUnmounted, ref} from "vue";
import {defineProps} from 'vue';
import {FlowController} from "../engine/FlowController.ts";
import IngameMenu from "./IngameMenu.vue";
import {MainLoop} from "../engine/MainLoop.ts";
import {InputController} from "../engine/InputController.ts";
import {Scene} from "../engine/SceneController.ts";
import {Player} from "../engine/Actors/Player.ts";
import {Vector2} from "../engine/Utils.ts";
// import {VIEWPORT_WIDTH} from "../engine/Constants.ts";
// import {Actor} from "../engine/Actors/Base/ActorsBase.ts";
import {EnemyBase, EnemyRam, EnemyShooter} from "../engine/Actors/Enemies.ts";
import {VIEWPORT_WIDTH} from "../engine/Constants.ts";

const props = defineProps<{
  flowController: FlowController;
  inputController: InputController;
}>();

const viewportRef = ref<HTMLElement | null>(null);
const debugCanvasRef = ref<HTMLCanvasElement | null>(null);
let mainLoop: MainLoop;
let scene: Scene;

onMounted(() => {
  console.log('GameScreen mounted');
  mainLoop = new MainLoop(props.flowController);
  scene = new Scene(props.flowController, viewportRef.value!, debugCanvasRef.value!);

  scene.addActor(new Player(props.inputController), Player.initialSpawnPosition);
  scene.addActor(new EnemyRam(), {x: VIEWPORT_WIDTH, y: 100} as Vector2);
  scene.addActor(new EnemyShooter(), {x: VIEWPORT_WIDTH * 2, y: 200} as Vector2);


  mainLoop.addTask(scene);
  mainLoop.start();
})

onUnmounted(() => {
  mainLoop.stop();
  mainLoop = null as any;
  scene = null as any;
})
</script>

<template>
  <div class="viewport" ref="viewportRef">
    <div class="ingame-ui">
      <div class="score">Score: {{props.flowController.playerState.score.value }}</div>
      <div class="lives">Lives: {{props.flowController.playerState.lives.value - 1}}</div>
    </div>
    <canvas v-show="flowController.showDebugCanvas.value" class="debug-canvas" ref="debugCanvasRef"></canvas>
  </div>

  <ingame-menu :flowController="props.flowController"></ingame-menu>
</template>