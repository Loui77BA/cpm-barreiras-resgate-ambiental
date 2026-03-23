import { Enemy } from './Enemy';

export class GoombaLixo extends Enemy {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy-goomba-0');
    this.speed = 40;
    this.scoreValue = 100;
    this.frameKeys = ['enemy-goomba-0', 'enemy-goomba-1'];
    this.body.setVelocityX(-this.speed);
    this.body.setBounce(0);
    this.body.setSize(24, 24);
    this.body.setOffset(4, 4);
  }

  stomp(): void {
    super.stomp();
    this.sprite.setTexture('enemy-goomba-flat');
    this.sprite.y += 10;
    this.scene.time.delayedCall(500, () => {
      if (this.sprite.active) this.sprite.destroy();
    });
  }
}
