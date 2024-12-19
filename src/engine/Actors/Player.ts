import {Actor} from "./ActorsBase.ts";
import {InputController} from "../InputController.ts";
import {Vector2} from "../Utils.ts";


export class Player extends Actor {
    input: InputController;

    constructor(input: InputController) {
        super();
        this.input = input;
    }

    tick(delta: number) {
        this.controllerDirection = this.input.getDirection() as Vector2;
        super.tick(delta);
    }
}