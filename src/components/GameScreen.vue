<script setup lang="ts">
import {onMounted, onUnmounted, ref} from "vue";
import {defineProps} from 'vue';
import {FlowController} from "../game/FlowController.ts";
import IngameMenu from "./IngameMenu.vue";
import {MainLoop} from "../game/MainLoop.ts";
import {InputController} from "../game/InputController.ts";
import {Scene} from "../game/SceneController.ts";
import {Player} from "../game/Actors/Player.ts";
import {LevelSequencer} from "../game/LevelSequencer.ts";
import {LevelTestWin} from "../game/Levels/LevelTestWin.ts";
import {Vector2} from "../game/Utils.ts";
import {VIEWPORT_WIDTH} from "../game/Constants.ts";
import {EnemyRam, EnemyShooter} from "../game/Actors/Enemies.ts";

const props = defineProps<{
  flowController: FlowController;
  inputController: InputController;
}>();

const viewportRef = ref<HTMLElement | null>(null);
const debugCanvasRef = ref<HTMLCanvasElement | null>(null);
let mainLoop: MainLoop;
let scene: Scene;
let levelSequencer: LevelSequencer;

onMounted(() => {
  console.log('GameScreen mounted');
  mainLoop = new MainLoop(props.flowController);
  scene = new Scene(props.flowController, viewportRef.value!, debugCanvasRef.value!);

  scene.addActor(new Player(props.inputController), Player.initialSpawnPosition);

  levelSequencer = new LevelSequencer(
      props.flowController,
      scene,
      new LevelTestWin()
  );
  scene.addActor(new EnemyRam(), {x: VIEWPORT_WIDTH, y: 100} as Vector2);
  scene.addActor(new EnemyShooter(), {x: VIEWPORT_WIDTH, y: 200} as Vector2);

  mainLoop.addTask(scene);
  mainLoop.addTask(levelSequencer);
  mainLoop.start();
  levelSequencer.beginSequence();
})

onUnmounted(() => {
  mainLoop.stop();
  mainLoop = null as any;
  scene = null as any;
  levelSequencer = null as any;
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