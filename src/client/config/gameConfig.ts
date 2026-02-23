export const GAME = {
  WIDTH: 1024,
  HEIGHT: 728,
  PARENT: 'gamezzz',
  BG_COLOR: '#ffffff',
} as const;

export const BOARD = {
  CELLS: 36,
  START_X: 286,
  START_Y: 580,
  FINISH_X: 286,
  FINISH_Y: 180,
  SPRITE_START_X: 298,
  SPRITE_START_Y: 580,
  CELL_SIZE: 72,
  CAFE_OFFSET_Y: 80,
  PLAYER_OFFSET: 12,
} as const;

export const DICE_CONFIG = {
  DICE_1_SIDES: [1, 0, 1, 1, 1, 0],
  DICE_2_SIDES: [1, 0, 1, 0, 1, 0],
  DICE_3_SIDES: [1, 0, 1, 0, 1, 0],
  ANIMATION_DURATION: 1250,
  FRAME_RATE: 9,
} as const;

export const GAMEPLAY = {
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 12,
  MIN_LAPS: 1,
  MAX_LAPS: 12,
  OVERHEAT_LIMIT: 5,
  AI_DECISION_DELAY: 3000,
  MOVE_DELAY: 500,
} as const;

export const UI = {
  DICE_1_POS: { x: 740, y: 660 },
  DICE_2_POS: { x: 812, y: 660 },
  DICE_3_POS: { x: 882, y: 660 },
  TON_POS: { x: 740, y: 450 },
  TON_TEXT_POS: { x: 820, y: 460 },
  DANGER_POS: { x: 740, y: 520 },
  DANGER_TEXT_POS: { x: 820, y: 530 },
  CUR_PLAYER_TEXT_POS: { x: 740, y: 300 },
  CUR_LAP_TEXT_POS: { x: 740, y: 405 },
  CUR_PLAYER_SPRITE_POS: { x: 740, y: 350 },
  ABOUT_POS: { x: 770, y: 237 },
  RULES_POS: { x: 770, y: 172 },
  SETTINGS_POS: { x: 770, y: 42 },
  SOUND_POS: { x: 770, y: 107 },
  RACE_POS: { x: 900, y: 622 },
  ROLL_POS: { x: 780, y: 622 },
  START_POS: { x: 364 },
  TEXT_STYLE: { fontFamily: 'Eras Bold ITC', fontSize: '36px', color: '#000000' },
  TEXT_STYLE_30: {
    fontFamily: 'Eras Bold ITC',
    fontSize: '30px',
    color: '#000000',
    fontStyle: 'bold',
  },
} as const;

export const MENU = {
  SPRITE_PLAYER_X: 512,
  SPRITE_PLAYER_Y: 60,
  CLOSE_POS: { x: 980, y: 50 },
} as const;
