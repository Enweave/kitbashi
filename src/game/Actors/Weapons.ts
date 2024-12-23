import { FeatureBase } from './Base/Feature.ts';
import {
  EnemyProjectile,
  PlayerProjectile,
  PlayerProjectileMine,
  ProjectileBase,
} from './Projectiles.ts';
import { Actor } from './Base/ActorsBase.ts';
import { audioBalanceFromScreenPosition, Vector2 } from '../Utils.ts';
import { SFXSetType } from '../SoundController.ts';

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

  getCurrentLaunchParams(): LaunchParams[] {
    const slot = this.launchSlots[this.currentLaunchSlot];
    const finalParams: LaunchParams[] = [];
    for (let i = 0; i < slot.launchParamsList.length; i++) {
      finalParams.push(
        new LaunchParams(
          new Vector2(
            slot.launchParamsList[i].spawnPosition.x + this.owner._body.pos.x,
            slot.launchParamsList[i].spawnPosition.y + this.owner._body.pos.y
          ),
          slot.launchParamsList[i].direction
        )
      );
    }

    return finalParams;
  }

  playSound() {
    this.owner.flowController?.soundController?.playSFX(
      SFXSetType.fire,
      audioBalanceFromScreenPosition(this.owner._body.pos.x),
      1
    );
  }

  launchProjectile(launchParams: LaunchParams) {
    const projectile = new this.projectileClass(
      launchParams.spawnPosition,
      launchParams.direction
    );
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
      new LaunchSlot([new LaunchParams(new Vector2(0, 0), new Vector2(-1, 0))]),
    ];
  }
}

export class WeaponEnemyBomber extends WeaponBase {
  projectileClass = EnemyProjectile;
  cooldownTime = 600;

  constructor(owner: Actor) {
    super(owner);
    this.owner = owner;
    this.launchSlots = [
      new LaunchSlot([new LaunchParams(new Vector2(0, 30), new Vector2(0, 1))]),
    ];
  }
}

export class WeaponEnemyMine extends WeaponBase {
  projectileClass = EnemyProjectile;
  cooldownTime = 1;

  constructor(owner: Actor) {
    super(owner);
    this.owner = owner;

    const centerOffsetLength = 35;
    const launchParams: LaunchParams[] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      launchParams.push(
        new LaunchParams(
          new Vector2(cos * centerOffsetLength, sin * centerOffsetLength),
          new Vector2(cos, sin)
        )
      );
    }

    this.launchSlots = [new LaunchSlot(launchParams)];
  }
}

export class WeaponEnemyMinePlayerProjectile extends WeaponBase {
  projectileClass = PlayerProjectileMine;
  cooldownTime = 100;

  constructor(owner: Actor) {
    super(owner);
    this.owner = owner;

    const launchParams: LaunchParams[] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      launchParams.push(
        new LaunchParams(
          new Vector2(0, 0),
          new Vector2(Math.cos(angle), Math.sin(angle))
        )
      );
    }

    this.launchSlots = [new LaunchSlot(launchParams)];
  }
}

export class WeaponEnemySniper extends WeaponBase {
  projectileClass = EnemyProjectile;
  cooldownTime = 700;
  spreadDistance = 30;

  constructor(owner: Actor) {
    super(owner);
    this.owner = owner;
    this.launchSlots = [
      new LaunchSlot([new LaunchParams(new Vector2(0, 0), new Vector2(-1, 0))]),
    ];
  }

  getCurrentLaunchParams(): LaunchParams[] {
    const params = super.getCurrentLaunchParams();
    const player = this.owner.flowController?.getPlayerActor();
    if (player) {
      const playerPos = new Vector2(
        player._body.pos.x +
          Math.random() * this.spreadDistance -
          this.spreadDistance / 2,
        player._body.pos.y +
          Math.random() * this.spreadDistance -
          this.spreadDistance / 2
      );
      const ownerPos = new Vector2(
        this.owner._body.pos.x,
        this.owner._body.pos.y
      );
      const normalizedDirection = ownerPos.getNormalizedDirectionTo(playerPos);
      const direction = new Vector2(
        normalizedDirection.x,
        normalizedDirection.y
      );
      for (let i = 0; i < params.length; i++) {
        params[i].direction = direction;
      }
    }

    return params;
  }
}

export class WeaponEnemyMachineGun extends WeaponBase {
  projectileClass = EnemyProjectile;
  cooldownTime = 200;
  spreadFactor = 0.3;

  getCurrentLaunchParams(): LaunchParams[] {
    const params = super.getCurrentLaunchParams();

    for (let i = 0; i < params.length; i++) {
      params[i].direction.y =
        Math.random() * this.spreadFactor - this.spreadFactor / 2;
    }

    return params;
  }

  constructor(owner: Actor) {
    super(owner);
    this.owner = owner;
    this.launchSlots = [
      new LaunchSlot([new LaunchParams(new Vector2(0, 0), new Vector2(-1, 0))]),
    ];
  }
}

export class WeaponPlayer extends WeaponBase {
  projectileClass = PlayerProjectile;
  cooldownTime = 300;
  currentGrade: number = 1;
  maxGrade: number = 3;

  playSound() {
    this.owner.flowController?.soundController?.playSFX(
      SFXSetType.fireAlt,
      audioBalanceFromScreenPosition(this.owner._body.pos.x),
      1
    );
  }

  constructor(owner: Actor) {
    super(owner);
    this.owner = owner;

    const offsetX = Math.floor(this.owner.radius * 1.5);
    this.launchSlots = [
      new LaunchSlot([
        new LaunchParams(new Vector2(offsetX, 0), new Vector2(1, 0)),
      ]),
      new LaunchSlot([
        new LaunchParams(new Vector2(offsetX, -10), new Vector2(1, 0)),
        new LaunchParams(new Vector2(offsetX, 10), new Vector2(1, 0)),
      ]),
      new LaunchSlot([
        new LaunchParams(new Vector2(offsetX, -10), new Vector2(1, 0)),
        new LaunchParams(new Vector2(offsetX, 10), new Vector2(1, 0)),
        new LaunchParams(new Vector2(offsetX, 20), new Vector2(1, 1)),
      ]),
      new LaunchSlot([
        new LaunchParams(new Vector2(offsetX, -10), new Vector2(1, 0)),
        new LaunchParams(new Vector2(offsetX, 10), new Vector2(1, 0)),
        new LaunchParams(new Vector2(offsetX, 20), new Vector2(1, 1)),
        new LaunchParams(new Vector2(offsetX, 20), new Vector2(1, -1)),
      ]),
      new LaunchSlot([
        new LaunchParams(new Vector2(offsetX + 10, 0), new Vector2(1, 0)),
        new LaunchParams(new Vector2(offsetX, -10), new Vector2(1, 0)),
        new LaunchParams(new Vector2(offsetX, 10), new Vector2(1, 0)),
        new LaunchParams(new Vector2(offsetX, 20), new Vector2(1, 1)),
        new LaunchParams(new Vector2(offsetX, 20), new Vector2(1, -1)),
      ]),
    ];
    this.currentLaunchSlot = 0;
  }
}
