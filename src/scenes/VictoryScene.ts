import { GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { AudioManager } from '../systems/AudioManager';
import { resetGameState } from '../systems/GameStateUtils';
import { CHARACTERS } from '../data/characters';

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'VictoryScene' });
  }

  create(): void {
    AudioManager.getInstance().playVictoryMusic();
    this.cameras.main.setBackgroundColor(0x1a2e1a);
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // Register shutdown cleanup
    this.events.once('shutdown', this.shutdown, this);

    const score = this.registry.get('score') || 0;
    const coins = this.registry.get('coins') || 0;
    const charName = this.registry.get('selectedCharacter') || 'Angelina';
    const bestScore = parseInt(localStorage.getItem('cpm-best-score') || '0', 10);
    const isNewBest = score > bestScore;
    if (isNewBest) {
      localStorage.setItem('cpm-best-score', String(score));
    }

    // Title
    this.add.text(GAME_WIDTH / 2, 50, 'PARABÉNS!', {
      fontSize: '42px',
      color: '#4caf50',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    const charImg = this.add.image(GAME_WIDTH / 2, 150, `char-${charName}`);
    const imgScale = 100 / Math.max(charImg.width, charImg.height);
    charImg.setScale(imgScale);

    // Character-specific victory phrase
    const charData = CHARACTERS.find(c => c.name === charName);
    const victoryPhrase = charData?.victoryPhrase || 'Vitória!';

    // Victory message
    this.add.text(GAME_WIDTH / 2, 220, [
      `"${victoryPhrase}"`,
      '',
      `${charName} derrotou o Monstro de Lata!`,
      'Mas a Muda de Ouro está em outro pavilhão...',
      '',
      'A luta contra a poluição continua!',
    ].join('\n'), {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'Arial',
      align: 'center',
      lineSpacing: 4,
    }).setOrigin(0.5);

    // Animated Stats
    const statsY = 330;
    const scoreLabel = this.add.text(GAME_WIDTH / 2 - 80, statsY, 'Pontuação:', {
      fontSize: '16px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(1, 0.5).setAlpha(0);

    const scoreValue = this.add.text(GAME_WIDTH / 2 - 70, statsY, '0', {
      fontSize: '20px', color: '#ffeb3b', fontFamily: 'Arial', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0, 0.5).setAlpha(0);

    const coinLabel = this.add.text(GAME_WIDTH / 2 - 80, statsY + 30, 'Moedas:', {
      fontSize: '16px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(1, 0.5).setAlpha(0);

    const coinValue = this.add.text(GAME_WIDTH / 2 - 70, statsY + 30, '0', {
      fontSize: '20px', color: '#ffd700', fontFamily: 'Arial', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0, 0.5).setAlpha(0);

    // Animate stats appearing and counting up
    this.time.delayedCall(800, () => {
      this.tweens.add({ targets: [scoreLabel, scoreValue], alpha: 1, duration: 300 });
      // Count-up animation for score
      this.tweens.addCounter({
        from: 0, to: score, duration: 1500, ease: 'Cubic.easeOut',
        onUpdate: (tween) => { scoreValue.setText(String(Math.floor((tween.getValue() ?? 0)))); },
      });
    });

    this.time.delayedCall(1200, () => {
      this.tweens.add({ targets: [coinLabel, coinValue], alpha: 1, duration: 300 });
      this.tweens.addCounter({
        from: 0, to: coins, duration: 800, ease: 'Cubic.easeOut',
        onUpdate: (tween) => { coinValue.setText(String(Math.floor((tween.getValue() ?? 0)))); },
      });
    });

    // Best score display
    const bestDisplay = this.add.text(GAME_WIDTH / 2, statsY + 65,
      isNewBest ? 'NOVO RECORDE!' : `Recorde: ${bestScore}`, {
      fontSize: isNewBest ? '18px' : '14px',
      color: isNewBest ? '#ff9800' : '#888888',
      fontFamily: 'Arial', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setAlpha(0);

    this.time.delayedCall(1800, () => {
      this.tweens.add({ targets: bestDisplay, alpha: 1, duration: 300 });
      if (isNewBest) {
        this.tweens.add({
          targets: bestDisplay, scale: { from: 0.8, to: 1.1 },
          duration: 500, yoyo: true, repeat: -1,
        });
      }
    });

    // Particle celebration
    for (let i = 0; i < 20; i++) {
      const leaf = this.add.image(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(-50, 0),
        'particle-leaf'
      ).setScale(2).setAlpha(0.8);

      this.tweens.add({
        targets: leaf,
        x: leaf.x + Phaser.Math.Between(-80, 80),
        y: GAME_HEIGHT + 20,
        angle: Phaser.Math.Between(-360, 360),
        duration: Phaser.Math.Between(2000, 5000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000),
        onRepeat: () => {
          leaf.x = Phaser.Math.Between(0, GAME_WIDTH);
          leaf.y = -20;
        },
      });
    }

    // Buttons
    const playAgainBtn = this.add.text(GAME_WIDTH / 2, 390, '[ JOGAR NOVAMENTE ]', {
      fontSize: '20px',
      color: '#4caf50',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    playAgainBtn.on('pointerover', () => playAgainBtn.setScale(1.1));
    playAgainBtn.on('pointerout', () => playAgainBtn.setScale(1));
    playAgainBtn.on('pointerdown', () => {
      resetGameState(this.registry);
      this.scene.start('CharacterSelectScene');
    });

    const menuBtn = this.add.text(GAME_WIDTH / 2, 425, '[ MENU PRINCIPAL ]', {
      fontSize: '14px',
      color: '#90caf9',
      fontFamily: 'Arial',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    menuBtn.on('pointerover', () => menuBtn.setColor('#ffffff'));
    menuBtn.on('pointerout', () => menuBtn.setColor('#90caf9'));
    menuBtn.on('pointerdown', () => this.scene.start('TitleScene'));
  }

  shutdown(): void {
    this.tweens.killAll();
  }
}
