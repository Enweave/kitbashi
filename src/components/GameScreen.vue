<script setup lang="ts">
import {onMounted, ref} from "vue";
import {defineProps} from 'vue';
import {FlowController} from "../engine/FlowController.ts";
import IngameMenu from "./IngameMenu.vue";
import {MainLoop, Task} from "../engine/MainLoop.ts";
import {Actor, Scene} from "../engine/Actors/ActorsBase.ts";
import {Player} from "../engine/Actors/Player.ts";
import {InputController} from "../engine/InputController.ts";

const props = defineProps<{
  flowController: FlowController;
  inputController: InputController;
}>();

const rootRef = ref<HTMLElement | null>(null);

onMounted(() => {
  const mainLoop = new MainLoop(props.flowController);
  const scene = new Scene(rootRef.value!);

  scene.addActor(new Player(props.inputController), {x: 500, y: 500});

  const updateSceneTask = {
    update: (delta) => {
      scene.update(delta);
    }
  } as Task;

  mainLoop.addTask(updateSceneTask);

  mainLoop.start();
})
</script>

<template>
  <div class="root" ref="rootRef"></div>
  <ingame-menu :flowController="props.flowController"></ingame-menu>
</template>