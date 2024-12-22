import {Actor, EntityType} from "./Base/ActorsBase.ts";
import {DAMAGE_BASE, SPEED_BASE} from "../Constants.ts";
import {audioBalanceFromScreenPosition, Vector2} from "../Utils.ts";
import {Sprite} from "./Base/Sprite.ts";
import {SFXSetType} from "../SoundController.ts";
import {BodyOptions, System} from "detect-collisions";
import {WeaponEnemyShooter} from "./Weapons.ts";
// import {DAMAGE_BASE, SPEED_BASE} from "../Constants.ts";
// import {Sprite} from "./Base/Sprite.ts";

export class EnemyBase extends Actor {
    // maxHealth = DAMAGE_BASE;
    // contactDamage: number = DAMAGE_BASE;
    radius: number = 30;
    entityType: EntityType = EntityType.Enemy;
    // sprite: Sprite = new Sprite();
    // acceleration: number = 0.001;
    // maxSpeed: number = SPEED_BASE;
    // deceleration: number = 0.004;

    createBody(system: System, position: Vector2) {
        const bodyOptions: BodyOptions = {
            userData: this,
        };

        this._body = system.createBox(
            position,
            this.radius * 2,
            this.radius * 1.2,
            bodyOptions
        );
        this._body.setOffset({x:-this.radius, y:-this.radius*0.6} as SAT.Vector);
    }

    death(_: Actor | null = null) {
        super.death(_);
        if (_?.entityType === EntityType.PlayerProjectile) {
            this.flowController?.addScore(this.scoreCost);
        }
        this.flowController?.soundController?.playSFX(
            SFXSetType.explosion,
            audioBalanceFromScreenPosition(this._body.pos.x), 1
        );
        this._markedForDeletion = true;
    }

    tick(delta: number) {
        super.tick(delta);

        if (this._body.pos.x < -100) {
            this.death();
        }
    }

}

export class EnemyRam extends EnemyBase {
    maxHealth = DAMAGE_BASE * 2;
    maxSpeed: number = SPEED_BASE * 0.5;
    sprite = new Sprite(['enemy-ram']);
    scoreCost = 100;

    constructor() {
        super();
        this.controllerDirection = new Vector2(-1, 0);
    }
}

export class EnemyShooter extends EnemyBase {
    maxHealth = DAMAGE_BASE;
    maxSpeed: number = SPEED_BASE * 0.5;
    sprite = new Sprite(['enemy-shooter']);
    weapon: WeaponEnemyShooter;
    scoreCost = 200;

    constructor() {
        super();
        this.controllerDirection = new Vector2(-1, 0);
        this.weapon = new WeaponEnemyShooter(this);
        this.weapon.postInit();
    }

    tick(delta: number) {
        super.tick(delta);
        this.weapon.activate();
        this.weapon.tick(delta);
    }
}