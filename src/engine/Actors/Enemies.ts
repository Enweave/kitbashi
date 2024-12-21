import {Actor, EntityType} from "./Base/ActorsBase.ts";
import {DAMAGE_BASE, SPEED_BASE} from "../Constants.ts";
import {Vector2} from "../Utils.ts";
import {Sprite} from "./Base/Sprite.ts";
import {WeaponEnemy} from "./Weapons.ts";
// import {DAMAGE_BASE, SPEED_BASE} from "../Constants.ts";
// import {Sprite} from "./Base/Sprite.ts";

export class EnemyBase extends Actor {
    // maxHealth = DAMAGE_BASE;
    // contactDamage: number = DAMAGE_BASE;
    // radius: number = 15;
    entityType: EntityType = EntityType.Enemy;
    // sprite: Sprite = new Sprite();
    // acceleration: number = 0.001;
    // maxSpeed: number = SPEED_BASE;
    // deceleration: number = 0.004;

    death() {
        super.death();
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

    constructor() {
        super();
        this.controllerDirection = new Vector2(-1, 0);
    }
}

export class EnemyShooter extends EnemyBase {
    maxHealth = DAMAGE_BASE;
    maxSpeed: number = SPEED_BASE * 0.5;
    sprite = new Sprite(['enemy-shooter']);
    weapon: WeaponEnemy;

    constructor() {
        super();
        this.controllerDirection = new Vector2(-1, 0);
        this.weapon = new WeaponEnemy(this);
        this.weapon.spawnPosition = new Vector2(-this.radius-5, 0);
        this.weapon.postInit();
    }

    tick(delta: number) {
        super.tick(delta);
        this.weapon.activate();
        this.weapon.tick(delta);
    }
}