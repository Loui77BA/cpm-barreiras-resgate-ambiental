import { POWER_GROW_SCALE } from '../constants';

export class AnimationHelper {
  private scene: Phaser.Scene;
  private sprite: Phaser.GameObjects.Image;
  private breathTween?: Phaser.Tweens.Tween;
  private walkTween?: Phaser.Tweens.Tween;
  private currentState = 'idle';
  private baseScaleX = 1;
  private baseScaleY = 1;
  private isTransitioning = false;

  constructor(scene: Phaser.Scene, sprite: Phaser.GameObjects.Image) {
    this.scene = scene;
    this.sprite = sprite;
    this.baseScaleX = sprite.scaleX;
    this.baseScaleY = sprite.scaleY;
  }

  setState(state: string, isBig: boolean): void {
    if (state === this.currentState || this.isTransitioning) return;
    this.clearTweens();
    this.currentState = state;

    const sizeMultiplier = isBig ? POWER_GROW_SCALE : 1;
    this.baseScaleX = Math.abs(this.baseScaleX);
    const dirScaleX = this.sprite.scaleX < 0 ? -1 : 1;

    switch (state) {
      case 'idle':
        this.sprite.setScale(
          dirScaleX * this.baseScaleX * sizeMultiplier,
          this.baseScaleY * sizeMultiplier
        );
        this.sprite.angle = 0;
        this.breathTween = this.scene.tweens.add({
          targets: this.sprite,
          scaleY: this.baseScaleY * sizeMultiplier * 1.03,
          duration: 800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
        break;

      case 'walking':
        this.sprite.setScale(
          dirScaleX * this.baseScaleX * sizeMultiplier,
          this.baseScaleY * sizeMultiplier
        );
        this.walkTween = this.scene.tweens.add({
          targets: this.sprite,
          angle: { from: -5, to: 5 },
          duration: 150,
          yoyo: true,
          repeat: -1,
        });
        this.breathTween = this.scene.tweens.add({
          targets: this.sprite,
          scaleY: { from: this.baseScaleY * sizeMultiplier, to: this.baseScaleY * sizeMultiplier * 0.95 },
          duration: 150,
          yoyo: true,
          repeat: -1,
        });
        break;

      case 'jumping':
        this.sprite.angle = -8;
        this.sprite.setScale(
          dirScaleX * this.baseScaleX * sizeMultiplier * 1.05,
          this.baseScaleY * sizeMultiplier * 0.92
        );
        break;

      case 'falling':
        this.sprite.angle = 0;
        this.sprite.setScale(
          dirScaleX * this.baseScaleX * sizeMultiplier * 0.93,
          this.baseScaleY * sizeMultiplier * 1.07
        );
        break;

      case 'dead':
        this.sprite.angle = 0;
        this.sprite.setScale(
          dirScaleX * this.baseScaleX,
          this.baseScaleY
        );
        break;
    }
  }

  setDirection(facingRight: boolean): void {
    const abs = Math.abs(this.sprite.scaleX);
    this.sprite.scaleX = facingRight ? abs : -abs;
  }

  grow(): void {
    this.isTransitioning = true;
    const targetScaleX = Math.abs(this.baseScaleX) * POWER_GROW_SCALE;
    const targetScaleY = this.baseScaleY * POWER_GROW_SCALE;
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: { from: this.sprite.scaleX * 0.8, to: (this.sprite.scaleX < 0 ? -1 : 1) * targetScaleX },
      scaleY: { from: this.sprite.scaleY * 0.8, to: targetScaleY },
      duration: 400,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.baseScaleX = targetScaleX;
        this.baseScaleY = targetScaleY;
        this.isTransitioning = false;
      },
    });
  }

  shrink(): void {
    this.isTransitioning = true;
    const targetScaleX = Math.abs(this.baseScaleX) / POWER_GROW_SCALE;
    const targetScaleY = this.baseScaleY / POWER_GROW_SCALE;
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: (this.sprite.scaleX < 0 ? -1 : 1) * targetScaleX,
      scaleY: targetScaleY,
      duration: 300,
      onComplete: () => {
        this.baseScaleX = targetScaleX;
        this.baseScaleY = targetScaleY;
        this.isTransitioning = false;
      },
    });
  }

  squashOnLand(): void {
    if (this.isTransitioning) return;
    const dirScaleX = this.sprite.scaleX < 0 ? -1 : 1;
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: dirScaleX * Math.abs(this.sprite.scaleX) * 1.12,
      scaleY: this.sprite.scaleY * 0.88,
      duration: 80,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
  }

  flashDamage(): void {
    let count = 0;
    const timer = this.scene.time.addEvent({
      delay: 80,
      repeat: 12,
      callback: () => {
        this.sprite.setAlpha(count % 2 === 0 ? 0.3 : 1);
        count++;
        if (count >= 12) {
          this.sprite.setAlpha(1);
          timer.destroy();
        }
      },
    });
  }

  flashInvincible(): Phaser.Time.TimerEvent {
    const colors = [0xff0000, 0xff8800, 0xffff00, 0x00ff00, 0x00ffff, 0xff00ff];
    let idx = 0;
    return this.scene.time.addEvent({
      delay: 100,
      repeat: -1,
      callback: () => {
        this.sprite.setTint(colors[idx % colors.length]);
        idx++;
      },
    });
  }

  clearInvincible(): void {
    this.sprite.clearTint();
  }

  private clearTweens(): void {
    this.breathTween?.stop();
    this.walkTween?.stop();
    this.breathTween = undefined;
    this.walkTween = undefined;
    this.sprite.angle = 0;
  }

  destroy(): void {
    this.clearTweens();
  }
}
