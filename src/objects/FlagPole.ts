export class FlagPole {
  public poleSprite: Phaser.GameObjects.Image;
  public flagSprite: Phaser.GameObjects.Image;
  public triggerZone: Phaser.Physics.Arcade.Sprite;
  private scene: Phaser.Scene;
  private poleBottom: number;

  constructor(scene: Phaser.Scene, x: number, groundY: number) {
    this.scene = scene;
    this.poleBottom = groundY;

    // Pole
    this.poleSprite = scene.add.image(x, groundY - 128, 'flag-pole').setDepth(1);

    // Flag at top
    this.flagSprite = scene.add.image(x + 14, groundY - 240, 'flag').setDepth(1);

    // Invisible trigger zone
    this.triggerZone = scene.physics.add.sprite(x, groundY - 128, 'tile-invisible');
    const body = this.triggerZone.body as Phaser.Physics.Arcade.Body;
    body.setSize(16, 256);
    body.setAllowGravity(false);
    body.setImmovable(true);
    this.triggerZone.setAlpha(0);
  }

  activate(): void {
    // Flag slides down
    this.scene.tweens.add({
      targets: this.flagSprite,
      y: this.poleBottom - 30,
      duration: 1000,
      ease: 'Quad.easeIn',
    });
  }

  getBottom(): number {
    return this.poleBottom;
  }
}
