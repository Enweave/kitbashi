import { Ref, ref } from 'vue';
import { FlowController } from './FlowController.ts';

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

export class InputController {
  actionState: Ref<Map<InputActions, boolean>> = ref(new Map());

  newKeyBindListening: Ref<InputActions | null> = ref(null);
  lastKeyCodePressed: Ref<string> = ref('');
  lastErrorMessage: Ref<string> = ref('');
  private flowController: FlowController;
  private keyCodeMap: Map<string, InputActions> = new Map();

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

  constructor(inFlowController: FlowController) {
    this.initKeyCodeMap();

    this.flowController = inFlowController;

    window.addEventListener('keydown', (e) => {
      if (e.repeat) {
        return;
      }
      const action = this.keyCodeMap.get(e.code);
      if (action) {
        this.actionState.value.set(action, true);
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
      }
    });
  }

  getDirection(): MovementDirection {
    const direction: MovementDirection = { x: 0, y: 0 };

    direction.x += this.actionState.value.get(InputActions.left) ? -1 : 0;
    direction.x += this.actionState.value.get(InputActions.right) ? 1 : 0;
    direction.y += this.actionState.value.get(InputActions.up) ? -1 : 0;
    direction.y += this.actionState.value.get(InputActions.down) ? 1 : 0;

    return direction;
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
