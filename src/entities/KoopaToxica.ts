import { Enemy } from './Enemy';
import { SHELL_KICK_SPEED } from '../constants';

export class KoopaToxica extends Enemy {
  public isShell = false;
  public shellMoving = false;
  private isFlying: boolean;
  private baseY = 0;
  private flyTime = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, flying = false) {
    super(scene, x, y, 'enemy-koopa-0');
    this.speed = 50;
    this.scoreValue = 200;
    this.frameKeys = ['enemy-koopa-0', 'enemy-koopa-1'];
    this.isFlying = flying;
    this.baseY = y;

    this.body.setVelocityX(-this.speed);
    this.body.setBounce(0);
    this.body.setSize(24, 24);
    this.body.setOffset(4, 4);

    if (flying) {
      this.body.setAllowGravity(false);
    }
  }

  update(time: number, delta: number): void {
    if (!this.isAlive) {
      if (this.isShell && this.shellMoving) {
        // Shell moving logic
        if (this.body.blocked.left || this.body.blocked.right) {
          this.body.setVelocityX(-this.body.velocity.x);
        }
      }
      // Offscreen cleanup (same check as Enemy.update)
      if (this.sprite.active && this.sprite.y > this.OFFSCREEN_Y) {
        this.sprite.destroy();
      }
      return;
    }

    // Flying sine wave motion
    if (this.isFlying) {
      this.flyTime += delta * 0.003;
      this.sprite.y = this.baseY + Math.sin(this.flyTime) * 40;
    }

    super.update(time, delta);
  }

  stomp(): void {
    if (this.isShell && !this.shellMoving) {
      // Kick the shell
      this.shellMoving = true;
      this.body.setEnable(true);
      return;
    }

    if (this.isShell && this.shellMoving) {
      // Stop the shell
      this.shellMoving = false;
      this.body.setVelocityX(0);
      return;
    }

    // Become shell
    this.isAlive = false;
    this.isShell = true;
    this.shellMoving = false;
    this.isFlying = false;
    this.sprite.setTexture('enemy-koopa-shell');
    this.body.setVelocityX(0);
    this.body.setVelocityY(0);
    this.body.setAllowGravity(true);
    this.frameKeys = [];
  }

  kick(directionRight: boolean): void {
    if (this.isShell) {
      this.shellMoving = true;
      this.body.setVelocityX(directionRight ? SHELL_KICK_SPEED : -SHELL_KICK_SPEED);
      this.body.setEnable(true);
    }
  }
}
