import { Actor, EntityType } from './Base/ActorsBase.ts';
import { Sprite } from './Base/Sprite.ts';
import { Vector2 } from '../Utils.ts';

export class Explosion extends Actor {
  radius: number = 30;
  entityType: EntityType = EntityType.None;
  sprite = new Sprite(['explosion']);
  duration: number = 1000;
  controllerDirection: Vector2 = new Vector2(0, 0.05);

  constructor(position: Vector2, _: Vector2) {
    super();
    this._body.setPosition(position.x, position.y);
    this.spawnPosition = new Vector2(position.x, position.y);
  }

  tick(delta: number) {
    super.tick(delta);
    this.duration -= delta;
    if (this.duration <= 0) {
      this._markedForDeletion = true;
    }
  }
}
