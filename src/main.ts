import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, GRAVITY } from './constants';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { TitleScene } from './scenes/TitleScene';
import { CharacterSelectScene } from './scenes/CharacterSelectScene';
import { InstructionsScene } from './scenes/InstructionsScene';
import { HUDScene } from './scenes/HUDScene';
import { LevelTransitionScene } from './scenes/LevelTransitionScene';
import { GameOverScene } from './scenes/GameOverScene';
import { VictoryScene } from './scenes/VictoryScene';
import { PauseScene } from './scenes/PauseScene';
import { Level1_1Scene } from './scenes/Level1_1Scene';
import { Level1_2Scene } from './scenes/Level1_2Scene';
import { Level1_3Scene } from './scenes/Level1_3Scene';
import { Level1_4Scene } from './scenes/Level1_4Scene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  roundPixels: true,
  antialias: true,
  backgroundColor: '#5c94fc',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: GRAVITY },
      debug: false,
    },
  },
  input: {
    activePointers: 4,
  },
  scene: [
    BootScene,
    PreloadScene,
    TitleScene,
    CharacterSelectScene,
    InstructionsScene,
    Level1_1Scene,
    Level1_2Scene,
    Level1_3Scene,
    Level1_4Scene,
    HUDScene,
    PauseScene,
    LevelTransitionScene,
    GameOverScene,
    VictoryScene,
  ],
};

new Phaser.Game(config);
