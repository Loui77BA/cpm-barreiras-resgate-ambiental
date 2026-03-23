import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../constants';

export class ParallaxBackground {
  private scene: Phaser.Scene;
  private layers: { image: Phaser.GameObjects.TileSprite | Phaser.GameObjects.Image; factor: number }[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  createSkyBackground(): void {
    // Blue sky gradient
    const sky = this.scene.add.graphics();
    sky.fillGradientStyle(COLORS.SKY_BLUE, COLORS.SKY_BLUE, 0x87ceeb, 0x87ceeb);
    sky.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    sky.setScrollFactor(0);
    sky.setDepth(-10);

    // Clouds
    this.createClouds();
  }

  createUndergroundBackground(): void {
    const bg = this.scene.add.graphics();
    bg.fillStyle(COLORS.UNDERGROUND_DARK);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    bg.setScrollFactor(0);
    bg.setDepth(-10);
  }

  createDarkBackground(): void {
    const bg = this.scene.add.graphics();
    bg.fillGradientStyle(0x1a0a0a, 0x1a0a0a, 0x2a1515, 0x2a1515);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    bg.setScrollFactor(0);
    bg.setDepth(-10);
  }

  createScenarioBackground(textureKey: string): void {
    // Use scenario image as background — visible but not distracting
    const img = this.scene.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, textureKey);
    const scaleX = GAME_WIDTH / img.width;
    const scaleY = GAME_HEIGHT / img.height;
    const scale = Math.max(scaleX, scaleY);
    img.setScale(scale);
    img.setScrollFactor(0.1);
    img.setAlpha(0.45);
    img.setDepth(-8);

    // Duplicate for wider levels
    const img2 = this.scene.add.image(GAME_WIDTH / 2 + GAME_WIDTH, GAME_HEIGHT / 2, textureKey);
    img2.setScale(scale);
    img2.setScrollFactor(0.1);
    img2.setAlpha(0.45);
    img2.setDepth(-8);
  }

  private createClouds(): void {
    // Programmatic clouds
    for (let i = 0; i < 6; i++) {
      const cloud = this.scene.add.graphics();
      const cx = Phaser.Math.Between(0, GAME_WIDTH);
      const cy = Phaser.Math.Between(20, 100);
      const size = Phaser.Math.Between(20, 40);

      cloud.fillStyle(0xffffff, 0.8);
      cloud.fillCircle(cx, cy, size);
      cloud.fillCircle(cx - size * 0.7, cy + 5, size * 0.7);
      cloud.fillCircle(cx + size * 0.7, cy + 5, size * 0.8);
      cloud.fillCircle(cx - size * 0.3, cy - size * 0.4, size * 0.6);
      cloud.fillCircle(cx + size * 0.3, cy - size * 0.3, size * 0.5);

      cloud.setScrollFactor(0.15);
      cloud.setDepth(-9);
    }
  }

  createForestBackground(): void {
    this.createSkyBackground();

    // Background trees
    for (let i = 0; i < 10; i++) {
      const tree = this.scene.add.graphics();
      const tx = i * 120;
      const ty = GAME_HEIGHT - 80;

      // Trunk
      tree.fillStyle(0x5d4037);
      tree.fillRect(tx + 20, ty - 60, 16, 80);

      // Foliage
      tree.fillStyle(0x2e7d32);
      tree.fillCircle(tx + 28, ty - 70, 30);
      tree.fillCircle(tx + 10, ty - 50, 24);
      tree.fillCircle(tx + 46, ty - 50, 24);

      tree.setScrollFactor(0.3);
      tree.setDepth(-7);
    }
  }
}
