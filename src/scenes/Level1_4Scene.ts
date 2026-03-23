import { BaseLevelScene } from './BaseLevelScene';
import { LevelData } from '../types';
import { LEVELS } from '../data/levels';

export class Level1_4Scene extends BaseLevelScene {
  constructor() {
    super('Level1_4Scene', 3);
  }

  protected getLevelData(): LevelData {
    return LEVELS[3];
  }
}
