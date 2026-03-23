import { INITIAL_LIVES } from '../constants';

/** Reset all game state to initial values */
export function resetGameState(registry: Phaser.Data.DataManager): void {
  registry.set('lives', INITIAL_LIVES);
  registry.set('score', 0);
  registry.set('coins', 0);
  registry.set('currentLevel', 0);
  registry.set('powerState', 'small');
}
