import { PLAYER_SPEED, PLAYER_RUN_SPEED, PLAYER_JUMP, COINS_FOR_LIFE, GAME_HEIGHT, INVINCIBILITY_DURATION, DAMAGE_INVINCIBILITY_DURATION, POWER_GROW_SCALE, PROJECTILE_SPEED, PROJECTILE_LIFETIME, SHOOT_COOLDOWN } from '../constants';
import { PowerState, PlayerState } from '../types';
import { InputManager } from '../systems/InputManager';
import { AnimationHelper } from '../systems/AnimationHelper';
import { AudioManager } from '../systems/AudioManager';

export class Player {
  public sprite: Phaser.Physics.Arcade.Sprite;
  public body: Phaser.Physics.Arcade.Body;
  public state: PlayerState = 'idle';
  public powerState: PowerState = 'small';
  public isInvincibleFrames = false;
  public isDead = false;
  public platformVelocityX = 0;

  private scene: Phaser.Scene;
  private input: InputManager;
  private anim: AnimationHelper;
  private invincibleTimer?: Phaser.Time.TimerEvent;
  private invincibleFlashTimer?: Phaser.Time.TimerEvent;
  private canShoot = true;
  private shootCooldown = SHOOT_COOLDOWN;
  public invincibleTimeLeft = 0;
  private jumpHeld = false;
  private jumpReleased = true;
  public facingRight = true;
  private isOnFlagPole = false;
  private prevPowerState: PowerState = 'small';
  private coyoteTime = 0;
  private coyoteMax = 80; // ms
  private jumpBufferTime = 0;
  private jumpBufferMax = 100; // ms
  private wasInAir = false;
  private footstepAccum = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, input: InputManager) {
    this.scene = scene;
    this.input = input;

    const charName = scene.registry.get('selectedCharacter') || 'Angelina';
    this.sprite = scene.physics.add.sprite(x, y, `char-${charName}`);

    // Scale character to game size
    const targetHeight = 40;
    const scale = targetHeight / this.sprite.height;
    this.sprite.setScale(scale);
    this.sprite.setDepth(10);

    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setSize(this.sprite.width * 0.5, this.sprite.height * 0.85);
    this.body.setOffset(this.sprite.width * 0.25, this.sprite.height * 0.15);
    this.body.setCollideWorldBounds(false);
    this.body.setMaxVelocityX(PLAYER_RUN_SPEED);

    this.anim = new AnimationHelper(scene, this.sprite);

    // Restore power state
    const savedPower = scene.registry.get('powerState') as PowerState;
    if (savedPower && savedPower !== 'small') {
      this.powerState = savedPower === 'invincible' ? 'small' : savedPower;
      if (this.powerState !== 'small') {
        this.applyPowerVisuals();
      }
    }
  }

  update(): void {
    if (this.isDead || this.isOnFlagPole) return;

    // Fall death
    if (this.sprite.y > GAME_HEIGHT + 50) {
      this.die();
      return;
    }

    // Clamp X to world bounds (prevent walking off side edges)
    const worldBounds = this.scene.physics.world.bounds;
    const halfWidth = this.body.width / 2;
    if (this.sprite.x < worldBounds.left + halfWidth) {
      this.sprite.x = worldBounds.left + halfWidth;
      this.body.setVelocityX(0);
    } else if (this.sprite.x > worldBounds.right - halfWidth) {
      this.sprite.x = worldBounds.right - halfWidth;
      this.body.setVelocityX(0);
    }

    const onGround = this.body.blocked.down;
    const speed = this.input.run ? PLAYER_RUN_SPEED : PLAYER_SPEED;
    const dt = this.scene.game.loop.delta;

    // Track invincibility countdown
    if (this.invincibleTimeLeft > 0) {
      this.invincibleTimeLeft -= dt;
    }

    // Landing squash effect
    if (onGround && this.wasInAir) {
      this.anim.squashOnLand();
    }
    this.wasInAir = !onGround;

    // Coyote time tracking
    if (onGround) {
      this.coyoteTime = this.coyoteMax;
    } else {
      this.coyoteTime -= dt;
    }

    // Jump buffer: remember jump press briefly
    if (this.input.jump && this.jumpReleased) {
      this.jumpBufferTime = this.jumpBufferMax;
    } else {
      this.jumpBufferTime -= dt;
    }

    // Horizontal movement with gradual acceleration
    const dtSec = dt / 1000;
    const accel = onGround ? 1200 : 800; // px/s² — ground has more grip than air
    if (this.input.left) {
      const vx = Math.max(this.body.velocity.x - accel * dtSec, -speed);
      this.body.setVelocityX(vx);
      this.facingRight = false;
      this.anim.setDirection(false);
    } else if (this.input.right) {
      const vx = Math.min(this.body.velocity.x + accel * dtSec, speed);
      this.body.setVelocityX(vx);
      this.facingRight = true;
      this.anim.setDirection(true);
    } else {
      // Deceleration (frame-rate independent)
      const dampFactor = Math.pow(0.001, dt / 1000);
      if (Math.abs(this.body.velocity.x) > 10) {
        this.body.setVelocityX(this.body.velocity.x * dampFactor);
      } else {
        this.body.setVelocityX(0);
      }
    }

    // Jump (with coyote time and jump buffer)
    const canJump = this.coyoteTime > 0 && this.jumpBufferTime > 0 && this.jumpReleased;
    if (canJump) {
      this.body.setVelocityY(PLAYER_JUMP);
      // Inherit platform horizontal velocity on jump
      if (this.platformVelocityX !== 0) {
        this.body.setVelocityX(this.body.velocity.x + this.platformVelocityX * 0.5);
        this.platformVelocityX = 0;
      }
      this.jumpHeld = true;
      this.jumpReleased = false;
      this.coyoteTime = 0;
      this.jumpBufferTime = 0;
      AudioManager.getInstance().playJump();
    }

    // Variable jump height
    if (!this.input.jump) {
      this.jumpReleased = true;
      if (this.jumpHeld && this.body.velocity.y < 0) {
        this.body.setVelocityY(this.body.velocity.y * 0.6);
        this.jumpHeld = false;
      }
    }

    // Shoot projectile
    if (this.input.shoot && this.powerState === 'fire' && this.canShoot) {
      this.shootProjectile();
    }

    // Update animation state
    const isBig = this.powerState !== 'small';
    if (onGround) {
      if (Math.abs(this.body.velocity.x) > 10) {
        this.anim.setState('walking', isBig);
        this.state = 'walking';
        // Footstep sounds
        this.footstepAccum += dt;
        const stepInterval = this.input.run ? 180 : 280; // ms
        if (this.footstepAccum >= stepInterval) {
          this.footstepAccum = 0;
          AudioManager.getInstance().playFootstep();
        }
      } else {
        this.anim.setState('idle', isBig);
        this.state = 'idle';
        this.footstepAccum = 0;
      }
    } else {
      this.footstepAccum = 0;
      if (this.body.velocity.y < 0) {
        this.anim.setState('jumping', isBig);
        this.state = 'jumping';
      } else {
        this.anim.setState('falling', isBig);
        this.state = 'falling';
      }
    }
  }

  collectCoin(): void {
    let coins = this.scene.registry.get('coins') as number;
    let score = this.scene.registry.get('score') as number;
    coins++;
    score += 50;

    if (coins >= COINS_FOR_LIFE) {
      coins -= COINS_FOR_LIFE;
      this.addLife();
      AudioManager.getInstance().play1Up();
    }

    this.scene.registry.set('coins', coins);
    this.scene.registry.set('score', score);
    this.scene.events.emit('coinCollected');
    this.scene.events.emit('scoreChanged');
  }

  addLife(): void {
    let lives = this.scene.registry.get('lives') as number;
    lives++;
    this.scene.registry.set('lives', lives);
    this.scene.events.emit('livesChanged');
  }

  addScore(points: number): void {
    let score = this.scene.registry.get('score') as number;
    score += points;
    this.scene.registry.set('score', score);
    this.scene.events.emit('scoreChanged');
  }

  powerUp(type: 'recycle' | 'ipe' | 'solar'): void {
    if (type === 'solar') {
      this.enableInvincibility();
      return;
    }

    if (type === 'recycle') {
      if (this.powerState === 'small') {
        this.powerState = 'big';
        this.anim.grow();
        this.updateHitboxForPowerState();
      }
      // If already big or fire, just give points (no downgrade)
    } else if (type === 'ipe') {
      if (this.powerState === 'small') {
        this.anim.grow();
      }
      this.powerState = 'fire';
      this.sprite.setTint(0xccffcc);
      this.updateHitboxForPowerState();
    }

    this.scene.registry.set('powerState', this.powerState);
    this.addScore(200);
  }

  private enableInvincibility(): void {
    // Save current power state before overwriting (never save 'invincible')
    if (this.powerState !== 'invincible') {
      this.prevPowerState = this.powerState;
    }
    this.powerState = 'invincible';
    this.isInvincibleFrames = true;

    this.invincibleFlashTimer?.destroy();
    this.invincibleFlashTimer = this.anim.flashInvincible();

    this.invincibleTimeLeft = INVINCIBILITY_DURATION;
    this.invincibleTimer?.destroy();
    this.invincibleTimer = this.scene.time.delayedCall(INVINCIBILITY_DURATION, () => {
      this.anim.clearInvincible();
      this.isInvincibleFrames = false;
      this.invincibleTimeLeft = 0;
      this.invincibleFlashTimer?.destroy();
      // Revert to saved power state
      this.powerState = this.prevPowerState;
      this.scene.registry.set('powerState', this.powerState);
    });

    this.addScore(300);
  }

  takeDamage(): void {
    if (this.isInvincibleFrames || this.isDead) return;

    if (this.powerState === 'fire' || this.powerState === 'big') {
      this.powerState = 'small';
      this.scene.registry.set('powerState', 'small');
      this.anim.shrink();
      this.sprite.clearTint();
      this.updateHitboxForPowerState();
      this.isInvincibleFrames = true;
      this.anim.flashDamage();
      AudioManager.getInstance().playDamage();
      this.scene.time.delayedCall(DAMAGE_INVINCIBILITY_DURATION, () => {
        this.isInvincibleFrames = false;
      });
    } else {
      this.die();
    }
  }

  die(): void {
    if (this.isDead) return;
    this.isDead = true;
    this.state = 'dead';

    AudioManager.getInstance().stopMusic(true);
    AudioManager.getInstance().playDeath();

    // Make body non-interactive but keep physics working for death animation
    this.body.setVelocity(0, 0);
    this.body.setAllowGravity(false);
    // Shrink body to zero so no overlaps/collisions trigger, but body stays enabled for tween
    this.body.setSize(0, 0);
    this.sprite.setDepth(100);

    // Death bounce animation using tween (more reliable than physics)
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.sprite.y - 60,
      duration: 400,
      ease: 'Quad.easeOut',
      onComplete: () => {
        // Guard against destroyed scene
        if (!this.scene || !this.scene.tweens) return;
        // Fall down using tween instead of physics (avoids disabled body issues)
        this.scene.tweens.add({
          targets: this.sprite,
          y: GAME_HEIGHT + 100,
          duration: 800,
          ease: 'Quad.easeIn',
        });
      },
    });

    let lives = this.scene.registry.get('lives') as number;
    lives--;
    this.scene.registry.set('lives', lives);
    this.scene.registry.set('powerState', 'small');

    // Stop the HUD timer
    const hudScene = this.scene.scene.get('HUDScene');
    hudScene?.events.emit('stopTimer');

    this.scene.time.delayedCall(2000, () => {
      if (lives <= 0) {
        this.scene.scene.stop('HUDScene');
        this.scene.scene.start('GameOverScene');
      } else {
        const currentLevel = this.scene.registry.get('currentLevel') as number;
        this.scene.scene.stop('HUDScene');
        this.scene.scene.start('LevelTransitionScene', { levelIndex: currentLevel });
      }
    });
  }

  startFlagPole(flagPoleX: number, flagPoleBottom: number): void {
    this.isOnFlagPole = true;
    this.body.setVelocity(0, 0);
    this.body.setAllowGravity(false);

    // Calculate score bonus based on height
    const heightBonus = Math.max(0, Math.floor((flagPoleBottom - this.sprite.y) * 2));
    this.addScore(heightBonus);

    // Slide down animation
    this.sprite.x = flagPoleX;
    this.scene.tweens.add({
      targets: this.sprite,
      y: flagPoleBottom - 20,
      duration: 1000,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.body.setAllowGravity(true);
        // Walk to the right
        this.scene.tweens.add({
          targets: this.sprite,
          x: this.sprite.x + 100,
          duration: 1000,
          onComplete: () => {
            this.scene.events.emit('levelComplete');
          },
        });
      },
    });
  }

  private shootProjectile(): void {
    this.canShoot = false;
    const dir = this.facingRight ? 1 : -1;
    const textureKey = 'projectile-water';

    const projectile = this.scene.physics.add.sprite(
      this.sprite.x + dir * 20,
      this.sprite.y - 5,
      textureKey
    );
    projectile.setVelocityX(dir * PROJECTILE_SPEED);
    projectile.setVelocityY(-50);
    projectile.setBounce(0.5);
    (projectile.body as Phaser.Physics.Arcade.Body).setAllowGravity(true);
    projectile.setData('isProjectile', true);
    projectile.setDepth(5);

    // Destroy after distance or time
    this.scene.time.delayedCall(PROJECTILE_LIFETIME, () => {
      if (projectile.active) projectile.destroy();
    });

    this.scene.time.delayedCall(this.shootCooldown, () => {
      this.canShoot = true;
    });

    this.scene.events.emit('projectileCreated', projectile);
  }

  private updateHitboxForPowerState(): void {
    if (this.powerState === 'small') {
      this.body.setSize(this.sprite.width * 0.5, this.sprite.height * 0.85);
      this.body.setOffset(this.sprite.width * 0.25, this.sprite.height * 0.15);
    } else {
      // big, fire, invincible — scale hitbox to match the visual grow
      this.body.setSize(this.sprite.width * 0.5, this.sprite.height * 0.85 * POWER_GROW_SCALE);
      this.body.setOffset(this.sprite.width * 0.25, this.sprite.height * 0.15);
    }
  }

  private applyPowerVisuals(): void {
    if (this.powerState === 'big') {
      const scale = this.sprite.scaleY * POWER_GROW_SCALE;
      this.sprite.setScale(Math.abs(this.sprite.scaleX) * POWER_GROW_SCALE, scale);
    } else if (this.powerState === 'fire') {
      const scale = this.sprite.scaleY * POWER_GROW_SCALE;
      this.sprite.setScale(Math.abs(this.sprite.scaleX) * POWER_GROW_SCALE, scale);
      this.sprite.setTint(0xccffcc);
    }
  }

  destroy(): void {
    this.anim.destroy();
    this.invincibleTimer?.destroy();
    this.invincibleFlashTimer?.destroy();
  }
}
