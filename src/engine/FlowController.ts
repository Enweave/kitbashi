import { ref } from 'vue'

export const enum Screen {
    MainMenu,
    Game,
    Credits
}

export class FlowController {
    currentScreen = ref<Screen>(Screen.MainMenu);
    paused = ref(false);

    constructor() {
        console.log('FlowController created');
        this.currentScreen = ref(Screen.MainMenu);
        this.paused = ref(false);
    }

    startGame() {
        this.currentScreen.value = Screen.Game;
    }
    mainMenu() {
        this.currentScreen.value = Screen.MainMenu;
    }
    credits() {
        this.currentScreen.value = Screen.Credits;
    }

    togglePause() {
        this.paused.value = !this.paused.value;
    }
}