import {
  LevelEventBase,
  LevelEventSequence,
  LevelSequencer,
} from '../LevelSequencer.ts';
import { FlowController } from '../FlowController.ts';
import { enemyTypes } from '../Actors/Enemies.ts';
import { clamp } from '../Utils.ts';

export class LevelOne extends LevelEventSequence {
  constructor(flowController: FlowController) {
    super();

    const e1 = new LevelEventBase(2000, true);
    this.events.push(e1);

    this.events.push(
      LevelSequencer.createEvent(flowController, 2, true, [enemyTypes.ram], 2)
    );

    const maxLevels = 30;

    for (let i = 0; i < maxLevels; i++) {
      this.events.push(
        LevelSequencer.createEvent(
          flowController,
          Math.floor(Math.random() * 5) + 1,
          true,
          [this.getRandomEnemyType()],
          clamp(Math.floor(Math.random() * i) + 1, 1, 5)
        )
      );
    }

    const e2 = new LevelEventBase(2000, true);
    this.events.push(e2);

    this.events.push(
      LevelSequencer.createEvent(flowController, 3, false, [enemyTypes.boss], 1)
    );
  }

  getRandomEnemyType(): enemyTypes {
    const types = [
      enemyTypes.ram,
      enemyTypes.shooter,
      enemyTypes.sniper,
      enemyTypes.mine,
      enemyTypes.bomber,
    ];

    return types[Math.floor(Math.random() * types.length)];
  }
}
