import {FeatureBase} from "./Base/Feature.ts";
import {ProjectileBase} from "./Projectiles.ts";
import {Actor} from "./Base/ActorsBase.ts";
import {Vector2} from "../Utils.ts";

export class WeaponBase extends FeatureBase {
    projectileClass = ProjectileBase;
    owner: Actor;
    direction: Vector2 = new Vector2(1, 0);
    spawnPosition: Vector2 = new Vector2(0, 0);

    constructor(owner: Actor) {
        super();
        this.cooldownTime = 200;
        this.owner = owner;
    }

    activateCallback() {
        const projectile = new this.projectileClass(this.spawnPosition, this.direction);
        projectile.spawnPosition = new Vector2(this.spawnPosition.x + this.owner._body.pos.x, this.spawnPosition.y + this.owner._body.pos.y);
        this.owner.flowController?._spawnActorQueue.push(projectile);
    }
}