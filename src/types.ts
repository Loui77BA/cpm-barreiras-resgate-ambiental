export type PowerState = 'small' | 'big' | 'fire' | 'invincible';
export type PlayerState = 'idle' | 'walking' | 'running' | 'jumping' | 'falling' | 'dead' | 'flagpole';

export interface EntityPlacement {
  type: 'goomba' | 'koopa' | 'koopa-fly' | 'coin' | 'block-question' | 'block-brick' |
        'pipe' | 'flag' | 'boss' | 'ecoponto' | 'acid-drop' | 'moving-platform' | 'fire-bar' | 'secret-star';
  x: number;
  y: number;
  properties?: Record<string, unknown>;
}

export interface LevelData {
  name: string;
  title: string;
  width: number;
  height: number;
  tileMap: number[][];
  background: string;
  timeLimit: number;
  spawnPoint: { x: number; y: number };
  entities: EntityPlacement[];
  isDark?: boolean;
  hasCeiling?: boolean;
}

export interface GameState {
  selectedCharacter: string;
  lives: number;
  score: number;
  coins: number;
  currentLevel: number;
  powerState: PowerState;
}

export const TILE = {
  EMPTY: 0,
  GROUND: 1,
  BRICK: 2,
  QUESTION: 3,
  PIPE_TOP_LEFT: 4,
  PIPE_TOP_RIGHT: 5,
  PIPE_BODY_LEFT: 6,
  PIPE_BODY_RIGHT: 7,
  UNDERGROUND: 8,
  WOOD: 9,
  BARREL: 10,
  GROUND_BOTTOM: 11,
  INVISIBLE_WALL: 12,
} as const;
