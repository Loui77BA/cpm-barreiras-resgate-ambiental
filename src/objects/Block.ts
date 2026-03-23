export type BlockType = 'question' | 'brick';
export type BlockContents = 'coin' | 'recycle' | 'ipe' | 'solar' | 'none';

export class Block {
  public sprite: Phaser.Physics.Arcade.Sprite;
  public blockType: BlockType;
  public contents: BlockContents;
  public isUsed = false;

  private scene: Phaser.Scene;
  private originalY: number;

  constructor(scene: Phaser.Scene, x: number, y: number, type: BlockType, contents: BlockContents = 'none') {
    this.scene = scene;
    this.blockType = type;
    this.contents = contents;
    this.originalY = y;

    const texture = type === 'question' ? 'tile-question' : 'tile-brick';
    this.sprite = scene.physics.add.sprite(x, y, texture);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setImmovable(true);
    body.setAllowGravity(false);
    this.sprite.setDepth(2);

    if (type === 'question') {
      // Subtle animation
      scene.tweens.add({
        targets: this.sprite,
        y: y - 2,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  hit(playerIsBig: boolean): { type: string; x: number; y: number } | null {
    if (this.isUsed) return null;

    // Bump animation (always from original Y)
    this.scene.tweens.killTweensOf(this.sprite);
    this.sprite.y = this.originalY;
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.originalY - 8,
      duration: 100,
      yoyo: true,
      ease: 'Quad.easeOut',
    });

    if (this.blockType === 'question') {
      this.isUsed = true;
      this.sprite.setTexture('tile-question-used');
      // Stop the bob animation and reset to original position
      this.scene.tweens.killTweensOf(this.sprite);
      this.sprite.y = this.originalY;

      if (this.contents !== 'none') {
        return {
          type: this.contents,
          x: this.sprite.x,
          y: this.sprite.y - 32,
        };
      }
    } else if (this.blockType === 'brick') {
      if (playerIsBig) {
        // Break the brick
        this.breakBrick();
        return null;
      }
      // Small player just bumps
    }
    return null;
  }

  private breakBrick(): void {
    const x = this.sprite.x;
    const y = this.sprite.y;

    // Create break particles
    for (let i = 0; i < 4; i++) {
      const particle = this.scene.physics.add.sprite(x, y, 'particle-brick');
      const body = particle.body as Phaser.Physics.Arcade.Body;
      const xVel = (i < 2 ? -1 : 1) * Phaser.Math.Between(50, 150);
      const yVel = (i % 2 === 0 ? -250 : -200);
      body.setVelocity(xVel, yVel);
      particle.setDepth(10);

      this.scene.time.delayedCall(800, () => {
        if (particle.active) particle.destroy();
      });
    }

    this.sprite.destroy();
  }
}
