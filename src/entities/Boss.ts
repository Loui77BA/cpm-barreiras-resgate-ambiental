export class Boss {
  public sprite: Phaser.Physics.Arcade.Sprite;
  public body: Phaser.Physics.Arcade.Body;
  public isAlive = true;

  private scene: Phaser.Scene;
  private phase = 1;
  private moveDir = -1;
  private speed = 60;
  private shootTimer?: Phaser.Time.TimerEvent;
  private projectiles: Phaser.Physics.Arcade.Group;
  private minX: number;
  private maxX: number;

  constructor(scene: Phaser.Scene, x: number, y: number, minX: number, maxX: number) {
    this.scene = scene;
    this.minX = minX;
    this.maxX = maxX;

    this.sprite = scene.physics.add.sprite(x, y, 'boss-lata');
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setSize(56, 56);
    this.body.setOffset(4, 8);
    this.body.setImmovable(true);
    this.body.setAllowGravity(false);
    this.sprite.setDepth(5);

    this.projectiles = scene.physics.add.group();

    // Start shooting
    this.startShooting();
  }

  update(delta: number = 16): void {
    if (!this.isAlive) return;

    // Move back and forth (frame-rate independent)
    this.sprite.x += this.moveDir * this.speed * (delta / 1000);
    if (this.sprite.x <= this.minX) {
      this.moveDir = 1;
      this.sprite.setFlipX(true);
    } else if (this.sprite.x >= this.maxX) {
      this.moveDir = -1;
      this.sprite.setFlipX(false);
    }

    // Update projectiles
    this.projectiles.children.each((proj) => {
      const p = proj as Phaser.Physics.Arcade.Sprite;
      if (p.y > this.scene.physics.world.bounds.height + 50 || p.x < this.minX - 200 || p.x > this.maxX + 200) {
        p.destroy();
      }
      return true;
    });
  }

  private startShooting(): void {
    const interval = this.phase === 1 ? 2500 : this.phase === 2 ? 1800 : 1200;
    this.shootTimer?.destroy();
    this.shootTimer = this.scene.time.addEvent({
      delay: interval,
      loop: true,
      callback: () => {
        if (!this.isAlive) return;
        this.shoot();
      },
    });
  }

  private shoot(): void {
    // Telegraph: flash warning before firing
    this.sprite.setTint(0xffff00);
    this.scene.time.delayedCall(300, () => {
      if (!this.isAlive || !this.sprite.active) return;
      this.sprite.clearTint();

      const proj = this.scene.physics.add.sprite(
        this.sprite.x + this.moveDir * -30,
        this.sprite.y - 10,
        'boss-projectile'
      );
      proj.setVelocityX(this.moveDir * -150);
      proj.setVelocityY(-80);
      (proj.body as Phaser.Physics.Arcade.Body).setAllowGravity(true);
      proj.setDepth(5);
      this.projectiles.add(proj);

      // Destroy after time
      this.scene.time.delayedCall(3000, () => {
        if (proj.active) proj.destroy();
      });
    });
  }

  advancePhase(): void {
    if (this.phase >= 3) return;
    this.phase++;
    this.speed = 60 + this.phase * 20;

    // Phase transition drama: brief pause + angry flash
    const prevSpeed = this.speed;
    this.speed = 0;
    this.sprite.setTint(0xff4444);
    this.scene.cameras.main.shake(200, 0.008);

    // Flash rapidly
    let flashCount = 0;
    const flashTimer = this.scene.time.addEvent({
      delay: 80,
      repeat: 5,
      callback: () => {
        flashCount++;
        this.sprite.setTint(flashCount % 2 === 0 ? 0xff4444 : 0xff8800);
      },
    });

    this.scene.time.delayedCall(500, () => {
      this.sprite.clearTint();
      this.speed = prevSpeed;
      this.startShooting();
    });
  }

  getProjectiles(): Phaser.Physics.Arcade.Group {
    return this.projectiles;
  }

  destroy(): void {
    this.shootTimer?.destroy();
    this.projectiles.destroy(true);
    this.sprite.destroy();
  }
}
