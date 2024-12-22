import {Actor, EntityType} from "./Base/ActorsBase.ts";
import {InputController} from "../InputController.ts";
import {Timer, Vector2} from "../Utils.ts";
import {ASPECT_RATIO, IVULNERABILITY_DURATION_MS, VIEWPORT_WIDTH} from "../Constants.ts";
import {WeaponBase, WeaponPlayer} from "./Weapons.ts";
import {Sprite} from "./Base/Sprite.ts";
import {BodyOptions, System} from "detect-collisions";


export class Player extends Actor {
    input: InputController;
    entityType = EntityType.Player;
    sprite = new Sprite(['player']);
    LEFT_BOUND = this.radius;
    RIGHT_BOUND = VIEWPORT_WIDTH-this.radius;
    TOP_BOUND = this.radius;
    BOTTOM_BOUND = VIEWPORT_WIDTH/ASPECT_RATIO-this.radius;

    mainWeapon: WeaponBase;
    static initialSpawnPosition: Vector2 = new Vector2(30, Math.floor(VIEWPORT_WIDTH/ASPECT_RATIO/2));

    constructor(input: InputController) {
        super();
        this.input = input;
        this.mainWeapon = new WeaponPlayer(this);
        this.mainWeapon.spawnPosition = new Vector2(Math.floor(this.radius * 1.5), 0);
        this.mainWeapon.postInit();
        this.spawnPosition = Player.initialSpawnPosition;
        this.flowController?.setPlayerActor(this);
    }

    createBody(system: System, position: Vector2) {
        const bodyOptions: BodyOptions = {
            userData: this,
        };

        this._body = system.createBox(
            position,
            this.radius * 2,
            this.radius * 1.1,
            bodyOptions
        );
        this._body.setOffset({x:-this.radius, y:-this.radius*0.6} as SAT.Vector);
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

    verticalVelocityToSpriteLean() {
        if (this.controllerDirection.y < 0) {
            this.sprite.htmlElement.classList.add('lean-up');
            this.sprite.htmlElement.classList.remove('lean-down');
        } else if (this.controllerDirection.y > 0) {
            this.sprite.htmlElement.classList.add('lean-down');
            this.sprite.htmlElement.classList.remove('lean-up');
        } else {
            this.sprite.htmlElement.classList.remove('lean-up');
            this.sprite.htmlElement.classList.remove('lean-down');
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
        this.verticalVelocityToSpriteLean();
    }

    death(_: Actor | null = null) {
        super.death(_);
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