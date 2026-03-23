import { TILE_SIZE, FIRE_BAR_SEGMENT_SPACING, FIRE_BAR_ROTATION_SPEED } from '../constants';
import { LevelData, TILE } from '../types';
import { GoombaLixo } from '../entities/GoombaLixo';
import { KoopaToxica } from '../entities/KoopaToxica';
import { Boss } from '../entities/Boss';
import { Coin } from '../objects/Coin';
import { Block } from '../objects/Block';
import { PowerUp } from '../objects/PowerUp';
import { FlagPole } from '../objects/FlagPole';

export interface LevelObjects {
  groundGroup: Phaser.Physics.Arcade.StaticGroup;
  enemies: (GoombaLixo | KoopaToxica)[];
  boss?: Boss;
  coins: Coin[];
  blocks: Block[];
  powerUps: PowerUp[];
  flagPole?: FlagPole;
  movingPlatforms: Phaser.Physics.Arcade.Image[];
  hazards: Phaser.Physics.Arcade.Group;
  ecoponto?: Phaser.Physics.Arcade.Sprite;
  loopTimers: Phaser.Time.TimerEvent[];
  secretStars: Phaser.Physics.Arcade.Sprite[];
}

export class LevelBuilder {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  build(levelData: LevelData): LevelObjects {
    const result: LevelObjects = {
      groundGroup: this.scene.physics.add.staticGroup(),
      enemies: [],
      coins: [],
      blocks: [],
      powerUps: [],
      movingPlatforms: [],
      hazards: this.scene.physics.add.group(),
      loopTimers: [],
      secretStars: [],
    };

    // Build a set of entity positions for blocks (to avoid duplicates)
    const entityBlockPositions = new Set<string>();
    for (const entity of levelData.entities) {
      if (entity.type === 'block-question' || entity.type === 'block-brick') {
        entityBlockPositions.add(`${entity.x},${entity.y}`);
      }
    }

    // Build tile map
    for (let row = 0; row < levelData.tileMap.length; row++) {
      for (let col = 0; col < levelData.tileMap[row].length; col++) {
        const tile = levelData.tileMap[row][col];
        if (tile === TILE.EMPTY) continue;

        const x = col * TILE_SIZE + TILE_SIZE / 2;
        const y = row * TILE_SIZE + TILE_SIZE / 2;

        // If this is a Q or K tile AND an entity exists here, skip it (entity will create the Block)
        if ((tile === TILE.QUESTION || tile === TILE.BRICK) && entityBlockPositions.has(`${col},${row}`)) {
          continue;
        }

        // Q and K tiles without entity counterparts become simple static blocks
        if (tile === TILE.QUESTION) {
          // Question block with default coin contents
          result.blocks.push(new Block(this.scene, x, y, 'question', 'coin'));
          continue;
        }
        if (tile === TILE.BRICK) {
          result.blocks.push(new Block(this.scene, x, y, 'brick', 'none'));
          continue;
        }

        const textureMap: Record<number, string> = {
          [TILE.GROUND]: 'tile-ground',
          [TILE.GROUND_BOTTOM]: 'tile-ground-bottom',
          [TILE.PIPE_TOP_LEFT]: 'tile-pipe-top-left',
          [TILE.PIPE_TOP_RIGHT]: 'tile-pipe-top-right',
          [TILE.PIPE_BODY_LEFT]: 'tile-pipe-body-left',
          [TILE.PIPE_BODY_RIGHT]: 'tile-pipe-body-right',
          [TILE.UNDERGROUND]: 'tile-underground',
          [TILE.BARREL]: 'tile-barrel',
          [TILE.INVISIBLE_WALL]: 'tile-invisible',
        };

        const texture = textureMap[tile];
        if (texture) {
          result.groundGroup.create(x, y, texture);
        }
      }
    }

    // Build entities
    for (const entity of levelData.entities) {
      const x = entity.x * TILE_SIZE + TILE_SIZE / 2;
      const y = entity.y * TILE_SIZE + TILE_SIZE / 2;

      switch (entity.type) {
        case 'goomba':
          result.enemies.push(new GoombaLixo(this.scene, x, y));
          break;

        case 'koopa':
          result.enemies.push(new KoopaToxica(this.scene, x, y, false));
          break;

        case 'koopa-fly':
          result.enemies.push(new KoopaToxica(this.scene, x, y, true));
          break;

        case 'coin':
          result.coins.push(new Coin(this.scene, x, y));
          break;

        case 'block-question': {
          const contents = (entity.properties?.contents as string) || 'coin';
          result.blocks.push(new Block(this.scene, x, y, 'question', contents as any));
          break;
        }

        case 'block-brick':
          result.blocks.push(new Block(this.scene, x, y, 'brick', 'none'));
          break;

        case 'flag': {
          const groundY = entity.y * TILE_SIZE + TILE_SIZE;
          result.flagPole = new FlagPole(this.scene, x, groundY);
          break;
        }

        case 'boss': {
          const minX = (entity.properties?.minX as number || entity.x - 5) * TILE_SIZE;
          const maxX = (entity.properties?.maxX as number || entity.x + 5) * TILE_SIZE;
          result.boss = new Boss(this.scene, x, y, minX, maxX);
          break;
        }

        case 'ecoponto': {
          result.ecoponto = this.scene.physics.add.sprite(x, y, 'ecoponto');
          const body = result.ecoponto.body as Phaser.Physics.Arcade.Body;
          body.setAllowGravity(false);
          body.setImmovable(true);
          result.ecoponto.setDepth(3);
          break;
        }

        case 'acid-drop': {
          const timer = this.createAcidDrop(x, entity.y * TILE_SIZE, result.hazards);
          result.loopTimers.push(timer);
          break;
        }

        case 'moving-platform': {
          const platform = this.createMovingPlatform(
            x, y,
            entity.properties?.moveX as number || 0,
            entity.properties?.moveY as number || 0,
            entity.properties?.speed as number || 2000,
          );
          result.movingPlatforms.push(platform);
          break;
        }

        case 'fire-bar': {
          const timer = this.createFireBar(x, y, entity.properties?.length as number || 4, result.hazards);
          result.loopTimers.push(timer);
          break;
        }

        case 'secret-star': {
          // Hidden collectible star — semi-transparent, subtle sparkle
          const star = this.scene.physics.add.sprite(x, y, 'coin-0');
          star.setTint(0xffff00);
          star.setAlpha(0.3);
          star.setScale(1.2);
          star.setDepth(3);
          const starBody = star.body as Phaser.Physics.Arcade.Body;
          starBody.setAllowGravity(false);
          starBody.setImmovable(true);
          // Subtle sparkle animation
          this.scene.tweens.add({
            targets: star,
            alpha: { from: 0.2, to: 0.5 },
            scale: { from: 1.1, to: 1.3 },
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
          });
          result.secretStars.push(star);
          break;
        }
      }
    }

    // Set world bounds
    const worldWidth = levelData.width * TILE_SIZE;
    const worldHeight = levelData.height * TILE_SIZE;
    this.scene.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    return result;
  }

  private createAcidDrop(x: number, startY: number, hazardGroup: Phaser.Physics.Arcade.Group): Phaser.Time.TimerEvent {
    return this.scene.time.addEvent({
      delay: Phaser.Math.Between(2000, 4000),
      loop: true,
      callback: () => {
        // Telegraph: warning flash before drop
        const warning = this.scene.add.circle(x, startY, 4, 0xff4444, 0.8).setDepth(5);
        this.scene.tweens.add({
          targets: warning,
          alpha: 0,
          scale: 2,
          duration: 400,
          yoyo: true,
          onComplete: () => {
            warning.destroy();
            // Spawn actual drop after telegraph
            const drop = this.scene.physics.add.sprite(x, startY, 'acid-drop');
            (drop.body as Phaser.Physics.Arcade.Body).setAllowGravity(true);
            drop.setDepth(4);
            hazardGroup.add(drop);
            this.scene.time.delayedCall(3000, () => {
              if (drop.active) drop.destroy();
            });
          },
        });
      },
    });
  }

  private createMovingPlatform(x: number, y: number, moveX: number, moveY: number, speed: number): Phaser.Physics.Arcade.Image {
    const platform = this.scene.physics.add.image(x, y, 'moving-platform');
    const body = platform.body as Phaser.Physics.Arcade.Body;
    body.setImmovable(true);
    body.setAllowGravity(false);
    body.setFriction(1, 0);
    platform.setDepth(2);

    // Direction arrow indicator
    const arrowChar = moveX !== 0 ? '↔' : '↕';
    const arrow = this.scene.add.text(x, y - 2, arrowChar, {
      fontSize: '10px', color: '#ffffff66', fontFamily: 'Arial',
    }).setOrigin(0.5).setDepth(2);
    // Arrow follows platform — use preUpdate on the platform image itself to avoid listener leaks
    platform.setData('arrow', arrow);
    (platform as any)._arrowUpdate = () => {
      if (platform.active && arrow.active) {
        arrow.setPosition(platform.x, platform.y - 2);
      }
    };
    this.scene.events.on('update', (platform as any)._arrowUpdate);

    if (moveX !== 0) {
      this.scene.tweens.add({
        targets: platform,
        x: x + moveX * TILE_SIZE,
        duration: speed,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
    if (moveY !== 0) {
      this.scene.tweens.add({
        targets: platform,
        y: y + moveY * TILE_SIZE,
        duration: speed,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    return platform;
  }

  private createFireBar(x: number, y: number, length: number, hazardGroup: Phaser.Physics.Arcade.Group): Phaser.Time.TimerEvent {
    const segments: Phaser.Physics.Arcade.Sprite[] = [];
    for (let i = 0; i < length; i++) {
      const seg = this.scene.physics.add.sprite(x, y, 'fire-bar-segment');
      const body = seg.body as Phaser.Physics.Arcade.Body;
      body.setAllowGravity(false);
      body.setImmovable(true);
      seg.setDepth(4);
      segments.push(seg);
      hazardGroup.add(seg);
    }

    let angle = 0;
    let lastTime = this.scene.time.now;
    return this.scene.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        const now = this.scene.time.now;
        const dt = now - lastTime;
        lastTime = now;
        angle += FIRE_BAR_ROTATION_SPEED * (dt / 16);
        for (let i = 0; i < segments.length; i++) {
          const dist = (i + 1) * FIRE_BAR_SEGMENT_SPACING;
          segments[i].x = x + Math.cos(angle) * dist;
          segments[i].y = y + Math.sin(angle) * dist;
          (segments[i].body as Phaser.Physics.Arcade.Body).updateFromGameObject();
        }
      },
    });
  }
}
