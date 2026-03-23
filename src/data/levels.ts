import { LevelData, TILE, EntityPlacement } from '../types';

const T = TILE;
const _ = T.EMPTY;
const G = T.GROUND;
const B = T.GROUND_BOTTOM;
const K = T.BRICK;
const Q = T.QUESTION;
const PL = T.PIPE_TOP_LEFT;
const PR = T.PIPE_TOP_RIGHT;
const BL = T.PIPE_BODY_LEFT;
const BR = T.PIPE_BODY_RIGHT;
const U = T.UNDERGROUND;
const X = T.BARREL;
const W = T.INVISIBLE_WALL;

// Helper: create a row of tiles
function fillRow(tiles: number[], width: number): number[] {
  const row = new Array(width).fill(_);
  for (let i = 0; i < tiles.length && i < width; i++) {
    row[i] = tiles[i];
  }
  return row;
}

function emptyRow(width: number): number[] {
  return new Array(width).fill(_);
}

function groundRow(width: number, gaps: [number, number][] = []): number[] {
  const row = new Array(width).fill(G);
  for (const [start, len] of gaps) {
    for (let i = start; i < start + len && i < width; i++) {
      row[i] = _;
    }
  }
  return row;
}

function bottomRow(width: number, gaps: [number, number][] = []): number[] {
  const row = new Array(width).fill(B);
  for (const [start, len] of gaps) {
    for (let i = start; i < start + len && i < width; i++) {
      row[i] = _;
    }
  }
  return row;
}

// Set specific tiles in a row
function setTiles(row: number[], ...pairs: [number, number][]): number[] {
  for (const [idx, tile] of pairs) {
    if (idx >= 0 && idx < row.length) {
      row[idx] = tile;
    }
  }
  return row;
}

// ==========================================
// LEVEL 1-1: Patio Contaminado
// ==========================================
const W1 = 210; // width in tiles
const H1 = 14;  // height in tiles

function buildLevel1_1Tiles(): number[][] {
  const map: number[][] = [];
  for (let r = 0; r < H1; r++) {
    map.push(emptyRow(W1));
  }

  // Ground (rows 12-13), with gaps
  const gaps11: [number, number][] = [[68, 3], [90, 4], [135, 2]];
  map[12] = groundRow(W1, gaps11);
  map[13] = bottomRow(W1, gaps11);

  // Pipes (various heights)
  // Pipe at col 28 (2 tall)
  map[10][28] = PL; map[10][29] = PR;
  map[11][28] = BL; map[11][29] = BR;

  // Pipe at col 38 (3 tall)
  map[9][38] = PL; map[9][39] = PR;
  map[10][38] = BL; map[10][39] = BR;
  map[11][38] = BL; map[11][39] = BR;

  // Pipe at col 57 (2 tall)
  map[10][57] = PL; map[10][58] = PR;
  map[11][57] = BL; map[11][58] = BR;

  // Pipe at col 100 (4 tall) - tall pipe
  map[8][100] = PL; map[8][101] = PR;
  map[9][100] = BL; map[9][101] = BR;
  map[10][100] = BL; map[10][101] = BR;
  map[11][100] = BL; map[11][101] = BR;

  // Pipe at col 160 (2 tall)
  map[10][160] = PL; map[10][161] = PR;
  map[11][160] = BL; map[11][161] = BR;

  // Brick and question blocks at various positions
  // Row 8 blocks near col 16
  map[8][16] = K; map[8][17] = Q; map[8][18] = K; map[8][19] = Q; map[8][20] = K;

  // Blocks near col 45
  map[8][45] = Q;

  // Elevated section col 52-56
  map[8][52] = K; map[8][53] = K; map[8][54] = Q; map[8][55] = K; map[8][56] = K;

  // Blocks near col 78
  map[5][78] = Q; // question block with power-up (reachable from row 8 blocks)
  map[8][76] = K; map[8][77] = K; map[8][78] = K; map[8][79] = K;

  // Staircase at col 107-112
  map[11][107] = K;
  map[10][108] = K; map[11][108] = K;
  map[9][109] = K; map[10][109] = K; map[11][109] = K;
  map[8][110] = K; map[9][110] = K; map[10][110] = K; map[11][110] = K;

  // Blocks col 120
  map[8][120] = Q; map[8][122] = K; map[8][124] = Q;

  // Staircase near col 142-148
  map[11][142] = K;
  map[10][143] = K; map[11][143] = K;
  map[9][144] = K; map[10][144] = K; map[11][144] = K;
  map[8][145] = K; map[9][145] = K; map[10][145] = K; map[11][145] = K;
  // Descending
  map[8][148] = K; map[9][148] = K; map[10][148] = K; map[11][148] = K;
  map[9][149] = K; map[10][149] = K; map[11][149] = K;
  map[10][150] = K; map[11][150] = K;
  map[11][151] = K;

  // Blocks near col 165
  map[8][165] = Q; map[8][167] = K; map[8][169] = Q;

  // Final staircase col 185-192
  for (let step = 0; step < 8; step++) {
    for (let h = 0; h <= step; h++) {
      map[11 - h][185 + step] = K;
    }
  }

  return map;
}

const level1_1Entities: EntityPlacement[] = [
  // Goombas
  { type: 'goomba', x: 22, y: 11 },
  { type: 'goomba', x: 32, y: 11 },
  { type: 'goomba', x: 42, y: 11 },
  { type: 'goomba', x: 51, y: 11 },
  { type: 'goomba', x: 64, y: 11 },
  { type: 'goomba', x: 75, y: 11 },
  { type: 'goomba', x: 85, y: 11 },
  { type: 'goomba', x: 96, y: 11 },
  { type: 'goomba', x: 115, y: 11 },
  { type: 'goomba', x: 130, y: 11 },
  { type: 'goomba', x: 155, y: 11 },
  { type: 'goomba', x: 175, y: 11 },

  // Koopas
  { type: 'koopa', x: 60, y: 11 },
  { type: 'koopa', x: 125, y: 11 },
  { type: 'koopa', x: 170, y: 11 },

  // Question blocks with contents
  { type: 'block-question', x: 17, y: 8, properties: { contents: 'coin' } },
  { type: 'block-question', x: 19, y: 8, properties: { contents: 'recycle' } },
  { type: 'block-question', x: 45, y: 8, properties: { contents: 'coin' } },
  { type: 'block-question', x: 54, y: 8, properties: { contents: 'coin' } },
  { type: 'block-question', x: 78, y: 5, properties: { contents: 'ipe' } },
  { type: 'block-question', x: 120, y: 8, properties: { contents: 'recycle' } },
  { type: 'block-question', x: 124, y: 8, properties: { contents: 'coin' } },
  { type: 'block-question', x: 165, y: 8, properties: { contents: 'coin' } },
  { type: 'block-question', x: 169, y: 8, properties: { contents: 'solar' } },

  // Coins in the air
  { type: 'coin', x: 12, y: 8 },
  { type: 'coin', x: 13, y: 8 },
  { type: 'coin', x: 14, y: 8 },
  { type: 'coin', x: 34, y: 10 },
  { type: 'coin', x: 35, y: 9 },
  { type: 'coin', x: 36, y: 9 },
  { type: 'coin', x: 37, y: 10 },
  { type: 'coin', x: 47, y: 6 },
  { type: 'coin', x: 48, y: 6 },
  { type: 'coin', x: 72, y: 6 },
  { type: 'coin', x: 73, y: 6 },
  { type: 'coin', x: 74, y: 6 },
  { type: 'coin', x: 108, y: 6 },
  { type: 'coin', x: 109, y: 5 },
  { type: 'coin', x: 110, y: 4 },
  { type: 'coin', x: 138, y: 8 },
  { type: 'coin', x: 139, y: 7 },
  { type: 'coin', x: 140, y: 7 },
  { type: 'coin', x: 141, y: 8 },
  { type: 'coin', x: 180, y: 8 },
  { type: 'coin', x: 181, y: 7 },
  { type: 'coin', x: 182, y: 7 },

  // Flag pole at end
  { type: 'flag', x: 198, y: 11 },

  // Secret star — hidden above a pipe
  { type: 'secret-star', x: 50, y: 5 },
];

// ==========================================
// LEVEL 1-2: Tubulacoes Entupidas
// ==========================================
const W2 = 190;
const H2 = 14;

function buildLevel1_2Tiles(): number[][] {
  const map: number[][] = [];
  for (let r = 0; r < H2; r++) {
    map.push(emptyRow(W2));
  }

  // Ceiling (row 0-1)
  map[0] = new Array(W2).fill(U);
  map[1] = new Array(W2).fill(U);

  // Floor (rows 12-13)
  const gaps: [number, number][] = [[50, 3], [80, 2], [120, 4], [155, 3]];
  map[12] = groundRow(W2, gaps).map(t => t === G ? U : _);
  map[13] = bottomRow(W2, gaps).map(t => t === B ? U : _);

  // Pipes from ceiling
  map[2][20] = BL; map[2][21] = BR;
  map[3][20] = PL; map[3][21] = PR;

  map[2][45] = BL; map[2][46] = BR;
  map[3][45] = PL; map[3][46] = PR;

  // Pipes from floor
  map[10][30] = PL; map[10][31] = PR;
  map[11][30] = BL; map[11][31] = BR;

  map[9][65] = PL; map[9][66] = PR;
  map[10][65] = BL; map[10][66] = BR;
  map[11][65] = BL; map[11][66] = BR;

  map[10][95] = PL; map[10][96] = PR;
  map[11][95] = BL; map[11][96] = BR;

  map[10][110] = PL; map[10][111] = PR;
  map[11][110] = BL; map[11][111] = BR;

  map[10][140] = PL; map[10][141] = PR;
  map[11][140] = BL; map[11][141] = BR;

  // Platforms/ledges
  map[8][55] = U; map[8][56] = U; map[8][57] = U; map[8][58] = U;
  map[8][82] = U; map[8][83] = U; map[8][84] = U;
  map[6][86] = U; map[6][87] = U; map[6][88] = U;
  map[8][125] = U; map[8][126] = U; map[8][127] = U; map[8][128] = U;

  // Question blocks
  map[8][35] = Q; map[8][37] = Q;
  map[6][70] = Q;
  map[8][100] = Q; map[8][102] = Q;
  map[6][130] = Q;
  map[8][145] = Q; map[8][147] = Q;

  // Brick blocks
  map[8][36] = K;
  map[8][60] = K; map[8][61] = K; map[8][62] = K;
  map[8][101] = K;
  map[8][146] = K;

  // Exit pipe on the right
  map[10][180] = PL; map[10][181] = PR;
  map[11][180] = BL; map[11][181] = BR;

  return map;
}

const level1_2Entities: EntityPlacement[] = [
  // Goombas (more in underground)
  { type: 'goomba', x: 15, y: 11 },
  { type: 'goomba', x: 25, y: 11 },
  { type: 'goomba', x: 33, y: 11 },
  { type: 'goomba', x: 40, y: 11 },
  { type: 'goomba', x: 48, y: 11 },
  { type: 'goomba', x: 58, y: 7 },
  { type: 'goomba', x: 75, y: 11 },
  { type: 'goomba', x: 85, y: 7 },
  { type: 'goomba', x: 105, y: 11 },
  { type: 'goomba', x: 115, y: 11 },
  { type: 'goomba', x: 135, y: 11 },
  { type: 'goomba', x: 150, y: 11 },
  { type: 'goomba', x: 165, y: 11 },

  // Koopas
  { type: 'koopa', x: 55, y: 11 },
  { type: 'koopa', x: 90, y: 11 },
  { type: 'koopa', x: 130, y: 11 },
  { type: 'koopa', x: 160, y: 11 },

  // Question blocks contents
  { type: 'block-question', x: 35, y: 8, properties: { contents: 'recycle' } },
  { type: 'block-question', x: 37, y: 8, properties: { contents: 'coin' } },
  { type: 'block-question', x: 70, y: 6, properties: { contents: 'ipe' } },
  { type: 'block-question', x: 100, y: 8, properties: { contents: 'coin' } },
  { type: 'block-question', x: 102, y: 8, properties: { contents: 'coin' } },
  { type: 'block-question', x: 130, y: 6, properties: { contents: 'solar' } },
  { type: 'block-question', x: 145, y: 8, properties: { contents: 'recycle' } },
  { type: 'block-question', x: 147, y: 8, properties: { contents: 'coin' } },

  // Acid drops from ceiling
  { type: 'acid-drop', x: 28, y: 2 },
  { type: 'acid-drop', x: 52, y: 2 },
  { type: 'acid-drop', x: 78, y: 2 },
  { type: 'acid-drop', x: 98, y: 2 },
  { type: 'acid-drop', x: 118, y: 2 },
  { type: 'acid-drop', x: 142, y: 2 },
  { type: 'acid-drop', x: 162, y: 2 },

  // Coins
  { type: 'coin', x: 18, y: 9 },
  { type: 'coin', x: 19, y: 9 },
  { type: 'coin', x: 56, y: 6 },
  { type: 'coin', x: 57, y: 6 },
  { type: 'coin', x: 83, y: 6 },
  { type: 'coin', x: 84, y: 6 },
  { type: 'coin', x: 87, y: 4 },
  { type: 'coin', x: 88, y: 4 },
  { type: 'coin', x: 126, y: 6 },
  { type: 'coin', x: 127, y: 6 },
  { type: 'coin', x: 170, y: 9 },
  { type: 'coin', x: 171, y: 9 },
  { type: 'coin', x: 172, y: 9 },

  // Flag
  { type: 'flag', x: 185, y: 11 },

  // Secret star — hidden in underground alcove
  { type: 'secret-star', x: 90, y: 3 },
];

// ==========================================
// LEVEL 1-3: Bosque das Arvores Centenarias
// ==========================================
const W3 = 180;
const H3 = 14;

function buildLevel1_3Tiles(): number[][] {
  const map: number[][] = [];
  for (let r = 0; r < H3; r++) {
    map.push(emptyRow(W3));
  }

  // Starting platform (solid ground for first few tiles)
  for (let c = 0; c < 8; c++) {
    map[12][c] = G;
    map[13][c] = B;
  }

  // Ending platform
  for (let c = W3 - 15; c < W3; c++) {
    map[12][c] = G;
    map[13][c] = B;
  }

  // Static tree platforms scattered throughout
  const platforms: [number, number, number][] = [ // row, startCol, length
    [10, 12, 4], [8, 20, 3], [10, 28, 4], [6, 35, 3],
    [10, 42, 3], [8, 50, 4], [6, 58, 3], [10, 65, 4],
    [8, 72, 3], [6, 78, 4], [10, 85, 3], [8, 92, 4],
    [6, 100, 3], [10, 108, 4], [8, 115, 3], [10, 122, 4],
    [8, 130, 3], [6, 138, 4], [10, 145, 3], [8, 152, 4],
    [10, 158, 4],
  ];

  for (const [row, col, len] of platforms) {
    for (let c = col; c < col + len; c++) {
      map[row][c] = G;
    }
  }

  return map;
}

const level1_3Entities: EntityPlacement[] = [
  // Moving platforms (key feature of this level)
  { type: 'moving-platform', x: 8, y: 10, properties: { moveX: 4, moveY: 0, speed: 3000 } },
  { type: 'moving-platform', x: 16, y: 8, properties: { moveX: 3, moveY: 0, speed: 2500 } },
  { type: 'moving-platform', x: 24, y: 6, properties: { moveX: 0, moveY: 3, speed: 2000 } },
  { type: 'moving-platform', x: 32, y: 9, properties: { moveX: 3, moveY: 0, speed: 2800 } },
  { type: 'moving-platform', x: 46, y: 7, properties: { moveX: 3, moveY: 0, speed: 2200 } },
  { type: 'moving-platform', x: 55, y: 9, properties: { moveX: 0, moveY: 3, speed: 2500 } },
  { type: 'moving-platform', x: 62, y: 8, properties: { moveX: 3, moveY: 0, speed: 3000 } },
  { type: 'moving-platform', x: 69, y: 7, properties: { moveX: 3, moveY: 0, speed: 2200 } },
  { type: 'moving-platform', x: 82, y: 8, properties: { moveX: 0, moveY: 3, speed: 2000 } },
  { type: 'moving-platform', x: 89, y: 7, properties: { moveX: 3, moveY: 0, speed: 2800 } },
  { type: 'moving-platform', x: 96, y: 9, properties: { moveX: 3, moveY: 0, speed: 2500 } },
  { type: 'moving-platform', x: 104, y: 7, properties: { moveX: 0, moveY: 3, speed: 2200 } },
  { type: 'moving-platform', x: 112, y: 8, properties: { moveX: 4, moveY: 0, speed: 3000 } },
  { type: 'moving-platform', x: 126, y: 7, properties: { moveX: 3, moveY: 0, speed: 2500 } },
  { type: 'moving-platform', x: 134, y: 9, properties: { moveX: 3, moveY: 0, speed: 2800 } },
  { type: 'moving-platform', x: 142, y: 8, properties: { moveX: 0, moveY: 3, speed: 2200 } },
  { type: 'moving-platform', x: 155, y: 7, properties: { moveX: 4, moveY: 0, speed: 3000 } },

  // Flying koopas (main enemy of this level)
  { type: 'koopa-fly', x: 18, y: 5 },
  { type: 'koopa-fly', x: 38, y: 4 },
  { type: 'koopa-fly', x: 55, y: 5 },
  { type: 'koopa-fly', x: 75, y: 4 },
  { type: 'koopa-fly', x: 95, y: 5 },
  { type: 'koopa-fly', x: 110, y: 4 },
  { type: 'koopa-fly', x: 128, y: 5 },
  { type: 'koopa-fly', x: 148, y: 4 },

  // Goombas on static platforms
  { type: 'goomba', x: 21, y: 7 },
  { type: 'goomba', x: 51, y: 7 },
  { type: 'goomba', x: 93, y: 7 },
  { type: 'goomba', x: 131, y: 7 },

  // Coins (arc formations between platforms)
  { type: 'coin', x: 10, y: 7 },
  { type: 'coin', x: 11, y: 6 },
  { type: 'coin', x: 12, y: 6 },
  { type: 'coin', x: 26, y: 5 },
  { type: 'coin', x: 27, y: 4 },
  { type: 'coin', x: 28, y: 4 },
  { type: 'coin', x: 36, y: 3 },
  { type: 'coin', x: 37, y: 3 },
  { type: 'coin', x: 60, y: 4 },
  { type: 'coin', x: 61, y: 3 },
  { type: 'coin', x: 80, y: 4 },
  { type: 'coin', x: 81, y: 3 },
  { type: 'coin', x: 102, y: 4 },
  { type: 'coin', x: 103, y: 3 },
  { type: 'coin', x: 118, y: 5 },
  { type: 'coin', x: 119, y: 4 },
  { type: 'coin', x: 140, y: 4 },
  { type: 'coin', x: 141, y: 3 },

  // Power-ups on question blocks (a few static platforms have them)
  { type: 'block-question', x: 29, y: 4, properties: { contents: 'recycle' } },
  { type: 'block-question', x: 79, y: 4, properties: { contents: 'ipe' } },
  { type: 'block-question', x: 139, y: 4, properties: { contents: 'solar' } },

  // Flag
  { type: 'flag', x: 172, y: 11 },

  // Secret star — hidden high up in dark area
  { type: 'secret-star', x: 120, y: 2 },
];

// ==========================================
// LEVEL 1-4: Quadra Poliesportiva (Boss)
// ==========================================
const W4 = 160;
const H4 = 14;

function buildLevel1_4Tiles(): number[][] {
  const map: number[][] = [];
  for (let r = 0; r < H4; r++) {
    map.push(emptyRow(W4));
  }

  // Floor with barrel "lava" gaps
  const lavaGaps: [number, number][] = [[30, 4], [50, 3], [70, 5], [90, 3]];
  map[12] = groundRow(W4, lavaGaps);
  map[13] = bottomRow(W4, lavaGaps);

  // Barrel lava in gaps
  for (const [start, len] of lavaGaps) {
    for (let c = start; c < start + len; c++) {
      map[13][c] = X;
    }
  }

  // Ceiling in castle section
  for (let c = 0; c < 110; c++) {
    map[0][c] = U;
    map[1][c] = U;
  }

  // Platforms/ledges
  map[8][20] = U; map[8][21] = U; map[8][22] = U;
  map[6][35] = U; map[6][36] = U; map[6][37] = U;
  map[8][45] = U; map[8][46] = U; map[8][47] = U;
  map[8][55] = U; map[8][56] = U;
  map[6][60] = U; map[6][61] = U; map[6][62] = U;
  map[8][75] = U; map[8][76] = U; map[8][77] = U;
  map[6][82] = U; map[6][83] = U; map[6][84] = U;
  map[8][95] = U; map[8][96] = U; map[8][97] = U;

  // Boss arena (col 110-155): flat ground, no ceiling
  for (let c = 110; c < 155; c++) {
    map[12][c] = G;
    map[13][c] = B;
  }

  // Walls on sides of arena
  for (let r = 2; r < 12; r++) {
    map[r][110] = U;
  }

  return map;
}

const level1_4Entities: EntityPlacement[] = [
  // Goombas
  { type: 'goomba', x: 10, y: 11 },
  { type: 'goomba', x: 18, y: 11 },
  { type: 'goomba', x: 40, y: 11 },
  { type: 'goomba', x: 60, y: 11 },
  { type: 'goomba', x: 80, y: 11 },
  { type: 'goomba', x: 100, y: 11 },

  // Koopas
  { type: 'koopa', x: 25, y: 11 },
  { type: 'koopa', x: 65, y: 11 },
  { type: 'koopa', x: 85, y: 11 },

  // Fire bars (rotating hazards)
  { type: 'fire-bar', x: 28, y: 10, properties: { length: 4 } },
  { type: 'fire-bar', x: 48, y: 10, properties: { length: 5 } },
  { type: 'fire-bar', x: 68, y: 8, properties: { length: 4 } },
  { type: 'fire-bar', x: 88, y: 10, properties: { length: 5 } },

  // Question blocks
  { type: 'block-question', x: 15, y: 8, properties: { contents: 'recycle' } },
  { type: 'block-question', x: 55, y: 6, properties: { contents: 'ipe' } },
  { type: 'block-question', x: 95, y: 6, properties: { contents: 'solar' } },

  // Coins
  { type: 'coin', x: 21, y: 6 },
  { type: 'coin', x: 22, y: 6 },
  { type: 'coin', x: 36, y: 4 },
  { type: 'coin', x: 37, y: 4 },
  { type: 'coin', x: 46, y: 6 },
  { type: 'coin', x: 47, y: 6 },
  { type: 'coin', x: 61, y: 4 },
  { type: 'coin', x: 62, y: 4 },
  { type: 'coin', x: 76, y: 6 },
  { type: 'coin', x: 83, y: 4 },
  { type: 'coin', x: 96, y: 6 },

  // Boss in arena
  { type: 'boss', x: 130, y: 8, properties: { minX: 115, maxX: 148 } },

  // Ecoponto (behind boss, at far right of arena)
  { type: 'ecoponto', x: 152, y: 11 },
];

// ==========================================
// EXPORT ALL LEVELS
// ==========================================
export const LEVELS: LevelData[] = [
  {
    name: '1-1',
    title: 'Pátio Contaminado',
    width: W1,
    height: H1,
    tileMap: buildLevel1_1Tiles(),
    background: 'cenario1',
    timeLimit: 300,
    spawnPoint: { x: 3, y: 10 },
    entities: level1_1Entities,
  },
  {
    name: '1-2',
    title: 'Tubulações Entupidas',
    width: W2,
    height: H2,
    tileMap: buildLevel1_2Tiles(),
    background: 'underground',
    timeLimit: 350,
    spawnPoint: { x: 3, y: 10 },
    entities: level1_2Entities,
    isDark: false,
    hasCeiling: true,
  },
  {
    name: '1-3',
    title: 'Bosque das Árvores Centenárias',
    width: W3,
    height: H3,
    tileMap: buildLevel1_3Tiles(),
    background: 'cenario2',
    timeLimit: 360,
    spawnPoint: { x: 3, y: 10 },
    entities: level1_3Entities,
  },
  {
    name: '1-4',
    title: 'Quadra Poliesportiva',
    width: W4,
    height: H4,
    tileMap: buildLevel1_4Tiles(),
    background: 'cenario3',
    timeLimit: 300,
    spawnPoint: { x: 3, y: 10 },
    entities: level1_4Entities,
    isDark: true,
  },
];
