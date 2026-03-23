import { BaseLevelScene } from './BaseLevelScene';
import { LevelData } from '../types';
import { LEVELS } from '../data/levels';

export class Level1_3Scene extends BaseLevelScene {
  constructor() {
    super('Level1_3Scene', 2);
  }

  protected getLevelData(): LevelData {
    return LEVELS[2];
  }
}
