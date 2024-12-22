import {FeatureBase} from "./Base/Feature.ts";
import {EnemyProjectile, PlayerProjectile, ProjectileBase} from "./Projectiles.ts";
import {Actor} from "./Base/ActorsBase.ts";
import {audioBalanceFromScreenPosition, Vector2} from "../Utils.ts";
import {SFXSetType} from "../SoundController.ts";


class LaunchParams {
    spawnPosition: Vector2;
    direction: Vector2;

    constructor(spawnPosition: Vector2, direction: Vector2) {
        this.spawnPosition = spawnPosition;
        this.direction = direction;
    }
}

class LaunchSlot {
    launchParamsList: LaunchParams[] = [];

    constructor(launchParamsList: LaunchParams[]) {
        this.launchParamsList = launchParamsList;
    }
}


export class WeaponBase extends FeatureBase {
    projectileClass = ProjectileBase;
    owner: Actor;
    cooldownTime = 300;

    launchSlots: LaunchSlot[] = [];
    currentLaunchSlot: number = 0;

    constructor(owner: Actor) {
        super();
        this.owner = owner;
    }

    postInit() {
        this._timer.duration = this.cooldownTime;
    }

    getCurrentLaunchParams() : LaunchParams[] {
        const slot = this.launchSlots[this.currentLaunchSlot];
        let finalParams: LaunchParams[] = [];
        for (let i = 0; i < slot.launchParamsList.length; i++) {
            finalParams.push(new LaunchParams(
                new Vector2(
                    slot.launchParamsList[i].spawnPosition.x + this.owner._body.pos.x,
                    slot.launchParamsList[i].spawnPosition.y + this.owner._body.pos.y
                ),
                slot.launchParamsList[i].direction)
            );
        }

        return finalParams;
    }

    playSound() {
        this.owner.flowController?.soundController?.playSFX(
            SFXSetType.fire,
            audioBalanceFromScreenPosition(this.owner._body.pos.x), 1
        );
    }

    launchProjectile(launchParams: LaunchParams) {
        const projectile = new this.projectileClass(launchParams.spawnPosition, launchParams.direction);
        this.owner.flowController?._spawnActorQueue.push(projectile);

    }

    activateCallback() {
        const launchParams = this.getCurrentLaunchParams();
        for (let i = 0; i < launchParams.length; i++) {
            this.launchProjectile(launchParams[i]);
        }
        this.playSound();
    }
}

export class WeaponEnemyShooter extends WeaponBase {
    projectileClass = EnemyProjectile;
    cooldownTime = 1200;

    constructor(owner: Actor) {
        super(owner);
        this.owner = owner;
        this.launchSlots = [
            new LaunchSlot([
                new LaunchParams(
                    new Vector2(0, 0),
                    new Vector2(-1, 0)),
            ]),
        ];
    }
}

export class WeaponPlayer extends WeaponBase {
    projectileClass = PlayerProjectile;
    cooldownTime = 300;
    currentGrade: number = 1;
    maxGrade: number = 3;

    constructor(owner: Actor) {
        super(owner);
        this.owner = owner;

        const offsetX = Math.floor(this.owner.radius * 1.5)
        this.launchSlots = [
            new LaunchSlot([
                new LaunchParams(
                    new Vector2(offsetX, 0),
                    new Vector2(1, 0)),
            ]),
            new LaunchSlot([
                new LaunchParams(
                    new Vector2(offsetX, -10),
                    new Vector2(1, 0)
                ),
                new LaunchParams(
                    new Vector2(offsetX, 10),
                    new Vector2(1, 0)
                ),
            ]),
        ];
        this.currentLaunchSlot = 0;
    }

    upgrade() {
        if (this.currentGrade < this.maxGrade) {
            this.currentGrade++;
        }
    }
}