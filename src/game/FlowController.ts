import {ref, watch} from 'vue'
import {Vector2} from "./Utils.ts";
import {Actor} from "./Actors/Base/ActorsBase.ts";
import {SoundController} from "./SoundController.ts";

export const enum Screen {
    MainMenu,
    Game,
    EndGame
}

export class PlayerState {
    playerActor: Actor | null = null;
    score = ref<number>(0);
    lives = ref<number>(3);
    weaponGrade = ref<number>(1);

    reset() {
        this.score.value = 0;
        this.lives.value = 3;
        this.weaponGrade.value = 1;
        this.playerActor = null;
    }
}

enum StoreKeys {
    showDebugCanvas = 'showDebugCanvas',
    sfxLevel = 'sfxLevel',
    musicLevel = 'musicLevel',
}


export class FlowController {
    currentScreen = ref<Screen>(Screen.MainMenu);
    viewportContainerSize = ref<Vector2>(new Vector2(0, 0));

    playerState = new PlayerState();

    paused = ref(false);
    gameWon = ref(false);

    showDebugCanvas = ref<boolean>(JSON.parse(localStorage.getItem(StoreKeys.showDebugCanvas) || 'false'));
    soundController: SoundController | null = null;
    sfxLevel = ref<number>(JSON.parse(localStorage.getItem(StoreKeys.sfxLevel) || '0.1'));
    musicLevel = ref<number>(JSON.parse(localStorage.getItem(StoreKeys.musicLevel) || '1'));

    _spawnActorQueue: Actor[] = [];

    constructor(soundController: SoundController) {
        this.soundController = soundController;
        this.currentScreen = ref(Screen.MainMenu);
        this.paused = ref(false);


        this.soundController.setSFXLevel(this.sfxLevel.value);
        this.soundController.setMusicLevel(this.musicLevel.value);

        watch(this.showDebugCanvas, (newValue) => {
            localStorage.setItem(StoreKeys.showDebugCanvas, JSON.stringify(newValue));
        });

        watch(this.sfxLevel, (newValue) => {
            localStorage.setItem(StoreKeys.sfxLevel, JSON.stringify(newValue));
            this.soundController?.setSFXLevel(newValue);
        });

        watch(this.musicLevel, (newValue) => {
            localStorage.setItem(StoreKeys.musicLevel, JSON.stringify(newValue));
            this.soundController?.setMusicLevel(newValue);
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

    addScore(score: number) {
        this.playerState.score.value += score;
    }

    setPlayerActor(actor: Actor) {
        this.playerState.playerActor = actor;
    }

    getPlayerActor(): Actor | null {
        return this.playerState.playerActor;
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