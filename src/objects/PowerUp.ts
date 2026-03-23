export type PowerUpType = 'recycle' | 'ipe' | 'solar';

export class PowerUp {
  public sprite: Phaser.Physics.Arcade.Sprite;
  public type: PowerUpType;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, x: number, y: number, type: PowerUpType) {
    this.scene = scene;
    this.type = type;

    const textureMap: Record<PowerUpType, string> = {
      recycle: 'powerup-recycle',
      ipe: 'powerup-ipe',
      solar: 'powerup-solar',
    };

    this.sprite = scene.physics.add.sprite(x, y, textureMap[type]);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.sprite.setDepth(3);

    if (type === 'solar') {
      // Solar panel floats
      body.setAllowGravity(false);
      body.setImmovable(true);
      scene.tweens.add({
        targets: this.sprite,
        y: y - 8,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      // Sparkle effect
      scene.tweens.add({
        targets: this.sprite,
        alpha: { from: 1, to: 0.7 },
        duration: 200,
        yoyo: true,
        repeat: -1,
      });
    } else {
      // Rise out of block then move
      body.setAllowGravity(false);
      scene.tweens.add({
        targets: this.sprite,
        y: y - 32,
        duration: 500,
        ease: 'Quad.easeOut',
        onComplete: () => {
          body.setAllowGravity(true);
          if (type === 'recycle') {
            body.setVelocityX(60);
            body.setBounce(0);
          }
        },
      });
    }
  }

  collect(): void {
    // Kill any looping tweens before the collect animation
    this.scene.tweens.killTweensOf(this.sprite);
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.sprite.destroy();
      },
    });
  }
}
