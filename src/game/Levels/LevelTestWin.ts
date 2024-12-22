import { LevelEventBase, LevelEventSequence } from '../LevelSequencer.ts';

export class LevelTestWin extends LevelEventSequence {
  constructor() {
    super();
    const e1 = new LevelEventBase(2000, false);
    e1.beginEvent = () => {
      console.log('Event 1');
    };
    this.events.push(e1);
  }
}
