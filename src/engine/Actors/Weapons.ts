import {FeatureBase} from "./Base/Feature.ts";
import {EnemyProjectile, PlayerProjectile, ProjectileBase} from "./Projectiles.ts";
import {Actor} from "./Base/ActorsBase.ts";
import {audioBalanceFromScreenPosition, Vector2} from "../Utils.ts";
import {SFXSetType} from "../SoundController.ts";

export class WeaponBase extends FeatureBase {
    projectileClass = ProjectileBase;
    owner: Actor;
    direction: Vector2 = new Vector2(1, 0);
    spawnPosition: Vector2 = new Vector2(0, 0);
    cooldownTime = 300;

    constructor(owner: Actor) {
        super();
        this.owner = owner;
    }

    postInit() {
        this._timer.duration = this.cooldownTime;
    }

    playSound() {
        this.owner.flowController?.soundController?.playSFX(
            SFXSetType.fire,
            audioBalanceFromScreenPosition(this.owner._body.pos.x), 1
        );
    }

    activateCallback() {
        const projectile = new this.projectileClass(this.spawnPosition, this.direction);
        projectile.spawnPosition = new Vector2(this.spawnPosition.x + this.owner._body.pos.x, this.spawnPosition.y + this.owner._body.pos.y);
        this.owner.flowController?._spawnActorQueue.push(projectile);
        this.playSound();
    }
}

export class WeaponEnemy extends WeaponBase {
    projectileClass = EnemyProjectile;
    direction: Vector2 = new Vector2(-1, 0);
    cooldownTime = 1200;
}

export class WeaponPlayer extends WeaponBase {
    projectileClass = PlayerProjectile;
    direction: Vector2 = new Vector2(1, 0);
    cooldownTime = 300;
    currentGrade: number = 1;
    maxGrade: number = 3;

    upgrade() {
        if (this.currentGrade < this.maxGrade) {
            this.currentGrade++;
        }
    }
}