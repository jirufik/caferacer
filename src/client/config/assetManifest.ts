export const IMAGES: Array<{ key: string; path: string }> = [
  { key: 'backgroundS', path: 'images/CFLogoGame.gif' },
  { key: 'logoTextS', path: 'images/Text1.png' },
  { key: 'boardS', path: 'images/Board1.png' },
  { key: 'jirufikS', path: 'images/Jirufik_300.png' },
  { key: 'closeS', path: 'images/close.png' },
  { key: 'dangerS', path: 'images/danger.png' },
  { key: 'tonS', path: 'images/ton.png' },
  { key: 'aboutS', path: 'images/about.png' },
  { key: 'rulesS', path: 'images/rules.png' },
  { key: 'setplayersS', path: 'images/settingsplayers.png' },
  { key: 'rollS', path: 'images/roll.png' },
  { key: 'raceS', path: 'images/race.png' },
  { key: 'leftS', path: 'images/left.png' },
  { key: 'rightS', path: 'images/right.png' },
  { key: 'fonS', path: 'images/fon.png' },
  { key: 'startS', path: 'images/start.png' },
  { key: 'newgameS', path: 'images/newgame.png' },
  { key: 'finishS', path: 'images/finish.png' },
  { key: 'plusS', path: 'images/plus.png' },
  { key: 'minusS', path: 'images/minus.png' },
  { key: 'Pos1S', path: 'images/Pos1.png' },
  { key: 'Pos2S', path: 'images/Pos2.png' },
  { key: 'Pos3S', path: 'images/Pos3.png' },
  { key: 'TopSpeedS', path: 'images/TopSpeed.png' },
  { key: 'LoserS', path: 'images/Loser.png' },
  { key: 'HorribleS', path: 'images/Horrible.png' },
  { key: 'DesperateS', path: 'images/Desperate.png' },
];

export const PLAYER_TOKENS: Array<{ key: string; path: string }> = Array.from(
  { length: 12 },
  (_, i) => ({
    key: `fishkaS${i + 1}`,
    path: `images/fishka${i + 1}.png`,
  }),
);

export const RULES_SLIDES: Array<{ key: string; path: string }> = Array.from(
  { length: 11 },
  (_, i) => ({
    key: `slideRulesS${i + 1}`,
    path: `images/slideRules${i + 1}.png`,
  }),
);

export const SPRITESHEETS: Array<{
  key: string;
  path: string;
  frameWidth: number;
  frameHeight: number;
}> = [
  { key: 'qubicS', path: 'images/qubic.png', frameWidth: 66, frameHeight: 66 },
  { key: 'soundS', path: 'images/sound.png', frameWidth: 60, frameHeight: 60 },
  { key: 'checkS', path: 'images/check.png', frameWidth: 64, frameHeight: 64 },
  { key: 'btnAddDelS', path: 'images/btnAddDel.png', frameWidth: 114, frameHeight: 64 },
  { key: 'hardcoreS', path: 'images/hardcore.png', frameWidth: 78, frameHeight: 60 },
];

export const AUDIO: Array<{ key: string; path: string }> = [
  { key: 'diceroll', path: 'sounds/roll_dice.mp3' },
  { key: 'incafe', path: 'sounds/in_cafe.mp3' },
  { key: 'danger', path: 'sounds/danger.mp3' },
  { key: 'finish', path: 'sounds/finish.mp3' },
  { key: 'race', path: 'sounds/race.mp3' },
  { key: 'about', path: 'sounds/about.mp3' },
];
