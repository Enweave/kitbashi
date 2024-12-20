import {Actor, EntityType} from "./Base/ActorsBase.ts";
import {Vector2} from "../Utils.ts";
import {PROJECTILE_SPEED} from "../Constants.ts";
import {Sprite} from "./Base/Sprite.ts";

export class ProjectileBase extends Actor {
    radius = 5;
    entityType = EntityType.PlayerProjectile;
    projectileDamage = 1;
    maxSpeed = PROJECTILE_SPEED;
    lifespan = 3 * 1000;
    acceleration = 1;
    sprite = new Sprite(['projectile']);

    constructor(position: Vector2, direction: Vector2) {
        super();
        this._body.setPosition(position.x, position.y, true);
        this.controllerDirection = direction;
    }

    tick(delta: number) {
        super.tick(delta);
        this.lifespan -= delta;
        if (this.lifespan <= 0) {
            this.death();
        }
    }

    death() {
        super.death();
        this._markedForDeletion = true;
    }
}