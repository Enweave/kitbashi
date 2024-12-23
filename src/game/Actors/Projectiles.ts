import { Actor, EntityType } from './Base/ActorsBase.ts';
import { Vector2 } from '../Utils.ts';
import {
  DAMAGE_BASE,
  MINE_DAMAGE_MULTIPLIER,
  PROJECTILE_SPEED,
} from '../Constants.ts';
import { Sprite } from './Base/Sprite.ts';

export class ProjectileBase extends Actor {
  radius = 10;
  entityType = EntityType.Projectile;
  maxSpeed = PROJECTILE_SPEED;
  lifespan = 2 * 1000;
  acceleration = 1;
  sprite = new Sprite(['projectile']);

  constructor(position: Vector2, direction: Vector2) {
    super();
    this._body.setPosition(position.x, position.y);
    this.spawnPosition = new Vector2(position.x, position.y);
    this.controllerDirection = new Vector2(direction.x, direction.y);
  }

  tick(delta: number) {
    super.tick(delta);
    this.lifespan -= delta;
    if (this.lifespan <= 0) {
      this.death();
    }
  }

  death(_: Actor | null = null) {
    super.death(_);
    this._markedForDeletion = true;
  }
}

export class EnemyProjectile extends ProjectileBase {
  entityType = EntityType.Enemy;
  sprite = new Sprite(['projectile']);
}

export class PlayerProjectile extends ProjectileBase {
  entityType = EntityType.PlayerProjectile;
  sprite = new Sprite(['player-projectile']);
}

export class PlayerProjectileMine extends ProjectileBase {
  entityType = EntityType.PlayerProjectile;
  sprite = new Sprite(['player-projectile']);
  contactDamage = MINE_DAMAGE_MULTIPLIER * DAMAGE_BASE;
}
