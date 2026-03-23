import { GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { AudioManager } from '../systems/AudioManager';

export class PauseScene extends Phaser.Scene {
  private parentSceneKey = '';

  constructor() {
    super({ key: 'PauseScene' });
  }

  init(data: { parentScene: string }): void {
    this.parentSceneKey = data.parentScene || '';
  }

  create(): void {
    // Semi-transparent overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.6);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Pause panel
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a2e, 0.95);
    panel.fillRoundedRect(GAME_WIDTH / 2 - 140, GAME_HEIGHT / 2 - 100, 280, 200, 12);
    panel.lineStyle(2, 0x4caf50);
    panel.strokeRoundedRect(GAME_WIDTH / 2 - 140, GAME_HEIGHT / 2 - 100, 280, 200, 12);

    // Title
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 70, 'PAUSADO', {
      fontSize: '28px',
      color: '#4caf50',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Resume button
    const resumeBtn = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 10, '[ CONTINUAR ]', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    resumeBtn.on('pointerover', () => { resumeBtn.setScale(1.1); resumeBtn.setColor('#4caf50'); });
    resumeBtn.on('pointerout', () => { resumeBtn.setScale(1); resumeBtn.setColor('#ffffff'); });
    resumeBtn.on('pointerdown', () => this.resumeGame());

    // Quit button
    const quitBtn = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, '[ MENU PRINCIPAL ]', {
      fontSize: '16px',
      color: '#90caf9',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    quitBtn.on('pointerover', () => { quitBtn.setScale(1.05); quitBtn.setColor('#ffffff'); });
    quitBtn.on('pointerout', () => { quitBtn.setScale(1); quitBtn.setColor('#90caf9'); });
    quitBtn.on('pointerdown', () => {
      AudioManager.getInstance().stopMusic();
      // Resume paused scenes before stopping them (paused scenes may not shutdown cleanly)
      this.scene.resume(this.parentSceneKey);
      this.scene.resume('HUDScene');
      this.scene.stop(this.parentSceneKey);
      this.scene.stop('HUDScene');
      // Start TitleScene BEFORE stopping self — stop() kills the scene's ScenePlugin
      this.scene.start('TitleScene');
    });

    // Hint text
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80, 'P ou ESC para continuar', {
      fontSize: '11px',
      color: '#666666',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    // Keyboard resume
    this.input.keyboard?.on('keydown-P', () => this.resumeGame());
    this.input.keyboard?.on('keydown-ESC', () => this.resumeGame());

    this.events.once('shutdown', () => {
      this.input.keyboard?.removeAllListeners();
    });
  }

  private resumeGame(): void {
    this.scene.resume(this.parentSceneKey);
    this.scene.resume('HUDScene');
    this.scene.stop();
  }
}
