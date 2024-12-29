import { Ref, ref, watch } from 'vue';
import { FlowController } from './FlowController.ts';
import { clamp, Vector2 } from './Utils.ts';
import {
  ButtonController,
  JoystickController,
} from 'on-screen-controllers';

export enum InputActions {
  left = 'left',
  right = 'right',
  up = 'up',
  down = 'down',
  fire = 'fire',
  pause = 'pause',
}

interface MovementDirection {
  x: number;
  y: number;
}

// type DpadDirection =
//   | 'center'
//   | 'up'
//   | 'down'
//   | 'left'
//   | 'right'
//   | 'up-right'
//   | 'down-right'
//   | 'up-left'
//   | 'down-left';

const OFFSET_TOP_STORAGE_KEY = 'screenGamepadOffsetTop';
const SEPARATION_STORAGE_KEY = 'screenGamepadSeparation';
const REVERSED_STORAGE_KEY = 'screenGamepadReversed';
const ENABLED_STORAGE_KEY = 'screenGamepadEnabled';

export class ScreenGamepad {
  offsetTop: Ref<number>;
  separation: Ref<number>;
  enabled: Ref<boolean> = ref(true);
  reversed: Ref<boolean>;
  joystickContainer: Ref<HTMLElement | null, HTMLElement | null>;
  buttonsContainer: Ref<HTMLElement | null, HTMLElement | null>;
  inputController: InputController | null;
  flowController: FlowController;

  constructor(
    joystickContainer: Ref<HTMLElement | null, HTMLElement | null>,
    buttonsContainer: Ref<HTMLElement | null, HTMLElement | null>,
    flowController: FlowController
  ) {
    this.offsetTop = ref(
      parseFloat(localStorage.getItem(OFFSET_TOP_STORAGE_KEY) || '0.5')
    );
    this.separation = ref(
      parseFloat(localStorage.getItem(SEPARATION_STORAGE_KEY) || '0.5')
    );
    this.enabled = ref(
      JSON.parse(localStorage.getItem(ENABLED_STORAGE_KEY) || 'true')
    );
    this.reversed = ref(
      JSON.parse(localStorage.getItem(REVERSED_STORAGE_KEY) || 'false')
    );
    this.joystickContainer = joystickContainer;
    this.buttonsContainer = buttonsContainer;
    this.inputController = null;

    watch(this.offsetTop, (value) => {
      this.updateOffsets();
      localStorage.setItem(OFFSET_TOP_STORAGE_KEY, value.toString());
    });

    watch(this.separation, (value) => {
      this.updateOffsets();
      localStorage.setItem(SEPARATION_STORAGE_KEY, value.toString());
    });

    watch(this.enabled, (value) => {
      localStorage.setItem(ENABLED_STORAGE_KEY, value.toString());
    });

    watch(this.reversed, (value) => {
      localStorage.setItem(REVERSED_STORAGE_KEY, value.toString());
    });

    this.updateOffsets();
    this.flowController = flowController;
  }

  updateOffsets() {
    document.body.style.setProperty(
      '--onscreen-vertical-adjustment',
      `${this.offsetTop.value * 100}%`
    );
    document.body.style.setProperty(
      '--onscreen-horizontal-adjustment',
      `${this.separation.value * 100}%`
    );
  }

  setInputController(controller: InputController) {
    this.inputController = controller;
  }

  postInit() {
    if (!this.inputController) {
      console.error('InputController not set');
      return;
    }

    new JoystickController({
      container: this.joystickContainer.value,
      top: '0%',
      left: '0%',
      color: '#9E1E00',
      thumbColor: '#f0f0f0',
      radius: 120,
      rotation: 0,
      onInputCallback: (x, y) => {
        this.inputController?.updateDirectionFromGamepad(x, -y);
      },
      // onPressCallback: (direction) => {
      //   let x = 0;
      //   let y = 0;
      //
      //   switch (direction as DpadDirection) {
      //     case 'up':
      //       y = -1;
      //       break;
      //     case 'down':
      //       y = 1;
      //       break;
      //     case 'left':
      //       x = -1;
      //       break;
      //     case 'right':
      //       x = 1;
      //       break;
      //     case 'up-right':
      //       x = 1;
      //       y = -1;
      //       break;
      //     case 'down-right':
      //       x = 1;
      //       y = 1;
      //       break;
      //     case 'up-left':
      //       x = -1;
      //       y = -1;
      //       break;
      //     case 'down-left':
      //       x = -1;
      //       y = 1;
      //       break;
      //     case 'center':
      //       x = 0;
      //       y = 0;
      //       break;
      //   }
      //
      //   this.inputController?.updateDirectionFromGamepad(x, y);
      // },
      onReleaseCallback: () => {
        this.inputController?.updateDirectionFromGamepad(0, 0);
      },
      verboseLogging: true,
    });

    new ButtonController({
      container: this.buttonsContainer.value,
      width: '100px',
      height: '100px',
      top: '0%',
      left: '0%',
      color: '#9E1E00',
      radius: 50,
      onPressCallback: () => {
        this.inputController?.setIsFiring(true);
      },
      onReleaseCallback: () => {
        this.inputController?.setIsFiring(false);
      },
      verboseLogging: true,
    });
  }

  toggleEnabled() {
    this.enabled.value = !this.enabled.value;
  }

  toggleReversed() {
    this.reversed.value = !this.reversed.value;
  }

  setOffsetTop(target: EventTarget | null) {
    if (target instanceof HTMLInputElement) {
      this.offsetTop.value = clamp(parseFloat(target.value), 0, 1);
    }
  }

  setSeparation(target: EventTarget | null) {
    if (target instanceof HTMLInputElement) {
      this.separation.value = clamp(parseFloat(target.value), 0, 1);
    }
  }
}

export class InputController {
  actionState: Ref<Map<InputActions, boolean>> = ref(new Map());

  newKeyBindListening: Ref<InputActions | null> = ref(null);
  lastKeyCodePressed: Ref<string> = ref('');
  lastErrorMessage: Ref<string> = ref('');
  screenGamepad: ScreenGamepad;
  private flowController: FlowController;
  private keyCodeMap: Map<string, InputActions> = new Map();
  private direction: Vector2 = new Vector2(0, 0);

  private initKeyCodeMap() {
    for (const action of Object.values(InputActions)) {
      this.keyCodeMap.set(this.getCodeFromStorageOrDefault(action), action);
    }
  }

  private clearKeyCodesForAction(action: InputActions) {
    for (const [key, value] of this.keyCodeMap) {
      if (value === action) {
        this.keyCodeMap.delete(key);
      }
    }
  }

  private getCodeFromStorageOrDefault(action: InputActions): string {
    const storedKey = localStorage.getItem(action);
    if (storedKey) {
      return storedKey;
    }
    return this.DEFAULT_BINDINGS[action];
  }
  private setCodeToStorage(action: InputActions) {
    const storedKey = this.getKeyCode(action);
    localStorage.setItem(action, storedKey);
  }

  private DEFAULT_BINDINGS = {
    [InputActions.left]: 'KeyA',
    [InputActions.right]: 'KeyD',
    [InputActions.up]: 'KeyW',
    [InputActions.down]: 'KeyS',
    [InputActions.fire]: 'KeyJ',
    [InputActions.pause]: 'Escape',
  };

  private updateDirectionFromKeyboard() {
    this.direction.x = 0;
    this.direction.y = 0;

    this.direction.x += this.actionState.value.get(InputActions.left) ? -1 : 0;
    this.direction.x += this.actionState.value.get(InputActions.right) ? 1 : 0;
    this.direction.y += this.actionState.value.get(InputActions.up) ? -1 : 0;
    this.direction.y += this.actionState.value.get(InputActions.down) ? 1 : 0;
  }

  updateDirectionFromGamepad(x: number, y: number) {
    this.direction.x = clamp(x, -1, 1);
    this.direction.y = clamp(y, -1, 1);
  }

  setIsFiring(firing: boolean) {
    this.actionState.value.set(InputActions.fire, firing);
  }

  constructor(inFlowController: FlowController, screenGamepad: ScreenGamepad) {
    this.initKeyCodeMap();

    this.flowController = inFlowController;

    window.addEventListener('keydown', (e) => {
      if (e.repeat) {
        return;
      }
      const action = this.keyCodeMap.get(e.code);
      if (action) {
        this.actionState.value.set(action, true);
        this.updateDirectionFromKeyboard();
        if (action === InputActions.pause) {
          this.flowController.togglePause();
        }
      }

      this.lastKeyCodePressed.value = e.code;
    });

    window.addEventListener('keyup', (e) => {
      const action = this.keyCodeMap.get(e.code);
      if (action) {
        this.actionState.value.set(action, false);
        this.updateDirectionFromKeyboard();
      }
    });

    this.screenGamepad = screenGamepad;
    this.screenGamepad.setInputController(this);
  }

  getDirection(): MovementDirection {
    return this.direction;
  }

  resetBindings() {
    for (const [action, key] of Object.entries(this.DEFAULT_BINDINGS)) {
      this.clearKeyCodesForAction(action as InputActions);
      this.assignKey(action as InputActions, key);
    }

    this.lastKeyCodePressed.value = '';
  }

  isFiring(): boolean {
    return this.actionState.value.get(InputActions.fire) || false;
  }

  getKeyCode(action: InputActions): string {
    for (const [key, value] of this.keyCodeMap) {
      if (value === action) {
        return key;
      }
    }

    return '<none>';
  }

  /* assigns a new keyCode to action and stores it in local storage
   * returns a boolean if successful
   * */
  assignKey(action: InputActions, keyCode: string): boolean {
    // check if the key is already assigned
    if (this.keyCodeMap.has(keyCode)) {
      this.lastErrorMessage.value = `"${keyCode}" is already assigned to "${this.keyCodeMap.get(keyCode)}"`;
      return false;
    }

    this.clearKeyCodesForAction(action);
    this.keyCodeMap.set(keyCode, action);
    this.setCodeToStorage(action);
    this.lastErrorMessage.value = '';
    return true;
  }

  resetKey(action: InputActions) {
    this.clearKeyCodesForAction(action);
    this.keyCodeMap.set(this.DEFAULT_BINDINGS[action], action);
    this.setCodeToStorage(action);
  }

  armNewKeyBindListening(value: InputActions) {
    this.newKeyBindListening.value = value;
  }

  disarmNewKeyBindListening() {
    this.newKeyBindListening.value = null;
  }
}
