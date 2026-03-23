import { GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { AudioManager } from '../systems/AudioManager';

export class TitleScene extends Phaser.Scene {
  private audio!: AudioManager;
  private selectedOption = 0;
  private menuItems: Phaser.GameObjects.Text[] = [];
  private selector!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'TitleScene' });
  }

  create(): void {
    this.audio = AudioManager.getInstance();
    this.audio.init();

    this.selectedOption = 0;
    this.menuItems = [];

    // Register shutdown cleanup
    this.events.once('shutdown', this.shutdown, this);

    // Start title music
    this.audio.playTitleMusic();

    // Background using cenario3 (school facade with flag)
    const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'cenario3');
    const scaleX = GAME_WIDTH / bg.width;
    const scaleY = GAME_HEIGHT / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale);
    bg.setAlpha(0.5);

    // Dark overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.5);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Title
    const title = this.add.text(GAME_WIDTH / 2, 70, 'CPM BARREIRAS', {
      fontSize: '42px',
      color: '#ffffff',
      fontFamily: 'Arial Black, Arial',
      fontStyle: 'bold',
      stroke: '#2e7d32',
      strokeThickness: 6,
    }).setOrigin(0.5);

    const subtitle = this.add.text(GAME_WIDTH / 2, 120, 'O Resgate Ambiental', {
      fontSize: '26px',
      color: '#4caf50',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Narrative intro
    const intro = this.add.text(GAME_WIDTH / 2, 190, [
      'O Lorde Poluição invadiu o colégio,',
      'espalhando lixo e resíduos tóxicos!',
      'Monte o Esquadrão Verde e salve a Muda de Ouro!',
    ].join('\n'), {
      fontSize: '13px',
      color: '#cccccc',
      fontFamily: 'Arial',
      align: 'center',
      lineSpacing: 4,
    }).setOrigin(0.5);

    // ===== MENU OPTIONS =====
    const menuY = 275;
    const menuSpacing = 40;
    const menuStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    };

    const menuLabels = ['INICIAR JOGO', 'COMO JOGAR'];

    for (let i = 0; i < menuLabels.length; i++) {
      const item = this.add.text(GAME_WIDTH / 2, menuY + i * menuSpacing, menuLabels[i], menuStyle)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      item.on('pointerover', () => {
        if (this.selectedOption !== i) {
          this.selectedOption = i;
          this.updateMenu();
          this.audio.playMenuSelect();
        }
      });

      item.on('pointerdown', () => {
        this.confirmMenu();
      });

      this.menuItems.push(item);
    }

    // Selection arrow
    this.selector = this.add.text(0, 0, '▶', {
      fontSize: '20px',
      color: '#4caf50',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.updateMenu();

    // Mute toggle — visual button for mobile, text hint for desktop
    const isMobile = this.sys.game.device.os.android || this.sys.game.device.os.iOS ||
      (this.sys.game.device.input.touch && window.innerWidth < 1024);

    const muteHint = this.add.text(
      isMobile ? 50 : GAME_WIDTH - 16,
      isMobile ? GAME_HEIGHT - 30 : GAME_HEIGHT - 16,
      this.audio.muted ? '🔇' : (isMobile ? '🔊' : 'M: som'),
      {
        fontSize: isMobile ? '22px' : '10px',
        color: isMobile ? '#ffffff' : '#666666',
        fontFamily: 'Arial',
        backgroundColor: isMobile ? '#00000088' : undefined,
        padding: isMobile ? { x: 10, y: 6 } : undefined,
      }
    ).setOrigin(isMobile ? 0.5 : 1)
      .setInteractive({ useHandCursor: true });

    // Floating leaf particles
    for (let i = 0; i < 8; i++) {
      const leaf = this.add.image(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT),
        'particle-leaf'
      ).setAlpha(0.6).setScale(2);

      this.tweens.add({
        targets: leaf,
        x: leaf.x + Phaser.Math.Between(-100, 100),
        y: GAME_HEIGHT + 20,
        angle: Phaser.Math.Between(-180, 180),
        duration: Phaser.Math.Between(3000, 6000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 3000),
        onRepeat: () => {
          leaf.x = Phaser.Math.Between(0, GAME_WIDTH);
          leaf.y = -20;
        },
      });
    }

    // Keyboard input
    this.input.keyboard?.on('keydown-UP', () => {
      this.selectedOption = (this.selectedOption - 1 + menuLabels.length) % menuLabels.length;
      this.updateMenu();
      this.audio.playMenuSelect();
    });
    this.input.keyboard?.on('keydown-DOWN', () => {
      this.selectedOption = (this.selectedOption + 1) % menuLabels.length;
      this.updateMenu();
      this.audio.playMenuSelect();
    });
    this.input.keyboard?.on('keydown-ENTER', () => this.confirmMenu());
    this.input.keyboard?.on('keydown-SPACE', () => this.confirmMenu());
    muteHint.on('pointerdown', () => {
      this.audio.toggleMute();
      muteHint.setText(this.audio.muted ? '🔇' : (isMobile ? '🔊' : 'M: som'));
    });
    this.input.keyboard?.on('keydown-M', () => {
      this.audio.toggleMute();
      muteHint.setText(this.audio.muted ? '🔇' : (isMobile ? '🔊' : 'M: som'));
    });

    // Title entrance animations
    title.setAlpha(0).setY(50);
    subtitle.setAlpha(0);
    intro.setAlpha(0);
    this.menuItems.forEach(item => item.setAlpha(0));
    this.selector.setAlpha(0);

    this.tweens.add({
      targets: title,
      alpha: 1, y: 70,
      duration: 800,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Glow pulse on title
        this.tweens.add({
          targets: title,
          alpha: { from: 1, to: 0.75 },
          duration: 1500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      },
    });

    // Typewriter effect for subtitle
    const subtitleFull = subtitle.text;
    subtitle.setText('');
    this.time.delayedCall(400, () => {
      subtitle.setAlpha(1);
      let charIdx = 0;
      this.time.addEvent({
        delay: 50,
        repeat: subtitleFull.length - 1,
        callback: () => {
          charIdx++;
          subtitle.setText(subtitleFull.substring(0, charIdx));
        },
      });
    });

    this.tweens.add({
      targets: intro,
      alpha: 1,
      duration: 600,
      delay: 900,
    });
    this.tweens.add({
      targets: [...this.menuItems, this.selector],
      alpha: 1,
      duration: 500,
      delay: 1200,
    });
  }

  private updateMenu(): void {
    const menuY = 275;
    const menuSpacing = 40;

    for (let i = 0; i < this.menuItems.length; i++) {
      if (i === this.selectedOption) {
        this.menuItems[i].setColor('#4caf50');
        this.menuItems[i].setScale(1.1);
      } else {
        this.menuItems[i].setColor('#ffffff');
        this.menuItems[i].setScale(1.0);
      }
    }

    const selectedItem = this.menuItems[this.selectedOption];
    this.selector.setPosition(
      selectedItem.x - selectedItem.displayWidth / 2 - 20,
      menuY + this.selectedOption * menuSpacing
    );

    // Pulse the selector
    this.tweens.killTweensOf(this.selector);
    this.tweens.add({
      targets: this.selector,
      x: this.selector.x - 4,
      duration: 400,
      yoyo: true,
      repeat: -1,
    });
  }

  shutdown(): void {
    this.input.keyboard?.removeAllListeners();
    this.tweens.killAll();
  }

  private confirmMenu(): void {
    this.audio.playMenuConfirm();

    if (this.selectedOption === 0) {
      // Iniciar Jogo
      this.audio.stopMusic(true);
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(400, () => {
        this.scene.start('CharacterSelectScene');
      });
    } else if (this.selectedOption === 1) {
      // Como Jogar
      this.audio.stopMusic(true);
      this.scene.start('InstructionsScene');
    }
  }
}
