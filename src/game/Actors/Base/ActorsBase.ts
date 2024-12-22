import { System, Circle, Body, BodyOptions } from 'detect-collisions';
import { Sprite } from './Sprite.ts';
import { Timer, Vector2 } from '../../Utils.ts';
import {
  DAMAGE_BASE,
  LOW_VELOCITY_THRESHOLD,
  SPEED_BASE,
} from '../../Constants.ts';
import { FlowController } from '../../FlowController.ts';

export enum EntityType {
  None = 0,
  Player = 1,
  Enemy = 2,
  Wall = 4,
  PowerUp = 5,
  PlayerProjectile = 7,
  Projectile = 8,
}

export class Actor {
  maxHealth: number = DAMAGE_BASE;
  contactDamage: number = DAMAGE_BASE;
  radius: number = 30;
  entityType: EntityType = EntityType.None;
  sprite: Sprite = new Sprite();
  acceleration: number = 0.002;
  maxSpeed: number = SPEED_BASE;
  deceleration: number = 0.008;

  _isAlive: boolean = true;
  _isInvulnerable: boolean = false;
  _currentHealth: number = this.maxHealth;

  controllerDirection: Vector2 = new Vector2(0, 0);
  _currentVelocity: Vector2 = new Vector2(0, 0);

  _body: Body<Circle> = new Circle({ x: 0, y: 0 }, 10);
  _markedForDeletion: boolean = false;
  flowController: FlowController | null = null;

  spawnPosition: Vector2 = new Vector2(0, 0);
  timers: Timer[] = [];
  scoreCost: number = 0;

  reanimate() {
    this._currentHealth = this.maxHealth;
    this._isAlive = true;
  }

  death(_: Actor | null = null) {
    this._isAlive = false;
  }

  damage(amount: number, _: Actor | null = null) {
    if (!this._isAlive || this._isInvulnerable) {
      return;
    }
    this._currentHealth -= amount;
    if (this._currentHealth <= 0) {
      this.death(_);
    }
  }

  createBody(system: System, position: Vector2) {
    const bodyOptions: BodyOptions = {
      userData: this,
    };

    this._body = system.createCircle(position, this.radius, bodyOptions);
  }

  attach(
    system: System,
    rootElement: HTMLElement,
    position: Vector2,
    flowController: FlowController
  ) {
    this.reanimate();
    this.sprite.attachToRoot(rootElement);
    this.createBody(system, position);
    system.insert(this._body);

    this.updateSpritePosition();
    this.flowController = flowController;
    this.afterAttach();
  }

  afterAttach() {}

  updateSpritePosition() {
    if (this._body) {
      this.sprite.updatePosition(this._body.pos.x, this._body.pos.y);
    }
  }

  tick(delta: number) {
    this.timers.forEach((timer) => {
      if (timer.exhausted) {
        this.timers = this.timers.filter((t) => t !== timer);
      } else {
        timer.tick(delta);
      }
    });

    this.updateMovement(delta);
    this.updateSpritePosition();
  }

  updateMovement(delta: number) {
    if (this._body) {
      let accelerationX: number;
      let accelerationY: number;
      if (this.controllerDirection.x != 0 || this.controllerDirection.y != 0) {
        accelerationX = this.controllerDirection.x * this.acceleration * delta;
        accelerationY = this.controllerDirection.y * this.acceleration * delta;
        this._currentVelocity.x += accelerationX;
        this._currentVelocity.y += accelerationY;
      } else {
        if (this._currentVelocity.getLength() > LOW_VELOCITY_THRESHOLD) {
          this._currentVelocity.x -=
            this._currentVelocity.x * this.deceleration * delta;
          this._currentVelocity.y -=
            this._currentVelocity.y * this.deceleration * delta;
        } else {
          this._currentVelocity.x = 0;
          this._currentVelocity.y = 0;
        }
      }

      this._currentVelocity.clampLength(this.maxSpeed);

      this._body.setPosition(
        this._body.pos.x + delta * this._currentVelocity.x,
        this._body.pos.y + delta * this._currentVelocity.y,
        true
      );
    }
  }
}
