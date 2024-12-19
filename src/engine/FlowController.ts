import {ref} from 'vue'
import {Vector2} from "./Utils.ts";

export const enum Screen {
    MainMenu,
    Game,
    Credits
}

export class FlowController {
    currentScreen = ref<Screen>(Screen.MainMenu);
    viewportContainerSize = ref<Vector2>(new Vector2(0, 0));
    paused = ref(false);

    constructor() {
        this.currentScreen = ref(Screen.MainMenu);
        this.paused = ref(false);
    }

    startGame() {
        this.paused.value = false;
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