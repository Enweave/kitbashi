import {ref, watch} from 'vue'
import {Vector2} from "./Utils.ts";
import {Actor} from "./Actors/ActorsBase.ts";

export const enum Screen {
    MainMenu,
    Game,
    EndGame
}

export class PlayerState {
    score = ref<number>(0);
    lives = ref<number>(3);
    weaponGrade = ref<number>(1);

    reset() {
        this.score.value = 0;
        this.lives.value = 3;
        this.weaponGrade.value = 1;
    }
}

export class FlowController {
    currentScreen = ref<Screen>(Screen.MainMenu);
    viewportContainerSize = ref<Vector2>(new Vector2(0, 0));

    playerState = new PlayerState();

    paused = ref(false);
    gameWon = ref(false);

    showDebugCanvas = ref<boolean>(JSON.parse(localStorage.getItem('showDebugCanvas') || 'false'));

    _spawnActorQueue: Actor[] = [];

    constructor() {
        this.currentScreen = ref(Screen.MainMenu);
        this.paused = ref(false);

        watch(this.showDebugCanvas, (newValue) => {
            localStorage.setItem('showDebugCanvas', JSON.stringify(newValue));
        });

        watch(this.playerState.lives, (newValue) => {
            if (newValue <= 0) {
                this.loseGame();
            }
        });
    }

    startGame() {
        this.paused.value = false;
        this.currentScreen.value = Screen.Game;
        this.playerState.reset();
        this._spawnActorQueue = [];
    }

    mainMenu() {
        this.currentScreen.value = Screen.MainMenu;
    }

    winGame() {
        this.paused.value = true;
        this.gameWon.value = true;
        this.currentScreen.value = Screen.EndGame;
    }

    loseGame() {
        this.paused.value = true;
        this.gameWon.value = false;
        this.currentScreen.value = Screen.EndGame;
    }

    togglePause() {
        this.paused.value = !this.paused.value;
    }
}