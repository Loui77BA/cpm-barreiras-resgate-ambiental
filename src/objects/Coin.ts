export class Coin {
  public sprite: Phaser.Physics.Arcade.Sprite;
  private scene: Phaser.Scene;
  private frameTimer = 0;
  private currentFrame = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, 'coin-0');
    (this.sprite.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    (this.sprite.body as Phaser.Physics.Arcade.Body).setImmovable(true);
    this.sprite.setDepth(3);
  }

  update(delta: number): void {
    this.frameTimer += delta;
    if (this.frameTimer > 120) {
      this.frameTimer = 0;
      this.currentFrame = (this.currentFrame + 1) % 4;
      if (this.sprite.active) {
        this.sprite.setTexture(`coin-${this.currentFrame}`);
      }
    }
  }

  collect(): void {
    // Pop-up animation
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.sprite.y - 30,
      alpha: 0,
      duration: 300,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.sprite.destroy();
      },
    });
  }
}
