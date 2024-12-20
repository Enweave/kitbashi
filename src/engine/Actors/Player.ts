import {Actor, EntityType} from "./Base/ActorsBase.ts";
import {InputController} from "../InputController.ts";
import {Timer, Vector2} from "../Utils.ts";
import {ASPECT_RATIO, IVULNERABILITY_DURATION_MS, VIEWPORT_WIDTH} from "../Constants.ts";
import {WeaponBase} from "./Weapons.ts";


export class Player extends Actor {
    input: InputController;
    entityType = EntityType.Player;

    LEFT_BOUND = this.radius;
    RIGHT_BOUND = VIEWPORT_WIDTH-this.radius;
    TOP_BOUND = this.radius;
    BOTTOM_BOUND = VIEWPORT_WIDTH/ASPECT_RATIO-this.radius;

    mainWeapon: WeaponBase;
    static initialSpawnPosition: Vector2 = new Vector2(30, Math.floor(VIEWPORT_WIDTH/ASPECT_RATIO/2));

    constructor(input: InputController) {
        super();
        this.input = input;
        this.mainWeapon = new WeaponBase(this);
        this.mainWeapon.spawnPosition = new Vector2(Math.floor(this.radius * 1.5), 0);
        this.spawnPosition = Player.initialSpawnPosition;
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
        if (this.input.isFiring()) {
            this.mainWeapon.activate();
        }
        this.mainWeapon.tick(delta);
        this.keepInBounds();
        super.tick(delta);
    }

    death() {
        super.death();
        this.sprite.htmlElement.classList.add('blink');
        this._isInvulnerable = true;
        this._body.pos.x = this.spawnPosition.x;
        this._body.pos.y = this.spawnPosition.y;
        if (this.flowController) {
            this.flowController.playerState.lives.value -= 1;
        }
        this.timers.push(new Timer(IVULNERABILITY_DURATION_MS, () => {
            this.reanimate();
            this._isInvulnerable = false;
            this.sprite.htmlElement.classList.remove('blink');
        }));
    }
}