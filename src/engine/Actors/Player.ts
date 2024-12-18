import {Actor} from "./ActorsBase.ts";
import {InputController} from "../InputController.ts";


export class Player extends Actor {
    input: InputController;
    constructor(input: InputController) {
        super();
        this.input = input;
    }

    updateVelocity(delta: number) {
        const direction = this.input.getDirection();
        this.currentVelocity.x += direction.x * this.acceleration;
        this.currentVelocity.y += direction.y * this.acceleration;
        super.updateVelocity(delta);
    }
}