import { Ref, ref } from 'vue';
import { FlowController } from './FlowController.ts';

enum InputActions {
  left = 'left',
  right = 'right',
  up = 'up',
  down = 'down',
  fire = 'fire',
  special = 'special',
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

  constructor(inFlowController: FlowController) {
    this.keyCodeMap.set('KeyA', InputActions.left);
    this.keyCodeMap.set('KeyD', InputActions.right);
    this.keyCodeMap.set('KeyW', InputActions.up);
    this.keyCodeMap.set('KeyS', InputActions.down);
    this.keyCodeMap.set('KeyJ', InputActions.fire);
    this.keyCodeMap.set('KeyK', InputActions.special);
    this.keyCodeMap.set('Escape', InputActions.pause);

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

  isFiring(): boolean {
    return this.actionState.value.get(InputActions.fire) || false;
  }

  isSpecial(): boolean {
    return this.actionState.value.get(InputActions.special) || false;
  }
}
