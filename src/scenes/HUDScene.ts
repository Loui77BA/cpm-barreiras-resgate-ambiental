import { GAME_WIDTH, INVINCIBILITY_DURATION } from '../constants';
import { Player } from '../entities/Player';
import { AudioManager } from '../systems/AudioManager';

export class HUDScene extends Phaser.Scene {
  private scoreText!: Phaser.GameObjects.Text;
  private coinText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private invincibleBar?: Phaser.GameObjects.Graphics;
  private invincibleLabel?: Phaser.GameObjects.Text;
  private timeRemaining = 300;
  private timerEvent?: Phaser.Time.TimerEvent;
  private parentSceneKey = '';
  private registryCallback?: () => void;

  constructor() {
    super({ key: 'HUDScene' });
  }

  init(data: { timeLimit?: number; levelName?: string; parentScene?: string }): void {
    this.timeRemaining = data.timeLimit || 300;
    this.parentSceneKey = data.parentScene || '';
  }

  create(data: { timeLimit?: number; levelName?: string }): void {
    // Semi-transparent background bar for better readability
    const hudBg = this.add.graphics();
    hudBg.fillStyle(0x000000, 0.55);
    hudBg.fillRoundedRect(4, 4, GAME_WIDTH - 8, 36, 6);

    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '15px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    };

    // Score
    this.add.text(16, 7, 'CPM', { ...style, fontSize: '10px', color: '#66bb6a' });
    this.scoreText = this.add.text(16, 21, '000000', style);

    // Coins
    this.add.image(GAME_WIDTH / 2 - 40, 18, 'coin-0').setScale(1.4);
    this.coinText = this.add.text(GAME_WIDTH / 2 - 22, 12, 'x00', style);

    // Lives
    this.add.image(GAME_WIDTH / 2 + 50, 18, 'ui-heart').setScale(1.4);
    this.livesText = this.add.text(GAME_WIDTH / 2 + 66, 12, 'x3', style);

    // Level name
    this.levelText = this.add.text(GAME_WIDTH - 130, 7, data.levelName || '1-1', {
      ...style, fontSize: '11px', color: '#fff176'
    });

    // Time
    this.add.text(GAME_WIDTH - 130, 21, 'TEMPO', { ...style, fontSize: '10px' });
    this.timeText = this.add.text(GAME_WIDTH - 78, 21, '300', style);

    // Invincibility bar (hidden by default)
    this.invincibleBar = this.add.graphics();
    this.invincibleLabel = this.add.text(GAME_WIDTH / 2, 42, '', {
      fontSize: '9px',
      color: '#ffeb3b',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.updateDisplay();

    // Timer countdown
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.timeRemaining--;
        this.timeText.setText(String(this.timeRemaining));
        if (this.timeRemaining <= 0) {
          // Time's up - kill player
          this.events.emit('timeUp');
          if (this.parentSceneKey) {
            const parentScene = this.scene.get(this.parentSceneKey);
            parentScene?.events.emit('timeUp');
          }
        }
        if (this.timeRemaining <= 60) {
          this.timeText.setColor('#ff4444');
          // Audio escalation
          if (this.timeRemaining <= 10) {
            AudioManager.getInstance().playTimeTick(true);
            // Pulse text at critical time
            this.tweens.add({
              targets: this.timeText,
              scale: 1.3,
              duration: 100,
              yoyo: true,
            });
          } else if (this.timeRemaining <= 30 && this.timeRemaining % 2 === 0) {
            AudioManager.getInstance().playTimeTick(false);
          } else if (this.timeRemaining <= 60 && this.timeRemaining % 5 === 0) {
            AudioManager.getInstance().playTimeTick(false);
          }
        }
      },
    });

    // Listen for game events from any active scene
    this.registryCallback = () => this.updateDisplay();
    this.registry.events.on('changedata', this.registryCallback);

    // Listen for stop timer event (level complete / boss defeated)
    this.events.off('stopTimer');
    this.events.on('stopTimer', () => {
      this.timerEvent?.destroy();
      this.timerEvent = undefined;
    });

    // Register shutdown cleanup
    this.events.off('shutdown', this.shutdown, this);
    this.events.once('shutdown', this.shutdown, this);
  }

  update(): void {
    if (!this.parentSceneKey || !this.invincibleBar) return;
    const parentScene = this.scene.get(this.parentSceneKey) as any;
    const player: Player | undefined = parentScene?.player;
    if (player && player.invincibleTimeLeft > 0) {
      const pct = Math.max(0, player.invincibleTimeLeft / INVINCIBILITY_DURATION);
      const barW = 120;
      const barH = 6;
      const barX = GAME_WIDTH / 2 - barW / 2;
      const barY = 44;
      this.invincibleBar.clear();
      this.invincibleBar.fillStyle(0x333333, 0.7);
      this.invincibleBar.fillRoundedRect(barX, barY, barW, barH, 3);
      this.invincibleBar.fillStyle(0xffeb3b, 0.9);
      this.invincibleBar.fillRoundedRect(barX, barY, barW * pct, barH, 3);
      this.invincibleLabel!.setText('INVENCIVEL');
    } else {
      this.invincibleBar.clear();
      this.invincibleLabel!.setText('');
    }
  }

  private prevCoins = 0;
  private prevScore = 0;

  private updateDisplay(): void {
    const score = this.registry.get('score') as number || 0;
    const coins = this.registry.get('coins') as number || 0;
    const lives = this.registry.get('lives') as number || 0;

    this.scoreText.setText(String(score).padStart(6, '0'));
    this.coinText.setText(`x${String(coins).padStart(2, '0')}`);
    this.livesText.setText(`x${lives}`);

    // Coin counter pop animation
    if (coins > this.prevCoins) {
      this.tweens.add({
        targets: this.coinText,
        scale: { from: 1.3, to: 1 },
        duration: 200,
        ease: 'Back.easeOut',
      });
    }
    this.prevCoins = coins;

    // Score change flash
    if (score > this.prevScore) {
      this.tweens.add({
        targets: this.scoreText,
        scale: { from: 1.15, to: 1 },
        duration: 150,
      });
    }
    this.prevScore = score;
  }

  shutdown(): void {
    this.timerEvent?.destroy();
    this.events.off('stopTimer');
    if (this.registryCallback) {
      this.registry.events.off('changedata', this.registryCallback);
    }
  }
}
