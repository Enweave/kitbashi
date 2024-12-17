import { ref } from 'vue'

export const enum Screen {
    MainMenu,
    Game,
    Credits
}

export class FlowController {
    currentScreen = ref<Screen>(Screen.MainMenu);

    constructor() {
        console.log('FlowController created');
        this.currentScreen = ref(Screen.MainMenu);
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
}