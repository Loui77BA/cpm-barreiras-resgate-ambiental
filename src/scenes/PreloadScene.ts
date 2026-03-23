import { SpriteGenerator } from '../systems/SpriteGenerator';
import { CHARACTER_NAMES, GAME_WIDTH, GAME_HEIGHT } from '../constants';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    // Loading bar
    const barW = 400;
    const barH = 30;
    const barX = (GAME_WIDTH - barW) / 2;
    const barY = GAME_HEIGHT / 2;

    const bg = this.add.graphics();
    bg.fillStyle(0x222222);
    bg.fillRect(barX, barY, barW, barH);

    const bar = this.add.graphics();
    this.load.on('progress', (value: number) => {
      bar.clear();
      bar.fillStyle(0x4caf50);
      bar.fillRect(barX + 4, barY + 4, (barW - 8) * value, barH - 8);
    });

    const loadingText = this.add.text(GAME_WIDTH / 2, barY - 30, 'Carregando...', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    this.load.on('complete', () => {
      bar.destroy();
      bg.destroy();
      loadingText.destroy();
    });

    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      console.warn(`Falha ao carregar: ${file.key} (${file.url})`);
    });

    // Load character images
    for (const name of CHARACTER_NAMES) {
      this.load.image(`char-${name}`, `imagens/personagens/${name}.png`);
    }

    // Load scenario backgrounds
    this.load.image('cenario1', 'imagens/cenarios/cenario1.png');
    this.load.image('cenario2', 'imagens/cenarios/cenario2.png');
    this.load.image('cenario3', 'imagens/cenarios/cenario3.png');
  }

  create(): void {
    // Generate all programmatic sprites
    const generator = new SpriteGenerator(this);
    generator.generateAll();

    // Apply NEAREST (pixel-art) filtering to all generated textures,
    // but keep loaded images (characters, scenarios) at LINEAR for smooth display
    const linearKeys = new Set<string>();
    for (const name of CHARACTER_NAMES) {
      linearKeys.add(`char-${name}`);
    }
    linearKeys.add('cenario1');
    linearKeys.add('cenario2');
    linearKeys.add('cenario3');

    this.textures.each((texture) => {
      const key = texture.key;
      if (key === '__DEFAULT' || key === '__MISSING' || key === '__WHITE') return;
      if (!linearKeys.has(key)) {
        texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
      }
    }, this);

    // Initialize game state
    this.registry.set('lives', 3);
    this.registry.set('score', 0);
    this.registry.set('coins', 0);
    this.registry.set('currentLevel', 0);
    this.registry.set('powerState', 'small');
    this.registry.set('selectedCharacter', 'Angelina');

    this.scene.start('TitleScene');
  }
}
