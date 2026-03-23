export const TILE_SIZE = 32;
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 450;
export const GRAVITY = 800;

export const PLAYER_SPEED = 160;
export const PLAYER_RUN_SPEED = 240;
export const PLAYER_JUMP = -480;
export const PLAYER_JUMP_HOLD = -520;

export const LEVEL_TIME = 300;
export const COINS_FOR_LIFE = 100;
export const INITIAL_LIVES = 3;

// Gameplay tuning constants
export const BOSS_STOMP_THRESHOLD = 12;
export const ENEMY_STOMP_THRESHOLD = 10;
export const SHELL_KICK_SPEED = 300;
export const SHELL_STOMP_BOUNCE = -200;
export const BOSS_MAX_HITS = 3;
export const INVINCIBILITY_DURATION = 10000;
export const DAMAGE_INVINCIBILITY_DURATION = 1500;
export const POWER_GROW_SCALE = 1.35;
export const PROJECTILE_SPEED = 300;
export const PROJECTILE_LIFETIME = 2000;
export const SHOOT_COOLDOWN = 300;
export const FIRE_BAR_SEGMENT_SPACING = 14;
export const FIRE_BAR_ROTATION_SPEED = 0.03;

// Per-level time limits
export const LEVEL_TIME_LIMITS = [300, 350, 360, 300] as const;

export const CHARACTER_NAMES = ['Angelina', 'Anne', 'Lazaro', 'Pietro', 'Pinheiro'] as const;
export type CharacterName = typeof CHARACTER_NAMES[number];

export const LEVEL_NAMES = [
  { key: '1-1', title: 'Pátio Contaminado' },
  { key: '1-2', title: 'Tubulações Entupidas' },
  { key: '1-3', title: 'Bosque das Árvores Centenárias' },
  { key: '1-4', title: 'Quadra Poliesportiva' },
] as const;

export const COLORS = {
  SKY_BLUE: 0x5c94fc,
  GROUND_BROWN: 0x8b5e3c,
  GROUND_GREEN: 0x4caf50,
  BRICK_ORANGE: 0xc0762e,
  PIPE_GREEN: 0x2e8b2e,
  PIPE_GREEN_LIGHT: 0x3eab3e,
  COIN_GREEN: 0x4caf50,
  COIN_GREEN_DARK: 0x2e7d32,
  QUESTION_YELLOW: 0xf5c542,
  QUESTION_BROWN: 0x8b6914,
  UNDERGROUND_DARK: 0x1a1a2e,
  UNDERGROUND_STONE: 0x3d3d5c,
  TOXIC_GREEN: 0x7cfc00,
  TOXIC_BARREL: 0x4a0e0e,
  LAVA_ORANGE: 0xff4500,
  RECYCLE_GREEN: 0x00c853,
  WATER_BLUE: 0x29b6f6,
  SEED_BROWN: 0x795548,
  UI_WHITE: 0xffffff,
  UI_BLACK: 0x000000,
  DARK_BG: 0x0d0d0d,
};
