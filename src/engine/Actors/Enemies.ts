import {Actor, EntityType} from "./Base/ActorsBase.ts";
// import {DAMAGE_BASE, SPEED_BASE} from "../Constants.ts";
// import {Sprite} from "./Base/Sprite.ts";

export class EnemyBase extends Actor {
    maxHealth = 2;
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
}