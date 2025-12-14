// Tetris game constants and logic
export const TETRIS = {
  COLS: 10,
  ROWS: 20,
  BLOCK_SIZE: 30,
  SHAPES: [
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[0, 1, 0], [1, 1, 1]], // T
    [[1, 1, 0], [0, 1, 1]], // S
    [[0, 1, 1], [1, 1, 0]], // Z
    [[1, 0, 0], [1, 1, 1]], // L
    [[0, 0, 1], [1, 1, 1]], // J
  ],
  COLORS: ['#00f0f0', '#f0f000', '#a000f0', '#00f000', '#f00000', '#f0a000', '#0000f0']
};

export const FLAPPY_BIRD = {
  GRAVITY: 0.6,
  JUMP_STRENGTH: -10,
  PIPE_GAP: 150,
  PIPE_WIDTH: 80,
  BIRD_SIZE: 30
};

export const SPACE_INVADERS = {
  ALIEN_ROWS: 5,
  ALIEN_COLS: 11,
  ALIEN_SIZE: 30,
  PLAYER_SIZE: 40,
  BULLET_SPEED: 7
};

export const BREAKOUT = {
  PADDLE_WIDTH: 100,
  PADDLE_HEIGHT: 20,
  BALL_RADIUS: 8,
  BRICK_ROWS: 5,
  BRICK_COLS: 10
};
