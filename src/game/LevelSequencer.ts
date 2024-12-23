import { Task } from './MainLoop.ts';
import { FlowController } from './FlowController.ts';
import { Scene } from './SceneController.ts';
import { EnemySpawner, enemyTypes } from './Actors/Enemies.ts';

export class LevelEventBase implements Task {
  duration: number = 0;
  finished: boolean = false;
  flowController: FlowController | null = null;
  scene: Scene | null = null;
  autoFinish: boolean = false;

  constructor(duration: number, autoFinish: boolean = true) {
    this.duration = duration;
    this.autoFinish = autoFinish;
  }

  update(delta: number) {
    this.duration -= delta;
    if (this.duration <= 0 && this.autoFinish) {
      this.finished = true;
    }
  }

  beginEvent() {}
}

export class LevelEventSequence {
  events: LevelEventBase[] = [];
}

export class LevelSequencer implements Task {
  paused: boolean = true;
  flowController: FlowController;
  scene: Scene;
  events: LevelEventBase[] = [];
  _currentEvent: LevelEventBase | null = null;
  _currentEventIndex: number = 0;

  _advanceLevel() {
    if (this._currentEventIndex < this.events.length - 1) {
      this._currentEventIndex++;
      this._beginCurrentEvent();
    } else {
      this.flowController.winGame();
    }
  }

  _beginCurrentEvent() {
    this._currentEvent = this.events[this._currentEventIndex];
    this._currentEvent.flowController = this.flowController;
    this._currentEvent.scene = this.scene;
    this._currentEvent.beginEvent();
  }

  constructor(
    inFlowController: FlowController,
    scene: Scene,
    level: LevelEventSequence
  ) {
    this.flowController = inFlowController;
    this.scene = scene;
    this.events = level.events;

    this._currentEventIndex = 0;
  }

  beginSequence() {
    this.paused = false;
    this._beginCurrentEvent();
    this.beginSequence = () => {};
  }

  update(delta: number) {
    if (this.paused) {
      return;
    }
    this._currentEvent?.update(delta);
    if (this._currentEvent?.finished) {
      this._advanceLevel();
    }
  }

  static createEvent(
    flowController: FlowController,
    durationSeconds: number,
    autoFinish: boolean = true,
    enemyTypes: enemyTypes[],
    amount: number = 1
  ): LevelEventBase {
    const event = new LevelEventBase(durationSeconds * 1000, autoFinish);
    event.beginEvent = () => {
      console.log('Event started :' + enemyTypes, amount);
      for (let i = 0; i < enemyTypes.length; i++) {
        EnemySpawner.spawnEnemy(enemyTypes[i], amount, flowController);
      }
    };
    return event;
  }
}
