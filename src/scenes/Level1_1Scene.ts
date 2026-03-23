import { BaseLevelScene } from './BaseLevelScene';
import { LevelData } from '../types';
import { LEVELS } from '../data/levels';

export class Level1_1Scene extends BaseLevelScene {
  constructor() {
    super('Level1_1Scene', 0);
  }

  protected getLevelData(): LevelData {
    return LEVELS[0];
  }
}
