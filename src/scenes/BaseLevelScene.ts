import { TILE_SIZE, GAME_WIDTH, GAME_HEIGHT, BOSS_STOMP_THRESHOLD, ENEMY_STOMP_THRESHOLD, SHELL_KICK_SPEED, SHELL_STOMP_BOUNCE, BOSS_MAX_HITS } from '../constants';
import { LevelData } from '../types';
import { Player } from '../entities/Player';
import { GoombaLixo } from '../entities/GoombaLixo';
import { KoopaToxica } from '../entities/KoopaToxica';
import { Boss } from '../entities/Boss';
import { Coin } from '../objects/Coin';
import { Block } from '../objects/Block';
import { PowerUp, PowerUpType } from '../objects/PowerUp';
import { FlagPole } from '../objects/FlagPole';
import { InputManager } from '../systems/InputManager';
import { LevelBuilder, LevelObjects } from '../systems/LevelBuilder';
import { ParallaxBackground } from '../systems/ParallaxBackground';
import { AudioManager } from '../systems/AudioManager';

export abstract class BaseLevelScene extends Phaser.Scene {
  protected player!: Player;
  protected inputManager!: InputManager;
  protected levelObjects!: LevelObjects;
  protected levelData!: LevelData;
  protected powerUps: PowerUp[] = [];
  protected isLevelComplete = false;
  private levelIndex: number;
  private audio!: AudioManager;
  private prevPlatformPositions: Map<Phaser.Physics.Arcade.Image, { x: number; y: number }> = new Map();
  private bossHits = 0;
  private bossMaxHits = BOSS_MAX_HITS;
  private isPaused = false;
  private blockGroup!: Phaser.Physics.Arcade.StaticGroup;
  private bossDeathAnimationStarted = false;
  private comboCount = 0;
  private comboTimer?: Phaser.Time.TimerEvent;

  constructor(key: string, levelIndex: number) {
    super({ key });
    this.levelIndex = levelIndex;
  }

  protected abstract getLevelData(): LevelData;

  create(): void {
    this.isLevelComplete = false;
    this.bossDeathAnimationStarted = false;
    this.powerUps = [];
    this.levelData = this.getLevelData();
    this.audio = AudioManager.getInstance();
    this.registry.set('currentLevel', this.levelIndex);

    // Start level music
    this.audio.playLevelMusic(this.levelIndex);

    // Background
    const bg = new ParallaxBackground(this);
    if (this.levelData.background === 'underground') {
      bg.createUndergroundBackground();
    } else if (this.levelData.isDark) {
      bg.createDarkBackground();
      bg.createScenarioBackground('cenario3');
    } else if (this.levelData.background === 'cenario2') {
      bg.createForestBackground();
      bg.createScenarioBackground('cenario2');
    } else {
      bg.createSkyBackground();
      if (this.levelData.background) {
        bg.createScenarioBackground(this.levelData.background);
      }
    }

    // Build level
    const builder = new LevelBuilder(this);
    this.levelObjects = builder.build(this.levelData);

    // Input
    this.inputManager = new InputManager(this);

    // Player
    const spawnX = this.levelData.spawnPoint.x * TILE_SIZE + TILE_SIZE / 2;
    const spawnY = this.levelData.spawnPoint.y * TILE_SIZE + TILE_SIZE / 2;
    this.player = new Player(this, spawnX, spawnY, this.inputManager);

    // Camera
    const worldWidth = this.levelData.width * TILE_SIZE;
    const worldHeight = this.levelData.height * TILE_SIZE;
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(100, 50);
    this.cameras.main.fadeIn(400, 0, 0, 0);

    // Physics collisions
    this.setupCollisions();

    // HUD
    this.scene.launch('HUDScene', {
      timeLimit: this.levelData.timeLimit,
      levelName: this.levelData.name,
      parentScene: this.scene.key,
    });

    // Track initial platform positions
    for (const platform of this.levelObjects.movingPlatforms) {
      this.prevPlatformPositions.set(platform, { x: platform.x, y: platform.y });
    }

    // Remove any previous listeners to prevent accumulation on restart
    this.events.off('levelComplete');
    this.events.off('timeUp');
    this.events.off('projectileCreated');
    this.events.off('resume');
    this.events.off('shutdown', this.shutdown, this);

    // Level complete event
    this.events.on('levelComplete', () => this.onLevelComplete());
    this.events.on('timeUp', () => {
      if (!this.player.isDead) {
        this.player.die();
      }
    });

    // Listen for projectiles
    this.events.on('projectileCreated', (projectile: Phaser.Physics.Arcade.Sprite) => {
      this.audio.playShoot();
      this.setupProjectileCollisions(projectile);
    });

    // Register shutdown cleanup
    this.events.once('shutdown', this.shutdown, this);

    // Pause controls
    this.isPaused = false;
    this.input.keyboard?.on('keydown-P', () => this.togglePause());
    this.input.keyboard?.on('keydown-ESC', () => this.togglePause());

    // Resume handler (when PauseScene stops)
    this.events.on('resume', () => { this.isPaused = false; });
  }

  private togglePause(): void {
    if (this.isPaused || this.player.isDead || this.isLevelComplete) return;
    this.isPaused = true;
    this.scene.pause();
    this.scene.pause('HUDScene');
    this.scene.launch('PauseScene', { parentScene: this.scene.key });
  }

  private setupCollisions(): void {
    const { groundGroup, enemies, coins, blocks, flagPole, movingPlatforms, hazards, boss, ecoponto } = this.levelObjects;

    // Player vs ground
    this.physics.add.collider(this.player.sprite, groundGroup);

    // Player vs moving platforms
    for (const platform of movingPlatforms) {
      this.physics.add.collider(this.player.sprite, platform);
    }

    // Create groups for optimized collision pairing
    this.blockGroup = this.physics.add.staticGroup();
    const blockGroup = this.blockGroup;
    for (const block of blocks) {
      blockGroup.add(block.sprite);
    }
    const enemyGroup = this.physics.add.group();
    for (const enemy of enemies) {
      enemyGroup.add(enemy.sprite);
    }

    // Enemies vs ground, blocks, and platforms (group-level colliders)
    this.physics.add.collider(enemyGroup, groundGroup);
    this.physics.add.collider(enemyGroup, blockGroup);
    for (const platform of movingPlatforms) {
      this.physics.add.collider(enemyGroup, platform);
    }

    // Player vs enemies
    for (const enemy of enemies) {
      this.physics.add.overlap(this.player.sprite, enemy.sprite, () => {
        this.handleEnemyCollision(enemy);
      });
    }

    // Shell vs enemies: moving Koopa shells kill other enemies
    for (const koopa of enemies) {
      if (!(koopa instanceof KoopaToxica)) continue;
      for (const other of enemies) {
        if (other === koopa) continue;
        this.physics.add.overlap(koopa.sprite, other.sprite, () => {
          if (koopa.isShell && koopa.shellMoving && other.isAlive) {
            other.hitByProjectile();
            this.player.addScore(other.scoreValue);
            this.audio.playStomp();
          }
        });
      }
    }

    // Player vs coins
    for (const coin of coins) {
      this.physics.add.overlap(this.player.sprite, coin.sprite, () => {
        if (!coin.sprite.active) return;
        coin.collect();
        this.player.collectCoin();
        this.audio.playCoin();
        this.createFloatingText(coin.sprite.x, coin.sprite.y - 10, '+1', '#ffd700');
      }, undefined, this);
    }

    // Player vs blocks (hit from below)
    for (const block of blocks) {
      this.physics.add.collider(this.player.sprite, block.sprite, () => {
        this.handleBlockCollision(block);
      });
    }

    // Player vs flag pole
    if (flagPole) {
      this.physics.add.overlap(this.player.sprite, flagPole.triggerZone, () => {
        if (!this.isLevelComplete) {
          this.isLevelComplete = true;
          this.audio.stopMusic(true);
          this.audio.playFlagPole();
          flagPole.activate();
          this.player.startFlagPole(flagPole.poleSprite.x, flagPole.getBottom());
          // Stop HUD timer
          const hudScene = this.scene.get('HUDScene');
          hudScene?.events.emit('stopTimer');
        }
      });
    }

    // Player vs hazards
    this.physics.add.overlap(this.player.sprite, hazards, () => {
      this.player.takeDamage();
    });

    // Boss collisions
    if (boss) {
      this.physics.add.overlap(this.player.sprite, boss.sprite, () => {
        if (!boss.isAlive) return;
        const playerBody = this.player.body;
        const bossBody = boss.sprite.body as Phaser.Physics.Arcade.Body;
        const isStomping = playerBody.velocity.y > 0 && playerBody.bottom <= bossBody.top + BOSS_STOMP_THRESHOLD;

        if (this.player.isInvincibleFrames) {
          this.hitBoss();
        } else if (isStomping) {
          this.hitBoss();
          this.stompJuice(boss.sprite.x, boss.sprite.y);
          playerBody.setVelocityY(-300);
        } else {
          this.player.takeDamage();
        }
      });
      this.physics.add.overlap(this.player.sprite, boss.getProjectiles(), () => {
        if (!boss.isAlive) return;
        this.player.takeDamage();
      });
    }

    // Player vs secret stars
    for (const star of this.levelObjects.secretStars) {
      this.physics.add.overlap(this.player.sprite, star, () => {
        if (!star.active) return;
        star.destroy();
        this.player.addScore(1000);
        this.audio.play1Up();
        this.createFloatingText(star.x, star.y - 10, 'SECRET! +1000', '#ffff00');
        this.cameras.main.flash(150, 255, 255, 0, false);
        // Track found stars in localStorage
        const levelStars = JSON.parse(localStorage.getItem('cpm-stars') || '{}');
        const key = `level-${this.levelIndex}`;
        levelStars[key] = (levelStars[key] || 0) + 1;
        localStorage.setItem('cpm-stars', JSON.stringify(levelStars));
      });
    }

    // Player vs ecoponto (victory condition for boss level)
    if (ecoponto) {
      this.physics.add.overlap(this.player.sprite, ecoponto, () => {
        if (!this.isLevelComplete) {
          this.isLevelComplete = true;
          this.audio.stopMusic(true);
          this.audio.playFlagPole();
          this.onBossDefeated();
        }
      });
    }
  }

  private handleEnemyCollision(enemy: GoombaLixo | KoopaToxica): void {
    const playerBody = this.player.body;
    const enemyBody = enemy.sprite.body as Phaser.Physics.Arcade.Body;

    // Koopa shell interactions
    if (!enemy.isAlive && enemy instanceof KoopaToxica && enemy.isShell) {
      const isStomping = playerBody.velocity.y > 0 && playerBody.bottom <= enemyBody.center.y + 5;

      if (enemy.shellMoving && isStomping) {
        // Stomp a moving shell to stop it
        enemy.stomp();
        playerBody.setVelocityY(SHELL_STOMP_BOUNCE);
        this.player.addScore(100);
        this.audio.playStomp();
        this.createFloatingText(enemy.sprite.x, enemy.sprite.y - 10, '100', '#ffeb3b');
      } else if (!enemy.shellMoving) {
        // Kick a stationary shell
        const dir = this.player.facingRight;
        enemy.kick(dir);
        this.player.addScore(100);
        this.audio.playShellKick();
        this.createFloatingText(enemy.sprite.x, enemy.sprite.y - 10, '100', '#ffeb3b');
        // Spark particles on kick
        for (let i = 0; i < 3; i++) {
          const spark = this.add.circle(enemy.sprite.x, enemy.sprite.y, 2, 0xffff00).setDepth(100);
          this.tweens.add({
            targets: spark,
            x: spark.x + Phaser.Math.Between(-20, 20),
            y: spark.y + Phaser.Math.Between(-15, 5),
            alpha: 0, duration: 250,
            onComplete: () => spark.destroy(),
          });
        }
      } else if (this.player.isInvincibleFrames) {
        // Invincible player destroys moving shell
        enemy.hitByProjectile();
        this.player.addScore(100);
        this.audio.playStomp();
      } else {
        // Moving shell hits player from side
        this.player.takeDamage();
      }
      return;
    }

    if (!enemy.isAlive) return;

    const isStomping = playerBody.velocity.y > 0 && playerBody.bottom <= enemyBody.top + ENEMY_STOMP_THRESHOLD;

    if (isStomping) {
      // Stomp!
      enemy.stomp();
      this.player.addScore(enemy.scoreValue);
      playerBody.setVelocityY(SHELL_STOMP_BOUNCE);
      this.audio.playStomp();
      this.stompJuice(enemy.sprite.x, enemy.sprite.y);
      this.registerComboStomp(enemy.sprite.x, enemy.sprite.y, enemy.scoreValue);
      this.createFloatingText(enemy.sprite.x, enemy.sprite.y - 10, `${enemy.scoreValue}`, '#ffeb3b');
    } else if (this.player.isInvincibleFrames) {
      enemy.hitByProjectile();
      this.player.addScore(enemy.scoreValue);
      this.audio.playStomp();
      this.createFloatingText(enemy.sprite.x, enemy.sprite.y - 10, `${enemy.scoreValue}`, '#ffeb3b');
    } else {
      this.player.takeDamage();
    }
  }

  private hitBoss(): void {
    const boss = this.levelObjects.boss;
    if (!boss || !boss.isAlive) return;
    this.bossHits++;
    this.audio.playBossHit();
    this.createFloatingText(boss.sprite.x, boss.sprite.y - 20, `${this.bossHits}/${this.bossMaxHits}`, '#ff4444');

    // Flash boss
    boss.sprite.setTint(0xff0000);
    this.time.delayedCall(200, () => {
      if (boss.sprite.active) boss.sprite.clearTint();
    });

    if (this.bossHits >= this.bossMaxHits) {
      if (this.bossDeathAnimationStarted) return;
      this.bossDeathAnimationStarted = true;
      boss.isAlive = false;
      this.tweens.add({
        targets: boss.sprite,
        y: boss.sprite.y + 200,
        alpha: 0,
        duration: 1500,
        ease: 'Quad.easeIn',
      });
      // Reveal ecoponto area
      if (this.levelObjects.ecoponto) {
        this.tweens.add({
          targets: this.levelObjects.ecoponto,
          alpha: { from: 0.3, to: 1 },
          scaleX: { from: 0.5, to: 1 },
          scaleY: { from: 0.5, to: 1 },
          duration: 800,
          ease: 'Back.easeOut',
        });
      }
    } else {
      boss.advancePhase();
    }
  }

  private handleBlockCollision(block: Block): void {
    const playerBody = this.player.body;
    const blockBody = block.sprite.body as Phaser.Physics.Arcade.Body;

    // Only activate when hitting from below: player moving up, player's top touching block's bottom,
    // player not beside the block, and sufficient horizontal overlap
    const verticallyAligned = playerBody.top <= blockBody.bottom + 4 && playerBody.top >= blockBody.top;
    const horizontalOverlap = Math.min(playerBody.right, blockBody.right) - Math.max(playerBody.left, blockBody.left);
    const minOverlap = Math.min(playerBody.width, blockBody.width) * 0.4;
    const hitFromBelow = playerBody.velocity.y < 0 &&
      verticallyAligned &&
      horizontalOverlap >= minOverlap;

    if (hitFromBelow) {
      const isBig = this.player.powerState !== 'small';
      const result = block.hit(isBig);

      if (result) {
        this.audio.playBlockHit();
        this.spawnPowerUp(result.type as PowerUpType, result.x, result.y);
      } else if (block.blockType === 'brick' && isBig && !block.isUsed) {
        this.audio.playBlockBreak();
      } else {
        this.audio.playBlockHit();
      }
    }
  }

  private spawnPowerUp(type: string, x: number, y: number): void {
    if (type === 'coin') {
      const coin = new Coin(this, x, y);
      coin.collect();
      this.player.collectCoin();
      this.audio.playCoin();
      this.createFloatingText(x, y - 10, '+1', '#ffd700');
      return;
    }

    let powerType: PowerUpType = type as PowerUpType;
    if (type === 'recycle' && this.player.powerState !== 'small') {
      powerType = 'ipe';
    }

    const powerUp = new PowerUp(this, x, y, powerType);
    this.powerUps.push(powerUp);

    this.physics.add.collider(powerUp.sprite, this.levelObjects.groundGroup);
    this.physics.add.collider(powerUp.sprite, this.blockGroup);
    for (const platform of this.levelObjects.movingPlatforms) {
      this.physics.add.collider(powerUp.sprite, platform);
    }
    this.physics.add.overlap(this.player.sprite, powerUp.sprite, () => {
      powerUp.collect();
      this.player.powerUp(powerUp.type);
      this.audio.playPowerUp();
      const idx = this.powerUps.indexOf(powerUp);
      if (idx > -1) this.powerUps.splice(idx, 1);

      // Power-up celebration: brief slowdown + flash
      this.cameras.main.flash(200, 255, 255, 200, false);
      this.physics.world.timeScale = 4;
      this.time.delayedCall(150, () => { this.physics.world.timeScale = 1; });
      this.createFloatingText(this.player.sprite.x, this.player.sprite.y - 20, 'POWER UP!', '#4caf50');
    });
  }

  private setupProjectileCollisions(projectile: Phaser.Physics.Arcade.Sprite): void {
    this.physics.add.collider(projectile, this.levelObjects.groundGroup, () => {
      if (projectile.getData('bounced')) {
        this.createPurifyEffect(projectile.x, projectile.y);
        projectile.destroy();
      } else {
        projectile.setData('bounced', true);
      }
    });

    for (const enemy of this.levelObjects.enemies) {
      this.physics.add.overlap(projectile, enemy.sprite, () => {
        if (enemy.isAlive) {
          enemy.hitByProjectile();
          this.player.addScore(enemy.scoreValue);
          this.audio.playStomp();
          this.createFloatingText(enemy.sprite.x, enemy.sprite.y - 10, `${enemy.scoreValue}`, '#ffeb3b');
          this.createPurifyEffect(enemy.sprite.x, enemy.sprite.y);
          projectile.destroy();
        }
      });
    }

    // Projectile vs boss (always set up overlap; check isAlive at runtime)
    if (this.levelObjects.boss) {
      this.physics.add.overlap(projectile, this.levelObjects.boss.sprite, () => {
        if (this.levelObjects.boss?.isAlive) {
          this.hitBoss();
          this.createPurifyEffect(projectile.x, projectile.y);
          projectile.destroy();
        }
      });
    }
  }

  private registerComboStomp(x: number, y: number, baseScore: number): void {
    this.comboCount++;
    // Reset combo timer
    this.comboTimer?.destroy();
    this.comboTimer = this.time.delayedCall(1500, () => { this.comboCount = 0; });

    if (this.comboCount > 1) {
      const bonus = baseScore * this.comboCount;
      this.player.addScore(bonus - baseScore); // extra bonus (base already added)
      const comboColors = ['#ffeb3b', '#ff9800', '#ff5722', '#e91e63', '#9c27b0'];
      const color = comboColors[Math.min(this.comboCount - 2, comboColors.length - 1)];
      this.createFloatingText(x, y - 30, `COMBO x${this.comboCount}!`, color);
    }
  }

  private stompJuice(x: number, y: number): void {
    // Camera shake
    this.cameras.main.shake(80, 0.005);

    // Hitstop: brief physics pause
    this.physics.world.timeScale = 10; // slow physics dramatically
    this.time.delayedCall(60, () => {
      this.physics.world.timeScale = 1;
    });

    // Impact particles
    for (let i = 0; i < 5; i++) {
      const particle = this.add.circle(
        x + Phaser.Math.Between(-10, 10),
        y,
        Phaser.Math.Between(2, 4),
        0xffffff
      ).setDepth(100);
      this.tweens.add({
        targets: particle,
        x: particle.x + Phaser.Math.Between(-25, 25),
        y: particle.y + Phaser.Math.Between(-20, 15),
        alpha: 0,
        scale: 0,
        duration: 300,
        ease: 'Quad.easeOut',
        onComplete: () => particle.destroy(),
      });
    }
  }

  private createFloatingText(x: number, y: number, text: string, color = '#ffffff'): void {
    const floatText = this.add.text(x, y, text, {
      fontSize: '14px',
      color,
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(100);

    this.tweens.add({
      targets: floatText,
      y: y - 40,
      alpha: 0,
      duration: 800,
      ease: 'Cubic.easeOut',
      onComplete: () => floatText.destroy(),
    });
  }

  private createPurifyEffect(x: number, y: number): void {
    for (let i = 0; i < 4; i++) {
      const leaf = this.add.image(x, y, 'particle-leaf').setScale(1.5).setDepth(10);
      this.tweens.add({
        targets: leaf,
        x: x + Phaser.Math.Between(-30, 30),
        y: y + Phaser.Math.Between(-40, -10),
        alpha: 0,
        scale: 0,
        duration: 600,
        onComplete: () => leaf.destroy(),
      });
    }
  }

  private onLevelComplete(): void {
    this.scene.stop('HUDScene');
    this.time.delayedCall(800, () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(400, () => {
        const nextLevel = this.levelIndex + 1;
        if (nextLevel >= 4) {
          this.scene.start('VictoryScene');
        } else {
          this.scene.start('LevelTransitionScene', { levelIndex: nextLevel });
        }
      });
    });
  }

  private onBossDefeated(): void {
    this.player.sprite.setVelocity(0, 0);
    (this.player.sprite.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    // Stop HUD timer
    const hudScene = this.scene.get('HUDScene');
    hudScene?.events.emit('stopTimer');

    if (this.levelObjects.boss && !this.bossDeathAnimationStarted) {
      this.bossDeathAnimationStarted = true;
      this.levelObjects.boss.isAlive = false;
      this.audio.playBossHit();
      this.tweens.add({
        targets: this.levelObjects.boss.sprite,
        y: this.levelObjects.boss.sprite.y + 200,
        alpha: 0,
        duration: 1500,
        ease: 'Quad.easeIn',
      });
    }

    this.time.delayedCall(2000, () => {
      const msg = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, [
        'Muito obrigado por me salvar!',
        '',
        'Mas a verdadeira fonte da poluição',
        'e a nossa Muda de Ouro estão',
        'em outro pavilhão!',
      ].join('\n'), {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'Arial',
        align: 'center',
        backgroundColor: '#000000aa',
        padding: { x: 20, y: 15 },
        lineSpacing: 4,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

      this.time.delayedCall(4000, () => {
        msg.destroy();
        this.scene.stop('HUDScene');
        this.scene.start('VictoryScene');
      });
    });
  }

  update(time: number, delta: number): void {
    if (this.player.isDead || this.isLevelComplete) return;

    // Moving platform riding: apply platform delta to player
    let platformDx = 0;
    if (this.player.body.blocked.down) {
      for (const platform of this.levelObjects.movingPlatforms) {
        const prev = this.prevPlatformPositions.get(platform);
        if (prev) {
          const playerBody = this.player.body;
          const platBody = platform.body as Phaser.Physics.Arcade.Body;
          const onPlatform =
            playerBody.bottom >= platBody.top - 2 &&
            playerBody.bottom <= platBody.top + 8 &&
            playerBody.right > platBody.left &&
            playerBody.left < platBody.right;

          if (onPlatform) {
            const dx = platform.x - prev.x;
            const dy = platform.y - prev.y;
            this.player.sprite.x += dx;
            this.player.sprite.y += dy;
            platformDx = dx;
          }
        }
      }
    }

    // Store platform velocity so player inherits it on jump
    this.player.platformVelocityX = platformDx / (delta / 1000) || 0;

    // Update previous platform positions
    for (const platform of this.levelObjects.movingPlatforms) {
      this.prevPlatformPositions.set(platform, { x: platform.x, y: platform.y });
    }

    this.player.update();

    for (const enemy of this.levelObjects.enemies) {
      enemy.update(time, delta);
    }

    this.levelObjects.boss?.update(delta);

    for (const coin of this.levelObjects.coins) {
      coin.update(delta);
    }
  }

  shutdown(): void {
    this.audio.stopMusic();
    this.player?.destroy();
    this.inputManager?.destroy();
    this.tweens.killAll();
    this.time.removeAllEvents();
    for (const timer of this.levelObjects?.loopTimers || []) {
      timer.destroy();
    }
    this.bossHits = 0;
    this.comboCount = 0;
    this.comboTimer?.destroy();
    this.prevPlatformPositions.clear();
    // Clean up moving platform arrow listeners
    for (const platform of this.levelObjects?.movingPlatforms || []) {
      const arrowCb = (platform as any)._arrowUpdate;
      if (arrowCb) {
        this.events.off('update', arrowCb);
      }
      const arrow = platform.getData('arrow') as Phaser.GameObjects.Text;
      arrow?.destroy();
    }
    // Remove only our custom listeners — do NOT call removeAllListeners() as it destroys Phaser internals
    this.events.off('levelComplete');
    this.events.off('timeUp');
    this.events.off('projectileCreated');
    this.events.off('resume');
    this.events.off('shutdown', this.shutdown, this);
  }
}
