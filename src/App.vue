<script setup lang="ts">

import {FlowController, Screen} from "./engine/FlowController.ts";
import MainMenuScreen from "./components/MainMenuScreen.vue";
import GameScreen from "./components/GameScreen.vue";
import CreditsScreen from "./components/CreditsScreen.vue";

const flowController = new FlowController();

</script>

<template>
  <div class="container">
    <main-menu-screen :flowController="flowController" v-if="flowController.currentScreen.value === Screen.MainMenu"/>
    <game-screen :flowController="flowController" v-if="flowController.currentScreen.value === Screen.Game"/>
    <credits-screen :flowController="flowController" v-if="flowController.currentScreen.value === Screen.Credits"/>
  </div>

</template>

<style scoped>
</style>
