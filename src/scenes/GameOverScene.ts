import { GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { AudioManager } from '../systems/AudioManager';
import { resetGameState } from '../systems/GameStateUtils';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(): void {
    AudioManager.getInstance().playGameOverMusic();
    this.cameras.main.setBackgroundColor(0x1a0a0a);
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // Register shutdown cleanup
    this.events.once('shutdown', this.shutdown, this);

    const score = this.registry.get('score') || 0;
    const bestScore = parseInt(localStorage.getItem('cpm-best-score') || '0', 10);
    const isNewBest = score > bestScore;
    if (isNewBest) {
      localStorage.setItem('cpm-best-score', String(score));
    }

    // Vignette effect
    const vignette = this.add.graphics();
    vignette.fillStyle(0x000000, 0.3);
    vignette.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Character image with sad effect
    const charName = this.registry.get('selectedCharacter') || 'Angelina';
    const charImg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 120, `char-${charName}`);
    const imgScale = 60 / Math.max(charImg.width, charImg.height);
    charImg.setScale(imgScale).setAlpha(0.5).setTint(0x888888);

    // Shake on enter
    this.cameras.main.shake(300, 0.01);

    const gameOverTitle = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, 'FIM DE JOGO', {
      fontSize: '42px',
      color: '#ff4444',
      fontFamily: 'Arial Black, Arial',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Slight pulsing on game over text
    this.tweens.add({
      targets: gameOverTitle,
      alpha: { from: 1, to: 0.7 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'A poluição venceu desta vez...', {
      fontSize: '16px',
      color: '#cccccc',
      fontFamily: 'Arial',
      fontStyle: 'italic',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, `Pontuação: ${score}`, {
      fontSize: '24px',
      color: '#ffeb3b',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    const bestText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50,
      isNewBest ? `NOVO RECORDE!` : `Recorde: ${bestScore}`, {
      fontSize: isNewBest ? '16px' : '13px',
      color: isNewBest ? '#ff9800' : '#888888',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    if (isNewBest) {
      this.tweens.add({
        targets: bestText,
        scale: { from: 0.8, to: 1.1 },
        duration: 500,
        yoyo: true,
        repeat: -1,
      });
    }

    const retryBtn = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 90, '[ TENTAR NOVAMENTE ]', {
      fontSize: '24px',
      color: '#66bb6a',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    retryBtn.on('pointerover', () => { retryBtn.setScale(1.1); retryBtn.setColor('#ffffff'); });
    retryBtn.on('pointerout', () => { retryBtn.setScale(1); retryBtn.setColor('#66bb6a'); });
    retryBtn.on('pointerdown', () => {
      resetGameState(this.registry);
      this.scene.start('CharacterSelectScene');
    });

    const menuBtn = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 130, '[ MENU PRINCIPAL ]', {
      fontSize: '18px',
      color: '#90caf9',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    menuBtn.on('pointerover', () => { menuBtn.setColor('#ffffff'); menuBtn.setScale(1.05); });
    menuBtn.on('pointerout', () => { menuBtn.setColor('#90caf9'); menuBtn.setScale(1); });
    menuBtn.on('pointerdown', () => this.scene.start('TitleScene'));

    this.input.keyboard?.on('keydown-ENTER', () => {
      resetGameState(this.registry);
      this.scene.start('CharacterSelectScene');
    });
  }

  shutdown(): void {
    this.input.keyboard?.removeAllListeners();
  }
}
