export class Enemy {
  public sprite: Phaser.Physics.Arcade.Sprite;
  public body: Phaser.Physics.Arcade.Body;
  public isAlive = true;
  public scoreValue = 100;

  protected scene: Phaser.Scene;
  protected speed = 50;
  protected frameTimer = 0;
  protected currentFrame = 0;
  protected frameKeys: string[] = [];
  protected readonly OFFSCREEN_Y: number;

  constructor(scene: Phaser.Scene, x: number, y: number, textureKey: string) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, textureKey);
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setCollideWorldBounds(false);
    this.sprite.setDepth(5);
    this.OFFSCREEN_Y = scene.physics.world.bounds.height + 100;
  }

  update(time: number, _delta: number): void {
    if (!this.isAlive) return;

    // Animate between frames
    if (this.frameKeys.length > 1) {
      this.frameTimer += _delta;
      if (this.frameTimer > 200) {
        this.frameTimer = 0;
        this.currentFrame = (this.currentFrame + 1) % this.frameKeys.length;
        this.sprite.setTexture(this.frameKeys[this.currentFrame]);
      }
    }

    // Reverse direction at edges or walls
    if (this.body.blocked.left) {
      this.body.setVelocityX(this.speed);
      this.sprite.setFlipX(false);
    } else if (this.body.blocked.right) {
      this.body.setVelocityX(-this.speed);
      this.sprite.setFlipX(true);
    }

    // Edge detection: reverse if about to walk off a platform
    if (this.body.blocked.down) {
      const movingRight = this.body.velocity.x > 0;
      const edgeX = movingRight ? this.body.right + 4 : this.body.left - 8;
      const edgeY = this.body.bottom + 2;
      const bodies = this.scene.physics.overlapRect(edgeX, edgeY, 8, 8);
      if (bodies.length === 0) {
        this.body.setVelocityX(-this.body.velocity.x);
        this.sprite.setFlipX(this.body.velocity.x < 0);
      }
    }

    // Destroy if fallen off screen
    if (this.sprite.y > this.OFFSCREEN_Y) {
      this.sprite.destroy();
      this.isAlive = false;
    }
  }

  stomp(): void {
    this.isAlive = false;
    this.body.setVelocity(0, 0);
    this.body.setAllowGravity(false);
    this.body.setEnable(false);
  }

  hitByProjectile(): void {
    this.isAlive = false;
    // Flip and fall
    this.sprite.setFlipY(true);
    this.body.setVelocityY(-200);
    this.scene.time.delayedCall(1000, () => {
      if (this.sprite.active) this.sprite.destroy();
    });
  }

  destroy(): void {
    if (this.sprite.active) this.sprite.destroy();
  }
}
