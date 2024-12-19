import {Actor, EntityType} from "./ActorsBase.ts";
import {InputController} from "../InputController.ts";
import {Vector2} from "../Utils.ts";
import {ASPECT_RATIO, IVULNERABILITY_DURATION_MS, VIEWPORT_WIDTH} from "../Constants.ts";


export class Player extends Actor {
    input: InputController;
    entityType = EntityType.Player;

    LEFT_BOUND = this.radius;
    RIGHT_BOUND = VIEWPORT_WIDTH-this.radius;
    TOP_BOUND = this.radius;
    BOTTOM_BOUND = VIEWPORT_WIDTH/ASPECT_RATIO-this.radius;

    constructor(input: InputController) {
        super();
        this.input = input;
    }

    keepInBounds() {
        if(this._body.pos.x < this.LEFT_BOUND) {
            this._body.pos.x = this.LEFT_BOUND;
            this._currentVelocity.x = 0;
        }
        if(this._body.pos.x > this.RIGHT_BOUND) {
            this._body.pos.x = this.RIGHT_BOUND;
            this._currentVelocity.x = 0;
        }
        if(this._body.pos.y < this.TOP_BOUND) {
            this._body.pos.y = this.TOP_BOUND;
            this._currentVelocity.y = 0;
        }
        if(this._body.pos.y > this.BOTTOM_BOUND) {
            this._body.pos.y = this.BOTTOM_BOUND;
            this._currentVelocity.y = 0;
        }
    }

    tick(delta: number) {
        this.controllerDirection = this.input.getDirection() as Vector2;
        this.keepInBounds();
        super.tick(delta);
    }

    death() {
        super.death();
        this.sprite.htmlElement.classList.add('blink');
        this._isInvulnerable = true;
        if (this.flowController) {
            this.flowController.playerState.lives.value -= 1;
        }
        setTimeout(() => {
            this.reanimate();
            this._isInvulnerable = false;
            this.sprite.htmlElement.classList.remove('blink');
        }, IVULNERABILITY_DURATION_MS);
    }
}