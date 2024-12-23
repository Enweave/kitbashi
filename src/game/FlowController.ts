import { Ref, ref, watch } from 'vue';
import {clamp, Vector2} from './Utils.ts';
import { Actor } from './Actors/Base/ActorsBase.ts';
import { SoundController } from './SoundController.ts';
import {EXTRA_LIFE_COST, MAX_UPGRADE_INDEX, UPGRADE_COST} from "./Constants.ts";
import {Player} from "./Actors/Player.ts";

export const enum Screen {
  MainMenu,
  Game,
  EndGame,
}

export class PlayerState {
  playerActor: Player | null = null;
  score = ref<number>(0);
  lives = ref<number>(3);
  weaponGrade = ref<number>(0);

  _upgradeScoreBudget = 0;
  _extraLifeBudget = 0;

  reset() {
    this.score.value = 0;
    this.lives.value = 3;
    this.weaponGrade.value = 0;
    this.playerActor = null;
    this._upgradeScoreBudget = 0;
    this._extraLifeBudget = 0;
  }
}

enum StoreKeys {
  showDebugCanvas = 'showDebugCanvas',
  sfxLevel = 'sfxLevel',
  musicLevel = 'musicLevel',
}

export class FlowController {
  currentScreen = ref<Screen>(Screen.MainMenu);
  screenRef: Ref<HTMLElement | null, HTMLElement | null> = ref(null);
  viewportContainerSize = ref<Vector2>(new Vector2(0, 0));

  playerState = new PlayerState();

  paused = ref(false);
  gameWon = ref(false);

  showDebugCanvas = ref<boolean>(
    JSON.parse(localStorage.getItem(StoreKeys.showDebugCanvas) || 'false')
  );
  soundController: SoundController | null = null;
  sfxLevel = ref<number>(
    JSON.parse(localStorage.getItem(StoreKeys.sfxLevel) || '0.5')
  );
  musicLevel = ref<number>(
    JSON.parse(localStorage.getItem(StoreKeys.musicLevel) || '0.5')
  );

  _spawnActorQueue: Actor[] = [];

  constructor(soundController: SoundController) {
    this.soundController = soundController;
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

    watch(this.playerState.lives, (newValue, oldValue) => {
      if (newValue < oldValue) {
        this.onLifeLost();
      }
      if (newValue <= 0) {
        this.loseGame();
      }
    });
  }

  onLifeLost() {
    const el = this.screenRef.value;
    if (el) {
      el.style.animation = 'none';
      requestAnimationFrame(function () {
        el.style.animation = 'camera-shake 0.8s';
      });
    }
    const weaponGrade = clamp(this.playerState.weaponGrade.value - 1, 0, MAX_UPGRADE_INDEX)
    this.playerState.weaponGrade.value = weaponGrade;
    this.getPlayerActor()?.setWeaponGrade(weaponGrade);
  }

  startGame() {
    this.paused.value = false;
    this.currentScreen.value = Screen.Game;
    this.playerState.reset();
    this._spawnActorQueue = [];
  }

  addScore(score: number) {
    this.playerState.score.value += score;
    this.playerState._upgradeScoreBudget += score;
    this.playerState._extraLifeBudget += score;

    if (this.playerState._upgradeScoreBudget >= UPGRADE_COST) {

      const numUpgrades = Math.floor(this.playerState._upgradeScoreBudget / UPGRADE_COST);
      if (this.playerState.weaponGrade.value + numUpgrades < MAX_UPGRADE_INDEX) {
        this.playerState.weaponGrade.value += numUpgrades;
        this.playerState._upgradeScoreBudget -= UPGRADE_COST;
        this.getPlayerActor()?.setWeaponGrade(this.playerState.weaponGrade.value);
      }
    }

    if (this.playerState._extraLifeBudget >= EXTRA_LIFE_COST) {
      const numExtraLives = Math.floor(this.playerState._extraLifeBudget / EXTRA_LIFE_COST);
      this.playerState.lives.value += numExtraLives;
      this.playerState._extraLifeBudget -= EXTRA_LIFE_COST;
    }
  }

  setPlayerActor(actor: Player) {
    this.playerState.playerActor = actor;
  }

  getPlayerActor(): Player | null {
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

  setScreenRef(screenRef: Ref<HTMLElement | null, HTMLElement | null>) {
    this.screenRef = screenRef;
  }
}
