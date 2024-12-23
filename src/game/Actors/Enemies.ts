import { Actor, EntityType } from './Base/ActorsBase.ts';
import {
  ASPECT_RATIO,
  DAMAGE_BASE,
  SPEED_BASE,
  VIEWPORT_WIDTH,
} from '../Constants.ts';
import {
  audioBalanceFromScreenPosition,
  clamp,
  Timer,
  Vector2,
} from '../Utils.ts';
import { Sprite } from './Base/Sprite.ts';
import { SFXSetType } from '../SoundController.ts';
import { BodyOptions, System } from 'detect-collisions';
import {
  WeaponBase,
  WeaponEnemyBomber,
  WeaponEnemyMachineGun,
  WeaponEnemyMine,
  WeaponEnemyMinePlayerProjectile,
  WeaponEnemyShooter,
  WeaponEnemySniper,
} from './Weapons.ts';
import { FlowController } from '../FlowController.ts';
import { Explosion } from './vfx.ts';

abstract class MovementPattern {
  // implements movement patterns for enemies, like sine wave, straight line, etc.
  // takes a delta and returns a direction vector
  abstract getDirection(delta: number): Vector2;
}

class MovementPatternStraightLine extends MovementPattern {
  getDirection(_: number): Vector2 {
    return new Vector2(-1, 0);
  }
}

class MovementPatternSineWave extends MovementPattern {
  sinePeriod: number = 1000;
  sineAmplitude: number = 1;
  _accumulatedDelta: number = 0;
  xMultiplier: number = 1;

  constructor(
    period: number = 1000,
    amplitude: number = 1,
    xMultiplier: number = -1
  ) {
    super();
    this.sinePeriod = period;
    this.sineAmplitude = amplitude;
    this._accumulatedDelta = 0;
    this.xMultiplier = xMultiplier;
  }

  deltaToRadians(delta: number): number {
    return (delta / this.sinePeriod) * 2 * Math.PI;
  }

  getDirection(delta: number): Vector2 {
    this._accumulatedDelta += delta;
    const direction = new Vector2(
      this.xMultiplier,
      Math.sin(this.deltaToRadians(this._accumulatedDelta)) * this.sineAmplitude
    );
    if (this._accumulatedDelta > this.sinePeriod) {
      this._accumulatedDelta = 0;
    }
    return direction;
  }
}

class MovementPatternTrackPlayerY extends MovementPattern {
  flowController: FlowController;
  owner: Actor;
  defaultDirection: Vector2;
  margin: number = 5;

  constructor(
    flowController: FlowController,
    owner: Actor,
    defaultDirection: Vector2 = new Vector2(-1, 0),
    margin: number = 5
  ) {
    super();
    this.flowController = flowController;
    this.owner = owner;
    this.defaultDirection = defaultDirection;
    this.margin = margin;
  }

  getDirection(_: number): Vector2 {
    const player = this.flowController.getPlayerActor();
    let yDirection = 0;
    if (player) {
      if (player._body.pos.y < this.owner._body.pos.y - this.margin) {
        yDirection = -1;
      } else if (player._body.pos.y > this.owner._body.pos.y + this.margin) {
        yDirection = 1;
      }
    }
    return new Vector2(this.defaultDirection.x, yDirection);
  }
}

export class EnemyBase extends Actor {
  radius: number = 30;
  entityType: EntityType = EntityType.Enemy;
  movementPattern: MovementPattern = new MovementPatternStraightLine();

  constructor(useSineWave: boolean = false) {
    super();
    if (useSineWave) {
      this.movementPattern = new MovementPatternSineWave(2000, 1, -1);
    }
  }

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
    this._body.setOffset({
      x: -this.radius,
      y: -this.radius * 0.6,
    } as SAT.Vector);
  }

  death(_: Actor | null = null) {
    super.death(_);
    if (_?.entityType === EntityType.PlayerProjectile) {
      this.flowController?.addScore(this.scoreCost);
      this.flowController?.soundController?.playSFX(
        SFXSetType.explosion,
        audioBalanceFromScreenPosition(this._body.pos.x),
        1
      );
    }
    this._markedForDeletion = true;

    // spawn explosion
    const explosion = new Explosion(
      new Vector2(this._body.pos.x, this._body.pos.y),
      new Vector2(0, 0)
    );
    this.flowController?._spawnActorQueue.push(explosion);
  }

  tick(delta: number) {
    super.tick(delta);
    this.controllerDirection = this.movementPattern.getDirection(delta);
    if (this._body.pos.x < -100) {
      this.death();
    }
  }
}

export class EnemyRam extends EnemyBase {
  maxHealth = DAMAGE_BASE * 4;
  maxSpeed: number = SPEED_BASE * 0.5;
  sprite = new Sprite(['enemy-ram']);
  scoreCost = 100;
}

export class EnemyShooter extends EnemyBase {
  maxHealth = DAMAGE_BASE * 2;
  maxSpeed: number = SPEED_BASE * 0.5;
  sprite = new Sprite(['enemy-shooter']);
  weapon: WeaponEnemyShooter;
  scoreCost = 200;

  constructor(useSineWave: boolean = false) {
    super(useSineWave);
    this.weapon = new WeaponEnemyShooter(this);
    this.weapon.postInit();
  }

  tick(delta: number) {
    super.tick(delta);
    this.weapon.activate();
    this.weapon.tick(delta);
  }
}

export class EnemyBomber extends EnemyBase {
  maxHealth = DAMAGE_BASE * 8;
  maxSpeed: number = SPEED_BASE * 0.3;
  sprite = new Sprite(['enemy-bomber']);
  weapon: WeaponEnemyBomber;
  scoreCost = 400;

  constructor(useSineWave: boolean = false) {
    super(useSineWave);
    this.weapon = new WeaponEnemyBomber(this);
    this.weapon.postInit();
  }

  createBody(system: System, position: Vector2) {
    const bodyOptions: BodyOptions = {
      userData: this,
    };

    this._body = system.createBox(
      position,
      this.radius * 2,
      this.radius * 2,
      bodyOptions
    );
    this._body.setOffset({ x: -this.radius, y: -this.radius } as SAT.Vector);
  }

  tick(delta: number) {
    super.tick(delta);
    this.weapon.activate();
    this.weapon.tick(delta);
  }
}

export class EnemyMine extends EnemyBase {
  maxHealth = DAMAGE_BASE * 4;
  maxSpeed: number = SPEED_BASE * 0.2;
  sprite = new Sprite(['enemy-mine']);
  weapon: WeaponEnemyMine;
  weaponsSecondary: WeaponEnemyMinePlayerProjectile;
  scoreCost = 500;
  exploded: boolean = false;

  constructor(useSineWave: boolean = false) {
    super(useSineWave);
    this.weapon = new WeaponEnemyMine(this);
    this.weapon.postInit();
    this.weaponsSecondary = new WeaponEnemyMinePlayerProjectile(this);
    this.weaponsSecondary.postInit();
  }

  createBody(system: System, position: Vector2) {
    const bodyOptions: BodyOptions = {
      userData: this,
    };

    this._body = system.createCircle(position, this.radius, bodyOptions);
  }

  death(_: Actor | null = null) {
    if (!this.exploded) {
      this.exploded = true;
      this.weapon.activate();
      this.weaponsSecondary.activate();
    }
    super.death(_);
  }
}

export class EnemySniper extends EnemyBase {
  maxHealth = DAMAGE_BASE * 2;
  maxSpeed: number = SPEED_BASE * 0.5;
  sprite = new Sprite(['enemy-sniper']);
  weapon: WeaponEnemySniper;
  scoreCost = 200;

  SWITCH_PATTERN_X = VIEWPORT_WIDTH * 0.8;

  constructor(useSineWave: boolean = false) {
    super(useSineWave);
    this.weapon = new WeaponEnemySniper(this);
    this.weapon.postInit();
  }

  _switchPattern() {
    if (this._body.pos.x < this.SWITCH_PATTERN_X) {
      if (this.flowController) {
        this.movementPattern = new MovementPatternTrackPlayerY(
          this.flowController,
          this,
          new Vector2(0, 0),
          30
        );
        this._switchPattern = () => {};
      }
    }
  }

  tick(delta: number) {
    super.tick(delta);
    this.weapon.activate();
    this.weapon.tick(delta);
    this._switchPattern();
  }
}

export class EnemyBoss extends EnemyBase {
  maxHealth = DAMAGE_BASE * 2;
  maxSpeed: number = SPEED_BASE * 0.5;
  radius: number = 77;
  sprite = new Sprite(['boss']);
  weapon: WeaponBase;
  weapons: WeaponBase[] = [];
  scoreCost = 200;

  canFire: boolean = true;
  waitTime: number = 2000;
  fireTime: number = 4000;
  timer: Timer;

  SWITCH_PATTERN_X = VIEWPORT_WIDTH - this.radius * 1.1;

  constructor(useSineWave: boolean = false) {
    super(useSineWave);
    const weaponMine = new WeaponEnemyMine(this);
    weaponMine.cooldownTime = 500;

    this.weapons.push(new WeaponEnemySniper(this));
    this.weapons.push(weaponMine);
    this.weapons.push(new WeaponEnemyMachineGun(this));

    this.weapon = this.weapons[0];

    for (const weapon of this.weapons) {
      weapon.postInit();
    }

    this.timer = new Timer(this.waitTime, () => {
      this.canFire = !this.canFire;
    });
  }

  createBody(system: System, position: Vector2) {
    const bodyOptions: BodyOptions = {
      userData: this,
    };

    this._body = system.createCircle(position, this.radius, bodyOptions);
  }

  death(_: Actor | null = null) {
    super.death(_);
    this.flowController?.winGame();
  }

  _switchPattern() {
    if (this._body.pos.x < this.SWITCH_PATTERN_X) {
      if (this.flowController) {
        this.movementPattern = new MovementPatternTrackPlayerY(
          this.flowController,
          this,
          new Vector2(0, 0),
          30
        );
        this._switchPattern = () => {};
      }
    }
  }

  getNextWeapon(): WeaponBase {
    let index = this.weapons.indexOf(this.weapon);
    index = (index + 1) % this.weapons.length;
    return this.weapons[index];
  }

  switchWeapons() {
    if (this.timer.exhausted) {
      if (this.canFire) {
        this.timer.duration = this.fireTime;
        this.timer.reset();
      } else {
        this.timer.duration = this.waitTime;
        this.timer.reset();
        this.weapon = this.getNextWeapon();
      }
    }
  }

  tick(delta: number) {
    super.tick(delta);

    this.timer.tick(delta);
    this.weapon.tick(delta);
    if (this.canFire) {
      this.weapon.activate();
    }

    this._switchPattern();
    this.switchWeapons();
  }
}

export enum enemyTypes {
  ram,
  shooter,
  bomber,
  mine,
  sniper,
  boss,
}

export class EnemySpawner {
  static randomLength(length: number): number {
    const min = length * 0.1;
    const max = length * 0.9;
    return clamp(Math.floor(Math.random() * length), min, max);
  }

  static randomViewportWidthWithOffset(): number {
    return VIEWPORT_WIDTH * (1 + clamp(Math.random(), 0.1, 0.5));
  }

  static spawnPositionFromType(enemyType: enemyTypes): Vector2 {
    const VIEWPORT_HEIGHT = VIEWPORT_WIDTH / ASPECT_RATIO;

    if (enemyType === enemyTypes.bomber) {
      return new Vector2(
        EnemySpawner.randomViewportWidthWithOffset(),
        VIEWPORT_HEIGHT * 0.1
      );
    } else {
      return new Vector2(
        EnemySpawner.randomViewportWidthWithOffset(),
        EnemySpawner.randomLength(VIEWPORT_HEIGHT)
      );
    }
  }

  static randomBool(): boolean {
    return Math.random() > 0.5;
  }

  static spawnEnemy(
    enemyType: enemyTypes,
    amount: number = 1,
    flowController: FlowController
  ): void {
    for (let i = 0; i < amount; i++) {
      let enemy: Actor;

      // oh come on!
      switch (enemyType) {
        case enemyTypes.ram:
          enemy = new EnemyRam(this.randomBool());
          break;
        case enemyTypes.shooter:
          enemy = new EnemyShooter(this.randomBool());
          break;
        case enemyTypes.bomber:
          enemy = new EnemyBomber();
          break;
        case enemyTypes.mine:
          enemy = new EnemyMine(this.randomBool());
          break;
        case enemyTypes.sniper:
          enemy = new EnemySniper(this.randomBool());
          break;
        case enemyTypes.boss:
          enemy = new EnemyBoss(this.randomBool());
          break;
        default:
          enemy = new EnemyRam(this.randomBool());
          break;
      }

      enemy.spawnPosition = EnemySpawner.spawnPositionFromType(enemyType);

      flowController._spawnActorQueue.push(enemy);
    }
  }
}
