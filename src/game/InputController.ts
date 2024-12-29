import { Ref, ref } from 'vue';
import { FlowController } from './FlowController.ts';

enum InputActions {
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
  private flowController: FlowController;
  private keyCodeMap: Map<string, InputActions> = new Map();

  DEFAULT_BINDINGS = {
    [InputActions.left]: 'KeyA',
    [InputActions.right]: 'KeyD',
    [InputActions.up]: 'KeyW',
    [InputActions.down]: 'KeyS',
    [InputActions.fire]: 'KeyJ',
    [InputActions.pause]: 'Escape',
  };

  constructor(inFlowController: FlowController) {
    this.resetBindings();

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
      this.keyCodeMap.set(key, action as InputActions);
    }
  }

  isFiring(): boolean {
    return this.actionState.value.get(InputActions.fire) || false;
  }

  assignKey(action: InputActions, key: string) {
    this.keyCodeMap.set(key, action);
  }

  resetKey(action: InputActions) {
    this.keyCodeMap.delete(this.DEFAULT_BINDINGS[action]);
  }
}
