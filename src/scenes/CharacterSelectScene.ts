import { GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { CHARACTERS } from '../data/characters';
import { AudioManager } from '../systems/AudioManager';
import { resetGameState } from '../systems/GameStateUtils';

export class CharacterSelectScene extends Phaser.Scene {
  private selectedIndex = 0;
  private characterSprites: Phaser.GameObjects.Image[] = [];
  private nameTexts: Phaser.GameObjects.Text[] = [];
  private descText!: Phaser.GameObjects.Text;
  private selector!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'CharacterSelectScene' });
  }

  create(): void {
    this.selectedIndex = 0;
    this.characterSprites = [];
    this.nameTexts = [];

    // Register shutdown cleanup
    this.events.once('shutdown', this.shutdown, this);

    // Background
    this.cameras.main.setBackgroundColor(0x1a1a2e);
    this.cameras.main.fadeIn(300, 0, 0, 0);

    // Title
    this.add.text(GAME_WIDTH / 2, 30, 'ESCOLHA SEU HERÓI', {
      fontSize: '28px',
      color: '#4caf50',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Character cards
    const startX = 80;
    const spacing = (GAME_WIDTH - 160) / (CHARACTERS.length - 1);

    for (let i = 0; i < CHARACTERS.length; i++) {
      const x = startX + i * spacing;
      const y = 190;

      const img = this.add.image(x, y, CHARACTERS[i].imageKey);
      const imgScale = 130 / Math.max(img.width, img.height);
      img.setScale(imgScale);
      this.characterSprites.push(img);

      // Name
      const name = this.add.text(x, 275, CHARACTERS[i].name, {
        fontSize: '14px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      }).setOrigin(0.5);
      this.nameTexts.push(name);

      // Click to select
      img.setInteractive({ useHandCursor: true });
      img.on('pointerdown', () => {
        this.selectedIndex = i;
        this.updateSelection();
        AudioManager.getInstance().playMenuSelect();
      });
      img.on('pointerover', () => {
        if (this.selectedIndex !== i) {
          img.setScale(imgScale * 1.1);
        }
      });
      img.on('pointerout', () => {
        if (this.selectedIndex !== i) {
          img.setScale(imgScale);
        }
      });
    }

    // Selection indicator
    this.selector = this.add.graphics();

    // Description
    this.descText = this.add.text(GAME_WIDTH / 2, 320, '', {
      fontSize: '16px',
      color: '#ffeb3b',
      fontFamily: 'Arial',
      fontStyle: 'italic',
    }).setOrigin(0.5);

    // Confirm button
    const confirmBtn = this.add.text(GAME_WIDTH / 2, 380, '[ CONFIRMAR ]', {
      fontSize: '22px',
      color: '#4caf50',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    confirmBtn.on('pointerover', () => confirmBtn.setScale(1.1));
    confirmBtn.on('pointerout', () => confirmBtn.setScale(1));
    confirmBtn.on('pointerdown', () => this.confirmSelection());

    // Back button
    const backBtn = this.add.text(GAME_WIDTH / 2, 420, '[ VOLTAR ]', {
      fontSize: '14px',
      color: '#90caf9',
      fontFamily: 'Arial',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setColor('#ffffff'));
    backBtn.on('pointerout', () => backBtn.setColor('#90caf9'));
    backBtn.on('pointerdown', () => this.scene.start('TitleScene'));

    // Keyboard controls
    this.input.keyboard?.on('keydown-LEFT', () => {
      this.selectedIndex = (this.selectedIndex - 1 + CHARACTERS.length) % CHARACTERS.length;
      this.updateSelection();
      AudioManager.getInstance().playMenuSelect();
    });
    this.input.keyboard?.on('keydown-RIGHT', () => {
      this.selectedIndex = (this.selectedIndex + 1) % CHARACTERS.length;
      this.updateSelection();
      AudioManager.getInstance().playMenuSelect();
    });
    this.input.keyboard?.on('keydown-ENTER', () => this.confirmSelection());
    this.input.keyboard?.on('keydown-SPACE', () => this.confirmSelection());
    this.input.keyboard?.on('keydown-ESC', () => this.scene.start('TitleScene'));

    this.updateSelection();
  }

  shutdown(): void {
    this.input.keyboard?.removeAllListeners();
  }

  private updateSelection(): void {
    const startX = 80;
    const spacing = (GAME_WIDTH - 160) / (CHARACTERS.length - 1);

    // Update sprites
    for (let i = 0; i < this.characterSprites.length; i++) {
      const sprite = this.characterSprites[i];
      const baseScale = 130 / Math.max(sprite.width * (1 / sprite.scaleX) * sprite.scaleX, sprite.height * (1 / sprite.scaleY) * sprite.scaleY);
      const imgScale = 130 / Math.max(
        this.textures.get(CHARACTERS[i].imageKey).getSourceImage().width,
        this.textures.get(CHARACTERS[i].imageKey).getSourceImage().height
      );

      const targetScale = i === this.selectedIndex ? imgScale * 1.15 : imgScale * 0.85;
      const targetAlpha = i === this.selectedIndex ? 1 : 0.5;
      this.tweens.add({
        targets: sprite,
        scaleX: targetScale, scaleY: targetScale, alpha: targetAlpha,
        duration: 200, ease: 'Back.easeOut',
      });
      if (i === this.selectedIndex) {
        this.nameTexts[i].setColor('#4caf50');
        this.nameTexts[i].setFontSize(16);
      } else {
        this.nameTexts[i].setColor('#888888');
        this.nameTexts[i].setFontSize(13);
      }
    }

    // Update selector
    this.selector.clear();
    const selX = startX + this.selectedIndex * spacing;
    this.selector.lineStyle(3, 0x4caf50);
    this.selector.strokeRoundedRect(selX - 55, 110, 110, 180, 8);

    // Update description
    this.descText.setText(CHARACTERS[this.selectedIndex].description);
  }

  private confirmSelection(): void {
    AudioManager.getInstance().playMenuConfirm();

    const char = CHARACTERS[this.selectedIndex];
    this.registry.set('selectedCharacter', char.name);
    resetGameState(this.registry);

    // Flash effect
    this.cameras.main.flash(500, 255, 255, 255);
    this.time.delayedCall(500, () => {
      this.scene.start('LevelTransitionScene', { levelIndex: 0 });
    });
  }
}
