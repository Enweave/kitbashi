import {Ref, ref} from "vue";
import {FlowController} from "./FlowController.ts";

enum InputActions {
    left = 'left',
    right = 'right',
    up = 'up',
    down = 'down',
    fire = 'fire',
    special = 'special',
    pause = 'pause'
}

interface MovementDirection {
    x: number;
    y: number;
}

export class InputController {
    keyState: Ref<Map<InputActions, boolean>> = ref(new Map());
    private flowController: FlowController;
    private keyMap: Map<string, InputActions> = new Map();

    constructor(inFlowController: FlowController) {
        this.keyMap.set('a', InputActions.left);
        this.keyMap.set('d', InputActions.right);
        this.keyMap.set('w', InputActions.up);
        this.keyMap.set('s', InputActions.down);
        this.keyMap.set('j', InputActions.fire);
        this.keyMap.set('k', InputActions.special);
        this.keyMap.set('Escape', InputActions.pause);

        this.flowController = inFlowController;

        window.addEventListener('keydown', (e) => {
            if (e.repeat) {
                return;
            }
            const action = this.keyMap.get(e.key);
            if (action) {
                this.keyState.value.set(action, true);
                if (action === InputActions.pause) {
                    this.flowController.togglePause();
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            const action = this.keyMap.get(e.key);
            if (action) {
                this.keyState.value.set(action, false);
            }
        });


    }

    getDirection(): MovementDirection {
        let direction: MovementDirection = {x: 0, y: 0};

        direction.x += this.keyState.value.get(InputActions.left) ? -1 : 0;
        direction.x += this.keyState.value.get(InputActions.down) ? 1 : 0;
        direction.y += this.keyState.value.get(InputActions.down) ? -1 : 0;
        direction.y += this.keyState.value.get(InputActions.up) ? 1 : 0;

        return direction;
    }

    isFire(): boolean {
        return this.keyState.value.get(InputActions.fire) || false;
    }

    isSpecial(): boolean {
        return this.keyState.value.get(InputActions.special) || false;
    }
}