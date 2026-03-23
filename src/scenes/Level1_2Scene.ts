import { BaseLevelScene } from './BaseLevelScene';
import { LevelData } from '../types';
import { LEVELS } from '../data/levels';

export class Level1_2Scene extends BaseLevelScene {
  constructor() {
    super('Level1_2Scene', 1);
  }

  protected getLevelData(): LevelData {
    return LEVELS[1];
  }
}
