import {
  LevelEventBase,
  LevelEventSequence,
  LevelSequencer,
} from '../LevelSequencer.ts';
import { FlowController } from '../FlowController.ts';
import { enemyTypes } from '../Actors/Enemies.ts';

export class LevelOne extends LevelEventSequence {
  constructor(flowController: FlowController) {
    super();

    const e1 = new LevelEventBase(2000, true);
    this.events.push(e1);

    this.events.push(
      LevelSequencer.createEvent(flowController, 2, true, [enemyTypes.ram], 2)
    );

    this.events.push(
      LevelSequencer.createEvent(
        flowController,
        2,
        true,
        [enemyTypes.ram, enemyTypes.bomber],
        1
      )
    );

    this.events.push(
        LevelSequencer.createEvent(
            flowController,
            3,
            true,
            [enemyTypes.ram, enemyTypes.sniper],
            1
        )
    );

    this.events.push(
        LevelSequencer.createEvent(
            flowController,
            3,
            true,
            [enemyTypes.shooter, enemyTypes.ram],
            1
        )
    );


    const e2 = new LevelEventBase(2000, true);
    this.events.push(e2);

    this.events.push(
        LevelSequencer.createEvent(
            flowController,
            3,
            false,
            [enemyTypes.boss],
            1
        )
    );

  }
}
