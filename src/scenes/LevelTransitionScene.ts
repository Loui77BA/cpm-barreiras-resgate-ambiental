import { GAME_WIDTH, GAME_HEIGHT, LEVEL_NAMES } from '../constants';

export class LevelTransitionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelTransitionScene' });
  }

  create(data: { levelIndex: number }): void {
    const levelIndex = data.levelIndex ?? 0;
    this.registry.set('currentLevel', levelIndex);

    this.cameras.main.setBackgroundColor(0x0a0a0a);
    this.cameras.main.fadeIn(300, 0, 0, 0);

    const levelInfo = LEVEL_NAMES[levelIndex] || { key: '1-1', title: 'Pátio Contaminado' };

    // World title
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, `MUNDO ${levelInfo.key}`, {
      fontSize: '36px',
      color: '#ffffff',
      fontFamily: 'Arial Black, Arial',
      fontStyle: 'bold',
      stroke: '#333333',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Level name
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, levelInfo.title, {
      fontSize: '20px',
      color: '#66bb6a',
      fontFamily: 'Arial',
      fontStyle: 'bold italic',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Character and lives
    const charName = this.registry.get('selectedCharacter') || 'Angelina';
    const lives = this.registry.get('lives') || 3;

    const charImg = this.add.image(GAME_WIDTH / 2 - 30, GAME_HEIGHT / 2 + 60, `char-${charName}`);
    const imgScale = 50 / Math.max(charImg.width, charImg.height);
    charImg.setScale(imgScale);

    this.add.text(GAME_WIDTH / 2 + 10, GAME_HEIGHT / 2 + 50, `x ${lives}`, {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    });

    // Transition after delay with fadeOut
    this.time.delayedCall(2000, () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(400, () => {
        const sceneKeys = ['Level1_1Scene', 'Level1_2Scene', 'Level1_3Scene', 'Level1_4Scene'];
        const targetScene = sceneKeys[levelIndex] || 'Level1_1Scene';
        this.scene.start(targetScene);
      });
    });

    this.events.once('shutdown', this.shutdown, this);
  }

  shutdown(): void {
    this.time.removeAllEvents();
  }
}
