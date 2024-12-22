import { Timer } from '../../Utils.ts';

export class FeatureBase {
  cooldownTime: number = 500;

  _isOnCooldown: boolean = false;
  _timer: Timer;

  constructor() {
    this._timer = new Timer(this.cooldownTime, () => {
      this._isOnCooldown = false;
    });
    this._timer.exhausted = true;
  }

  tick(delta: number) {
    this._timer.tick(delta);
  }

  activate() {
    if (this._isOnCooldown) {
      return;
    }

    this._isOnCooldown = true;
    this._timer.reset();
    this.activateCallback();
  }

  activateCallback() {}
}
