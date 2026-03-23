import { TILE_SIZE, COLORS } from '../constants';

export class SpriteGenerator {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  private gfx(): Phaser.GameObjects.Graphics {
    return this.scene.add.graphics().setVisible(false);
  }

  generateAll(): void {
    this.generateTiles();
    this.generateEnemies();
    this.generatePowerUps();
    this.generateCoins();
    this.generateProjectiles();
    this.generateFlag();
    this.generateUI();
    this.generateEffects();
  }

  private generateTiles(): void {
    const s = TILE_SIZE;
    // Ground tile (grass top + dirt)
    const g = this.gfx();
    g.fillStyle(COLORS.GROUND_BROWN);
    g.fillRect(0, 0, s, s);
    g.fillStyle(COLORS.GROUND_GREEN);
    g.fillRect(0, 0, s, 6);
    g.fillStyle(0x6d4c2a);
    for (let i = 0; i < 3; i++) {
      g.fillRect(4 + i * 10, 10 + i * 6, 8, 2);
    }
    g.generateTexture('tile-ground', s, s);
    g.destroy();

    // Ground bottom (just dirt, no grass)
    const gb = this.gfx();
    gb.fillStyle(COLORS.GROUND_BROWN);
    gb.fillRect(0, 0, s, s);
    gb.fillStyle(0x6d4c2a);
    for (let i = 0; i < 3; i++) {
      gb.fillRect(4 + i * 10, 8 + i * 7, 8, 2);
    }
    gb.generateTexture('tile-ground-bottom', s, s);
    gb.destroy();

    // Brick block (cardboard recycling box)
    const b = this.gfx();
    b.fillStyle(COLORS.BRICK_ORANGE);
    b.fillRect(0, 0, s, s);
    b.lineStyle(1, 0xa0601e);
    b.strokeRect(1, 1, s - 2, s - 2);
    b.fillStyle(0xa0601e);
    b.fillRect(0, s / 2 - 1, s, 2);
    b.fillRect(s / 2 - 1, 0, 2, s);
    b.fillRect(s / 4, 0, 1, s / 2);
    b.fillRect(s * 3 / 4, s / 2, 1, s / 2);
    b.generateTexture('tile-brick', s, s);
    b.destroy();

    // Question block
    const q = this.gfx();
    q.fillStyle(COLORS.QUESTION_YELLOW);
    q.fillRect(0, 0, s, s);
    q.lineStyle(2, COLORS.QUESTION_BROWN);
    q.strokeRect(1, 1, s - 2, s - 2);
    // Draw "?" mark
    q.fillStyle(COLORS.QUESTION_BROWN);
    q.fillRect(12, 6, 8, 3);
    q.fillRect(17, 9, 3, 6);
    q.fillRect(14, 14, 3, 3);
    q.fillRect(14, 20, 3, 3);
    // Corner sparkles
    q.fillStyle(0xffffff);
    q.fillRect(3, 3, 2, 2);
    q.fillRect(27, 3, 2, 2);
    q.generateTexture('tile-question', s, s);
    q.destroy();

    // Used question block
    const qu = this.gfx();
    qu.fillStyle(0x6b6b6b);
    qu.fillRect(0, 0, s, s);
    qu.lineStyle(2, 0x505050);
    qu.strokeRect(1, 1, s - 2, s - 2);
    qu.generateTexture('tile-question-used', s, s);
    qu.destroy();

    // Pipe pieces
    this.generatePipePieces();

    // Underground stone tile
    const us = this.gfx();
    us.fillStyle(COLORS.UNDERGROUND_STONE);
    us.fillRect(0, 0, s, s);
    us.lineStyle(1, 0x2d2d4c);
    us.strokeRect(1, 1, s - 2, s - 2);
    us.fillStyle(0x4d4d6c);
    us.fillRect(2, 2, 4, 4);
    us.fillRect(18, 14, 4, 4);
    us.generateTexture('tile-underground', s, s);
    us.destroy();

    // Wood platform
    const w = this.gfx();
    w.fillStyle(0x8d6e3c);
    w.fillRect(0, 0, s * 2, s);
    w.fillStyle(0x7d5e2c);
    w.fillRect(0, 0, s * 2, 4);
    w.fillRect(0, s - 4, s * 2, 4);
    for (let i = 0; i < 4; i++) {
      w.fillRect(i * 16, 8, 14, 2);
    }
    w.generateTexture('tile-wood', s * 2, s);
    w.destroy();

    // Toxic barrel
    const tb = this.gfx();
    tb.fillStyle(COLORS.TOXIC_BARREL);
    tb.fillRect(0, 0, s, s);
    tb.fillStyle(0x7a1e1e);
    tb.fillRect(4, 2, s - 8, s - 4);
    tb.fillStyle(COLORS.TOXIC_GREEN);
    // Skull-ish symbol
    tb.fillRect(10, 8, 12, 8);
    tb.fillRect(12, 16, 8, 4);
    tb.fillRect(11, 10, 3, 3);
    tb.fillRect(18, 10, 3, 3);
    tb.generateTexture('tile-barrel', s, s);
    tb.destroy();

    // Invisible wall
    const iw = this.gfx();
    iw.fillStyle(0x000000, 0);
    iw.fillRect(0, 0, s, s);
    iw.generateTexture('tile-invisible', s, s);
    iw.destroy();
  }

  private generatePipePieces(): void {
    const s = TILE_SIZE;
    const green = COLORS.PIPE_GREEN;
    const light = COLORS.PIPE_GREEN_LIGHT;

    // Pipe top left
    const ptl = this.gfx();
    ptl.fillStyle(green);
    ptl.fillRect(0, 0, s, s);
    ptl.fillStyle(light);
    ptl.fillRect(0, 0, s, 6);
    ptl.fillRect(0, 0, 6, s);
    ptl.fillStyle(0x1e6b1e);
    ptl.fillRect(s - 2, 0, 2, s);
    ptl.generateTexture('tile-pipe-top-left', s, s);
    ptl.destroy();

    // Pipe top right
    const ptr = this.gfx();
    ptr.fillStyle(green);
    ptr.fillRect(0, 0, s, s);
    ptr.fillStyle(light);
    ptr.fillRect(0, 0, s, 6);
    ptr.fillStyle(0x1e6b1e);
    ptr.fillRect(s - 6, 0, 6, s);
    ptr.fillRect(0, 0, 2, s);
    ptr.generateTexture('tile-pipe-top-right', s, s);
    ptr.destroy();

    // Pipe body left
    const pbl = this.gfx();
    pbl.fillStyle(green);
    pbl.fillRect(4, 0, s - 4, s);
    pbl.fillStyle(light);
    pbl.fillRect(4, 0, 6, s);
    pbl.fillStyle(0x1e6b1e);
    pbl.fillRect(s - 2, 0, 2, s);
    pbl.generateTexture('tile-pipe-body-left', s, s);
    pbl.destroy();

    // Pipe body right
    const pbr = this.gfx();
    pbr.fillStyle(green);
    pbr.fillRect(0, 0, s - 4, s);
    pbr.fillStyle(0x1e6b1e);
    pbr.fillRect(s - 8, 0, 4, s);
    pbr.fillRect(0, 0, 2, s);
    pbr.generateTexture('tile-pipe-body-right', s, s);
    pbr.destroy();
  }

  private generateEnemies(): void {
    const s = TILE_SIZE;

    // Goomba (trash bag) - frame 1 & 2
    for (let frame = 0; frame < 2; frame++) {
      const g = this.gfx();
      // Black outline for visibility
      g.fillStyle(0x000000);
      g.fillRect(3, 3, 26, 22);
      g.fillRect(5, 1, 22, 2);
      g.fillRect(7, -1, 18, 2);
      // Body (trash bag shape)
      g.fillStyle(0x3a3a3a);
      g.fillRect(4, 4, 24, 20);
      g.fillRect(6, 2, 20, 2);
      g.fillRect(8, 0, 16, 2);
      // Tie at top
      g.fillStyle(0x666666);
      g.fillRect(13, 0, 6, 4);
      // Angry eyes - brighter red for visibility
      g.fillStyle(0xff3333);
      g.fillRect(8, 10, 5, 4);
      g.fillRect(19, 10, 5, 4);
      g.fillStyle(0xffffff);
      g.fillRect(9, 11, 3, 2);
      g.fillRect(20, 11, 3, 2);
      // Feet
      g.fillStyle(0x555555);
      if (frame === 0) {
        g.fillRect(6, 24, 8, 4);
        g.fillRect(18, 24, 8, 4);
      } else {
        g.fillRect(4, 24, 8, 4);
        g.fillRect(20, 24, 8, 4);
      }
      // Drip marks - green toxic drips for better visual
      g.fillStyle(0x44aa44);
      g.fillRect(10, 17, 2, 5);
      g.fillRect(20, 15, 2, 6);
      g.generateTexture(`enemy-goomba-${frame}`, s, s - 4);
      g.destroy();
    }

    // Goomba flat (stomped)
    const gf = this.gfx();
    gf.fillStyle(0x000000);
    gf.fillRect(1, 0, 30, 8);
    gf.fillStyle(0x3a3a3a);
    gf.fillRect(2, 0, 28, 8);
    gf.fillStyle(0xff3333);
    gf.fillRect(8, 2, 4, 3);
    gf.fillRect(20, 2, 4, 3);
    gf.generateTexture('enemy-goomba-flat', s, 8);
    gf.destroy();

    // Koopa (plastic bag / toxic container) - frame 1 & 2
    for (let frame = 0; frame < 2; frame++) {
      const k = this.gfx();
      // Black outline for visibility
      k.fillStyle(0x000000);
      k.fillRect(3, 5, 26, 18);
      k.fillRect(1, 9, 2, 10);
      k.fillRect(28, 9, 2, 10);
      // Body - slightly greenish tint for "toxic" theme
      k.fillStyle(0xccddcc);
      k.fillRect(4, 6, 24, 16);
      k.fillRect(6, 4, 20, 2);
      k.fillRect(2, 10, 2, 8);
      k.fillRect(28, 10, 2, 8);
      // Wrinkles
      k.fillStyle(0x99bb99);
      k.fillRect(8, 8, 2, 12);
      k.fillRect(16, 6, 2, 14);
      k.fillRect(22, 8, 2, 12);
      // Eyes - brighter purple for visibility
      k.fillStyle(0x9900cc);
      k.fillRect(10, 12, 4, 4);
      k.fillRect(20, 12, 4, 4);
      k.fillStyle(0xffffff);
      k.fillRect(11, 13, 2, 2);
      k.fillRect(21, 13, 2, 2);
      // Feet
      k.fillStyle(0x88aa88);
      const offset = frame * 2;
      k.fillRect(6 + offset, 22, 8, 6);
      k.fillRect(18 - offset, 22, 8, 6);
      k.generateTexture(`enemy-koopa-${frame}`, s, s - 4);
      k.destroy();
    }

    // Koopa shell (rusty can) - brighter for visibility
    const ks = this.gfx();
    ks.fillStyle(0x000000);
    ks.fillRect(3, 3, 26, 22);
    ks.fillStyle(0xcc6622);
    ks.fillRect(4, 4, 24, 20);
    ks.fillRect(6, 2, 20, 2);
    ks.fillRect(6, 24, 20, 2);
    ks.fillStyle(0x994411);
    ks.fillRect(4, 10, 24, 2);
    ks.fillRect(4, 16, 24, 2);
    ks.fillStyle(0xdd7744);
    ks.fillRect(12, 6, 8, 16);
    ks.generateTexture('enemy-koopa-shell', s, s - 4);
    ks.destroy();

    // Boss - Monstro de Lata (64x64)
    const bs = 64;
    const boss = this.gfx();
    // Main body - pile of junk
    boss.fillStyle(0x7a7a7a);
    boss.fillRect(8, 16, 48, 40);
    boss.fillRect(12, 8, 40, 8);
    boss.fillRect(16, 4, 32, 4);
    // Rusty patches
    boss.fillStyle(0xaa5522);
    boss.fillRect(14, 20, 16, 12);
    boss.fillRect(36, 24, 14, 16);
    boss.fillRect(20, 40, 20, 10);
    // Eyes (menacing)
    boss.fillStyle(0xff0000);
    boss.fillRect(18, 10, 8, 6);
    boss.fillRect(38, 10, 8, 6);
    boss.fillStyle(0xffff00);
    boss.fillRect(20, 12, 4, 2);
    boss.fillRect(40, 12, 4, 2);
    // Mouth
    boss.fillStyle(0x330000);
    boss.fillRect(24, 20, 16, 6);
    boss.fillStyle(0xff4444);
    boss.fillRect(26, 22, 3, 2);
    boss.fillRect(31, 22, 3, 2);
    boss.fillRect(36, 22, 3, 2);
    // Arms (scrap metal)
    boss.fillStyle(0x555555);
    boss.fillRect(0, 24, 8, 6);
    boss.fillRect(56, 24, 8, 6);
    // Feet
    boss.fillRect(12, 56, 14, 8);
    boss.fillRect(38, 56, 14, 8);
    // Smoke coming out top
    boss.fillStyle(0x666666);
    boss.fillCircle(28, 2, 4);
    boss.fillCircle(36, 0, 3);
    boss.generateTexture('boss-lata', bs, bs);
    boss.destroy();

    // Boss projectile (smoke ball)
    const bp = this.gfx();
    bp.fillStyle(0x444444);
    bp.fillCircle(8, 8, 8);
    bp.fillStyle(0x666666);
    bp.fillCircle(6, 6, 3);
    bp.generateTexture('boss-projectile', 16, 16);
    bp.destroy();

    // Acid drop — brighter with glow outline
    const ad = this.gfx();
    // Glow outline
    ad.fillStyle(0x88ff00, 0.5);
    ad.fillRect(3, -1, 6, 2);
    ad.fillRect(1, 5, 10, 5);
    // Main body
    ad.fillStyle(0xccff00);
    ad.fillRect(4, 0, 4, 2);
    ad.fillRect(3, 2, 6, 4);
    ad.fillRect(2, 6, 8, 4);
    ad.fillRect(3, 10, 6, 2);
    ad.fillRect(4, 12, 4, 2);
    // Bright center
    ad.fillStyle(0xeeff88);
    ad.fillRect(4, 4, 4, 4);
    ad.generateTexture('acid-drop', 12, 14);
    ad.destroy();
  }

  private generatePowerUps(): void {
    const s = 28;

    // Recycling symbol (mushroom equivalent) — with outline
    const r = this.gfx();
    // Dark outline
    r.fillStyle(0x000000);
    r.fillRect(5, 1, 18, 6);
    r.fillRect(1, 5, 8, 14);
    r.fillRect(19, 5, 8, 14);
    r.fillRect(5, 17, 18, 6);
    // Green body
    r.fillStyle(COLORS.RECYCLE_GREEN);
    r.fillRect(6, 2, 16, 4);
    r.fillRect(2, 6, 6, 12);
    r.fillRect(20, 6, 6, 12);
    r.fillRect(6, 18, 16, 4);
    r.fillRect(10, 8, 8, 8);
    r.fillStyle(0xffffff);
    r.fillRect(11, 9, 6, 6);
    // Arrow tips
    r.fillStyle(COLORS.RECYCLE_GREEN);
    r.fillRect(12, 0, 4, 3);
    r.fillRect(0, 14, 3, 4);
    r.fillRect(25, 14, 3, 4);
    r.generateTexture('powerup-recycle', s, s);
    r.destroy();

    // Ipê seed (fire flower equivalent)
    const f = this.gfx();
    // Stem
    f.fillStyle(0x2e7d32);
    f.fillRect(12, 14, 4, 12);
    // Leaves
    f.fillRect(6, 18, 6, 3);
    f.fillRect(16, 20, 6, 3);
    // Flower petals (yellow ipê)
    f.fillStyle(0xffeb3b);
    f.fillCircle(14, 8, 6);
    f.fillStyle(0xffc107);
    f.fillCircle(10, 6, 4);
    f.fillCircle(18, 6, 4);
    f.fillCircle(10, 12, 4);
    f.fillCircle(18, 12, 4);
    // Center
    f.fillStyle(0xff8f00);
    f.fillCircle(14, 9, 3);
    f.generateTexture('powerup-ipe', s, s);
    f.destroy();

    // Solar panel (star equivalent)
    const sp = this.gfx();
    // Panel body
    sp.fillStyle(0x1565c0);
    sp.fillRect(2, 4, 24, 18);
    sp.lineStyle(2, 0x90caf9);
    sp.strokeRect(2, 4, 24, 18);
    // Grid lines
    sp.lineStyle(1, 0x42a5f5);
    sp.lineBetween(10, 4, 10, 22);
    sp.lineBetween(18, 4, 18, 22);
    sp.lineBetween(2, 10, 26, 10);
    sp.lineBetween(2, 16, 26, 16);
    // Sun glow
    sp.fillStyle(0xffeb3b);
    sp.fillCircle(22, 2, 4);
    sp.fillStyle(0xfff9c4);
    sp.fillCircle(22, 2, 2);
    sp.generateTexture('powerup-solar', s, s);
    sp.destroy();
  }

  private generateCoins(): void {
    // 4 rotation frames for the coin — bright gold/yellow for high visibility
    for (let frame = 0; frame < 4; frame++) {
      const c = this.gfx();
      const widths = [14, 10, 4, 10];
      const w = widths[frame];
      const x = (16 - w) / 2;

      // Dark outline for contrast
      c.fillStyle(0x000000);
      c.fillRect(x - 1, 0, w + 2, 16);
      // Bright gold body
      c.fillStyle(0xffd700);
      c.fillRect(x, 1, w, 14);
      if (w > 6) {
        c.fillStyle(0xdaa520);
        c.fillRect(x + 2, 3, w - 4, 10);
        // Recycling leaf symbol
        if (w > 8) {
          c.fillStyle(0xffffff);
          c.fillRect(x + w / 2 - 1, 5, 2, 6);
          c.fillRect(x + w / 2 - 3, 7, 6, 2);
        }
      }
      c.generateTexture(`coin-${frame}`, 16, 16);
      c.destroy();
    }
  }

  private generateProjectiles(): void {
    // Water drop
    const w = this.gfx();
    w.fillStyle(COLORS.WATER_BLUE);
    w.fillCircle(6, 7, 5);
    w.fillRect(4, 2, 4, 4);
    w.fillStyle(0x81d4fa);
    w.fillCircle(4, 6, 2);
    w.generateTexture('projectile-water', 12, 12);
    w.destroy();

    // Seed
    const s = this.gfx();
    s.fillStyle(COLORS.SEED_BROWN);
    s.fillCircle(6, 6, 5);
    s.fillStyle(0x4e342e);
    s.fillRect(4, 3, 2, 2);
    s.fillStyle(0x2e7d32);
    s.fillRect(5, 0, 2, 4);
    s.generateTexture('projectile-seed', 12, 12);
    s.destroy();
  }

  private generateFlag(): void {
    // Flag pole
    const fp = this.gfx();
    fp.fillStyle(0x888888);
    fp.fillRect(6, 0, 4, 256);
    fp.fillStyle(0xffeb3b);
    fp.fillCircle(8, 4, 5);
    fp.generateTexture('flag-pole', 16, 256);
    fp.destroy();

    // Recycling flag
    const fl = this.gfx();
    fl.fillStyle(COLORS.RECYCLE_GREEN);
    fl.fillRect(0, 0, 28, 20);
    fl.fillStyle(0xffffff);
    // Simplified recycling arrows
    fl.fillRect(6, 4, 16, 2);
    fl.fillRect(6, 4, 2, 12);
    fl.fillRect(6, 14, 16, 2);
    fl.fillRect(20, 4, 2, 12);
    fl.fillRect(10, 8, 8, 4);
    fl.generateTexture('flag', 28, 20);
    fl.destroy();

    // Ecoponto (recycling station)
    const ep = this.gfx();
    ep.fillStyle(0x2e7d32);
    ep.fillRect(0, 8, 48, 48);
    ep.fillStyle(0x4caf50);
    ep.fillRect(4, 12, 40, 40);
    ep.lineStyle(2, 0xffffff);
    ep.strokeRect(4, 12, 40, 40);
    // Recycling symbol
    ep.fillStyle(0xffffff);
    ep.fillRect(16, 18, 16, 3);
    ep.fillRect(13, 21, 4, 18);
    ep.fillRect(31, 21, 4, 18);
    ep.fillRect(16, 36, 16, 3);
    // Sign on top
    ep.fillStyle(0xffeb3b);
    ep.fillRect(8, 0, 32, 12);
    ep.fillStyle(0x2e7d32);
    ep.fillRect(12, 2, 24, 8);
    ep.generateTexture('ecoponto', 48, 56);
    ep.destroy();
  }

  private generateUI(): void {
    // Life icon (heart) — brighter with outline
    const h = this.gfx();
    // Dark outline
    h.fillStyle(0x000000);
    h.fillCircle(5, 4, 5);
    h.fillCircle(11, 4, 5);
    h.fillRect(0, 4, 16, 7);
    h.fillRect(2, 10, 12, 4);
    h.fillRect(4, 13, 8, 3);
    h.fillRect(6, 15, 4, 2);
    // Red fill
    h.fillStyle(0xff3333);
    h.fillCircle(5, 4, 4);
    h.fillCircle(11, 4, 4);
    h.fillRect(1, 4, 14, 6);
    h.fillRect(3, 10, 10, 3);
    h.fillRect(5, 13, 6, 2);
    h.fillRect(7, 15, 2, 1);
    // Highlight
    h.fillStyle(0xff8888);
    h.fillCircle(5, 3, 2);
    h.generateTexture('ui-heart', 16, 16);
    h.destroy();

    // Virtual gamepad buttons — more visible with labels
    const btnSize = 48;
    const makeBtn = (key: string, color: number, label: string) => {
      const bg = this.gfx();
      // Shadow
      bg.fillStyle(0x000000, 0.3);
      bg.fillCircle(btnSize / 2 + 1, btnSize / 2 + 1, btnSize / 2);
      // Fill
      bg.fillStyle(color, 0.6);
      bg.fillCircle(btnSize / 2, btnSize / 2, btnSize / 2);
      bg.lineStyle(3, 0xffffff, 0.7);
      bg.strokeCircle(btnSize / 2, btnSize / 2, btnSize / 2 - 2);
      // Letter label
      bg.fillStyle(0xffffff, 0.9);
      bg.fillRect(btnSize / 2 - 4, btnSize / 2 - 5, 8, 10);
      bg.generateTexture(key, btnSize, btnSize);
      bg.destroy();
    };
    makeBtn('btn-a', 0x4caf50, 'A');
    makeBtn('btn-b', 0xff9800, 'B');

    // D-pad — higher contrast
    const dp = this.gfx();
    const dps = 120;
    dp.fillStyle(0x222222, 0.6);
    dp.fillRect(40, 0, 40, 120);
    dp.fillRect(0, 40, 120, 40);
    dp.lineStyle(3, 0xffffff, 0.5);
    dp.strokeRect(40, 0, 40, 120);
    dp.strokeRect(0, 40, 120, 40);
    // Arrows — brighter
    dp.fillStyle(0xffffff, 0.75);
    // Left arrow
    dp.fillRect(8, 56, 20, 8);
    dp.fillRect(12, 52, 8, 16);
    // Right arrow
    dp.fillRect(92, 56, 20, 8);
    dp.fillRect(96, 52, 8, 16);
    // Up arrow
    dp.fillRect(56, 8, 8, 20);
    dp.fillRect(52, 12, 16, 8);
    // Down arrow
    dp.fillRect(56, 92, 8, 20);
    dp.fillRect(52, 96, 16, 8);
    dp.generateTexture('dpad', dps, dps);
    dp.destroy();
  }

  private generateEffects(): void {
    // Leaf particle
    const l = this.gfx();
    l.fillStyle(0x4caf50);
    l.fillRect(1, 0, 6, 3);
    l.fillRect(0, 3, 6, 3);
    l.fillStyle(0x2e7d32);
    l.fillRect(3, 1, 1, 5);
    l.generateTexture('particle-leaf', 8, 8);
    l.destroy();

    // Brick break particle
    const bp = this.gfx();
    bp.fillStyle(COLORS.BRICK_ORANGE);
    bp.fillRect(0, 0, 8, 8);
    bp.generateTexture('particle-brick', 8, 8);
    bp.destroy();

    // Smoke particle
    const sp = this.gfx();
    sp.fillStyle(0x666666, 0.6);
    sp.fillCircle(6, 6, 6);
    sp.generateTexture('particle-smoke', 12, 12);
    sp.destroy();

    // Star/sparkle for invincibility
    const st = this.gfx();
    st.fillStyle(0xffeb3b);
    st.fillRect(3, 0, 2, 8);
    st.fillRect(0, 3, 8, 2);
    st.fillRect(1, 1, 2, 2);
    st.fillRect(5, 1, 2, 2);
    st.fillRect(1, 5, 2, 2);
    st.fillRect(5, 5, 2, 2);
    st.generateTexture('particle-star', 8, 8);
    st.destroy();

    // Fire bar segment — brighter with glow
    const fb = this.gfx();
    // Outer glow
    fb.fillStyle(0xff2200, 0.4);
    fb.fillCircle(7, 7, 7);
    // Main
    fb.fillStyle(0xff5500);
    fb.fillCircle(7, 7, 6);
    fb.fillStyle(0xffcc00);
    fb.fillCircle(7, 7, 3);
    // Bright center
    fb.fillStyle(0xffffaa);
    fb.fillCircle(7, 7, 1);
    fb.generateTexture('fire-bar-segment', 14, 14);
    fb.destroy();

    // Moving platform — with visible border
    const mp = this.gfx();
    // Border outline
    mp.fillStyle(0x000000);
    mp.fillRect(0, 0, 64, 16);
    // Body
    mp.fillStyle(0x9d7e4c);
    mp.fillRect(1, 1, 62, 14);
    mp.fillStyle(0x8d6e3c);
    mp.fillRect(1, 3, 62, 10);
    // Top highlight
    mp.fillStyle(0xad8e5c);
    mp.fillRect(1, 1, 62, 3);
    // Grid lines
    mp.lineStyle(1, 0x6d4e1c);
    mp.lineBetween(16, 1, 16, 15);
    mp.lineBetween(32, 1, 32, 15);
    mp.lineBetween(48, 1, 48, 15);
    mp.generateTexture('moving-platform', 64, 16);
    mp.destroy();
  }
}
