# План модернизации CafeRacer — Детальная реализация

## Обзор проекта

- **Файлов кода:** 5 (серверных: 4, клиентских: 1)
- **Строк кода:** ~2870 (app.js: 51, www: 91, cafegame.js: 2660, routes: 20, views: 57)
- **Ассеты:** 57 PNG/GIF, 6 MP3
- **Phaser:** v2.6.2 → нужна миграция на v3
- **Ветка:** `modernize`
- **Главная проблема:** один файл `cafegame.js` на 2660 строк с 90+ глобальными переменными

---

## Фаза 1: Инфраструктура и инструменты (3–4 дня)

### 1.1 Обновить package.json

**Текущий файл:** `package.json` (18 строк)

**Удалить зависимости:**
- `body-parser` ~1.16.0 — встроен в Express с 4.16+
- `serve-favicon` ~2.3.2 — обслуживать через static middleware

**Обновить зависимости:**
```
express:       ~4.14.1  → ^4.21.0
cookie-parser: ~1.4.3   → ^1.4.7
debug:         ~2.6.0   → ^4.3.7
morgan:        ~1.7.0   → ^1.10.0
pug:           ~2.0.0-beta10 → ^3.0.3
```

**Добавить:**
```json
"type": "module",
"engines": { "node": ">=18.0.0" },
"scripts": {
  "dev": "concurrently \"npm run server:dev\" \"npm run client:dev\"",
  "server:dev": "nodemon ./src/server/bin/www.js",
  "client:dev": "vite",
  "build": "vite build",
  "start": "node ./src/server/bin/www.js",
  "lint": "eslint src/",
  "format": "prettier --write src/",
  "test": "vitest",
  "type-check": "tsc --noEmit"
},
"devDependencies": {
  "phaser": "^3.80.0",
  "vite": "^6.0.0",
  "typescript": "^5.7.0",
  "vitest": "^3.0.0",
  "@types/express": "^5.0.0",
  "@types/node": "^22.0.0",
  "eslint": "^9.0.0",
  "prettier": "^3.4.0",
  "nodemon": "^3.1.0",
  "concurrently": "^9.1.0"
}
```

### 1.2 Создать tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "sourceMap": true,
    "resolveJsonModule": true,
    "baseUrl": "./src",
    "paths": {
      "@client/*": ["client/*"],
      "@server/*": ["server/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "public"]
}
```

### 1.3 Создать vite.config.ts

```typescript
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src/client',
  publicDir: '../../public',
  build: {
    outDir: '../../dist/client',
    emptyOutDir: true,
    sourcemap: true
  },
  resolve: {
    alias: { '@': resolve(__dirname, 'src/client') }
  },
  server: {
    proxy: { '/': 'http://localhost:4002' }
  }
});
```

### 1.4 Реорганизовать структуру каталогов

Разбиение `cafegame.js` (2660 строк) на модули:

```
caferacer/
├── src/
│   ├── client/
│   │   ├── index.ts                       ← из cafegame.js:2-13,2654-2659
│   │   ├── config/
│   │   │   ├── gameConfig.ts              ← константы из cafegame.js:43-90
│   │   │   ├── assetManifest.ts           ← из cafegame.js:2449-2496 (preload)
│   │   │   └── keyboardConfig.ts          ← из cafegame.js:256-281,1593-1628
│   │   ├── types/
│   │   │   └── index.ts                   ← TypeScript интерфейсы
│   │   ├── core/
│   │   │   ├── GameState.ts               ← из cafegame.js:24-90 (gamesettings + флаги)
│   │   │   └── GameManager.ts             ← из cafegame.js:287-344,504-545 (createGame, beginGame)
│   │   ├── entities/
│   │   │   ├── Player.ts                  ← из cafegame.js:2543-2568 (Playerz)
│   │   │   ├── Dice.ts                    ← из cafegame.js:2570-2581 (Qubic)
│   │   │   └── Board.ts                   ← из cafegame.js:385-429 (returnXYSprite)
│   │   ├── systems/
│   │   │   ├── TurnManager.ts             ← из cafegame.js:796-883 (nextplayer, setcurplayer)
│   │   │   ├── MovementSystem.ts          ← из cafegame.js:983-1068 (raceonboard)
│   │   │   ├── CollisionSystem.ts         ← из cafegame.js:950-979 (setcafeplayer)
│   │   │   ├── MedalSystem.ts             ← из cafegame.js:636-783 (medals)
│   │   │   ├── AudioManager.ts            ← из cafegame.js:207-217 (звуки)
│   │   │   ├── InputHandler.ts            ← из cafegame.js:256-281 (клавиатура)
│   │   │   └── SaveManager.ts             ← НОВЫЙ (сохранение в localStorage)
│   │   ├── ai/
│   │   │   └── AIPlayer.ts               ← из cafegame.js:1164-1232 (robotplay)
│   │   ├── scenes/
│   │   │   ├── BootScene.ts               ← из cafegame.js:2407-2437 (StateBoot)
│   │   │   ├── GameScene.ts               ← из cafegame.js:98-578 (StateGame)
│   │   │   ├── MenuScene.ts               ← из cafegame.js:1369-2120 (StateMainMenu)
│   │   │   ├── RulesScene.ts              ← из cafegame.js:2252-2399 (StateRules)
│   │   │   └── AboutScene.ts              ← из cafegame.js:2127-2245 (StateAbout)
│   │   └── utils/
│   │       └── helpers.ts                 ← из cafegame.js:2630-2646 (in_array, shufflemas)
│   └── server/
│       ├── app.ts                         ← из app.js (51 строка)
│       ├── bin/
│       │   └── www.ts                     ← из bin/www (91 строка)
│       └── routes/
│           └── index.ts                   ← из routes/index.js (10 строк)
├── public/
│   ├── images/                            ← 57 файлов (без изменений)
│   └── sounds/                            ← 6 файлов (без изменений)
├── views/
│   ├── layout.pug
│   ├── index.pug                          ← убрать старые скрипты
│   └── error.pug
├── tests/
│   ├── unit/
│   │   ├── Dice.test.ts
│   │   ├── Player.test.ts
│   │   ├── Board.test.ts
│   │   ├── AIPlayer.test.ts
│   │   ├── GameState.test.ts
│   │   └── MedalSystem.test.ts
│   └── integration/
│       └── GameFlow.test.ts
├── dist/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .gitignore
```

### 1.5 Удалить vendor-файлы из репозитория

Удалить после настройки npm:
- `public/javascripts/phaser.js` (~3.1MB)
- `public/javascripts/phaser.min.js` (~791KB)
- `public/javascripts/phaser-input.min.js` (Fabrique плагин, не поддерживается)
- `public/javascripts/cafegame.js` (после миграции)

---

## Фаза 2: Модернизация серверной части (2–3 дня)

### 2.1 Конвертировать app.js → src/server/app.ts

**Текущий файл:** `app.js` (51 строка)

| Строка | Что менять | Как |
|---|---|---|
| 1–9 | `var` + `require()` | `import` + `const` |
| 11 | `var app = express()` | `const app: Express = express()` |
| 20–21 | `bodyParser.json()`, `.urlencoded()` | `express.json()`, `express.urlencoded()` |
| 25–30 | 6 маршрутов к одному обработчику | Массив путей + `router` |
| 33–37 | 404 handler: `var err`, anonymous function | `const err`, arrow function |
| 40–48 | error handler: `var`, anonymous function | `const`, arrow, типизация |
| 50 | `module.exports = app` | `export default app` |

### 2.2 Конвертировать bin/www → src/server/bin/www.ts

**Текущий файл:** 91 строка — аналогично magicball, порт 4002.

Все `var` → `const`/`let`, `require` → `import`, добавить типизацию.

### 2.3 Обновить routes/index.ts

Удалить `routes/users.js` (заглушка). Один маршрут рендерит `index`.

### 2.4 Обновить views/index.pug

**Текущий файл:** 42 строки — 4 тега `<script>` + аналитика Яндекс.Метрики.

**Убрать:**
- `script(src='javascripts/phaser.min.js')`
- `script(src='javascripts/phaser-input.min.js')`
- `script(src='javascripts/cafegame.js')`

**Добавить:**
- `<meta name="viewport" ...>`
- `<script type="module" src="/dist/client/index.js">`

---

## Фаза 3: Типы и базовые сущности (3–4 дня)

### 3.1 Создать src/client/types/index.ts

Типизация на основе cafegame.js:2543-2568 (Playerz) и :24-30 (gamesettings):

```typescript
export interface Player {
  // Основные свойства (Playerz constructor, строки 2545-2568)
  stopz: number;            // перегревы за ход
  goz: number;              // тоннаж (ходы вперёд) за ход
  posonboard: number;       // позиция на доске (0-36)
  namesprite: string;       // ключ спрайта ('fishkaS1'-'fishkaS12')
  robot: boolean;           // автопилот
  lap: number;              // текущий круг
  nameplayer: string;       // имя игрока
  sprite: Phaser.GameObjects.Sprite | null;

  // Статистика
  posInGame: number;        // позиция в финише
  maxTon: number;           // максимальный тоннаж за ход
  sumLoser: number;         // сколько раз отправлен в кафе
  sumStopz: number;         // всего перегревов
  sumBreak: number;         // сколько соперников выбил
  sumStep: number;          // шагов за текущую игру
  sumAllStep: number;       // шагов за все игры

  // Медали
  medalsPos1: number;
  medalsPos2: number;
  medalsPos3: number;
  medalsfastPlayer: number;
  medalsbreakingPlayer: number;
  medalshorriblePlayer: number;
  medalsloserPlayer: number;
}

export interface GameSettings {
  laps: number;                  // количество кругов (1-12)
  players: Player[];             // массив игроков (2-12)
  curplayers: number;            // индекс текущего игрока
  finishplayers: Player[];       // финишировавшие игроки
  playerRaceOnBoard: boolean;    // идёт ли движение фишки
}

export interface GameFlags {
  diceAnimating: boolean;        // QubicAnimations, строка 51
  gamePaused: boolean;           // flpausegame, строка 54
  nextPlayerTurn: boolean;       // flNextPlayer, строка 57
  gameFinished: boolean;         // flGameFinish, строка 60
  soundEnabled: boolean;         // flSound, строка 63
  tokenAnimating: boolean;       // fishkaanimation, строка 79
  hardcoreEnabled: boolean;      // flBreakPlayers, строка 82
  globalPause: boolean;          // flGlobalPause, строка 86
  newGame: boolean;              // flNewGame, строка 90
}

export interface BoardPosition {
  x: number;
  y: number;
}

export interface Medal {
  key: string;         // 'Pos1S', 'TopSpeedS', etc.
  statKey: keyof Player;
  label: string;
}

export interface DiceResult {
  value: number;    // 0 (перегрев) или 1 (тоннаж)
}
```

### 3.2 Создать src/client/entities/Player.ts

**Источник:** cafegame.js:2543-2568 (конструктор Playerz) + :358-382 (resetValuesPlayer)

```typescript
export class Player implements PlayerInterface {
  stopz = 0;
  goz = 0;
  posonboard = 0;
  namesprite: string;
  robot: boolean;
  lap = 1;
  nameplayer: string;
  sprite: Phaser.GameObjects.Sprite | null = null;
  posInGame = 0;
  maxTon = 0;
  sumLoser = 0;
  sumStopz = 0;
  sumBreak = 0;
  sumStep = 0;
  sumAllStep = 0;
  medalsPos1 = 0;
  medalsPos2 = 0;
  medalsPos3 = 0;
  medalsfastPlayer = 0;
  medalsbreakingPlayer = 0;
  medalshorriblePlayer = 0;
  medalsloserPlayer = 0;

  constructor(namesprite: string, robot: boolean, nameplayer: string) {
    this.namesprite = namesprite;
    this.robot = robot;
    this.nameplayer = nameplayer;
  }

  // Из resetValuesPlayer() строки 358-382
  reset(fullReset: boolean = false): void {
    this.stopz = 0;
    this.goz = 0;
    this.posonboard = 0;
    this.lap = 1;
    this.posInGame = 0;
    this.maxTon = 0;
    this.sumLoser = 0;
    this.sumStopz = 0;
    this.sumBreak = 0;
    this.sumStep = 0;
    if (fullReset) {
      this.sumAllStep = 0;
      this.medalsPos1 = 0;
      this.medalsPos2 = 0;
      this.medalsPos3 = 0;
      this.medalsfastPlayer = 0;
      this.medalsbreakingPlayer = 0;
      this.medalshorriblePlayer = 0;
      this.medalsloserPlayer = 0;
    }
  }

  sendToCafe(): void {
    this.posonboard = 0;
    this.sumLoser++;
  }
}
```

### 3.3 Создать src/client/entities/Dice.ts

**Источник:** cafegame.js:2570-2581 (конструктор Qubic)

```typescript
export class Dice {
  private sides: number[];

  constructor(sides: number[] = [1, 2, 3, 4, 5, 6]) {
    this.sides = sides;
  }

  roll(): number {
    return this.sides[Math.floor(Math.random() * this.sides.length)];
  }
}
```

**Текущие кубики (строки 33-35):**
```javascript
qubiczone = new Qubic([1, 0, 1, 1, 1, 0]);
qubicztwo = new Qubic([0, 1, 0, 1, 1, 1]);
qubiczthree = new Qubic([1, 1, 0, 1, 0, 1]);
```

### 3.4 Создать src/client/entities/Board.ts

**Источник:** cafegame.js:385-429 (returnXYSprite)

```typescript
export class Board {
  static readonly CELLS = 36;
  static readonly START = { x: 286, y: 580 };  // строки 43-44
  static readonly FINISH = { x: 286, y: 180 }; // строки 46-47

  // Из returnXYSprite() строки 385-429
  static getPosition(cellIndex: number): BoardPosition {
    // 4 сегмента движения по доске:
    // 1-4:   низ (влево)
    // 5-13:  лево (вверх)
    // 14-22: верх (вправо)
    // 23-31: право (вниз)
    // 32-36: низ (влево, к финишу)
    // ... алгоритм расчёта координат из строк 385-429
  }
}
```

### 3.5 Создать src/client/core/GameState.ts

**Источник:** cafegame.js:24-90 (все глобальные переменные)

Инкапсулировать все 20+ глобальных переменных в один управляемый объект:

```typescript
export class GameState {
  settings: GameSettings = {
    laps: 1,
    players: [],
    curplayers: 0,
    finishplayers: [],
    playerRaceOnBoard: false
  };

  flags: GameFlags = {
    diceAnimating: false,      // QubicAnimations, строка 51
    gamePaused: false,          // flpausegame, строка 54
    nextPlayerTurn: false,      // flNextPlayer, строка 57
    gameFinished: false,        // flGameFinish, строка 60
    soundEnabled: true,         // flSound, строка 63
    tokenAnimating: false,      // fishkaanimation, строка 79
    hardcoreEnabled: true,      // flBreakPlayers, строка 82
    globalPause: false,         // flGlobalPause, строка 86
    newGame: true               // flNewGame, строка 90
  };

  diceResults = { q1: 1, q2: 1, q3: 1 };  // znachq1-3, строки 38-40

  getCurrentPlayer(): Player {
    return this.settings.players[this.settings.curplayers];
  }

  getPlayerCount(): number {
    return this.settings.players.length;
  }

  isPlayerFinished(player: Player): boolean {
    return this.settings.finishplayers.includes(player);
  }

  addPlayer(namesprite: string, robot: boolean, name: string): void { ... }
  removePlayer(index: number): void { ... }
  resetForNewGame(): void { ... }
}

// Singleton для доступа из всех модулей
export const gameState = new GameState();
```

### 3.6 Создать src/client/utils/helpers.ts

**Источник:** cafegame.js:2630-2646

```typescript
// Из in_array() строки 2630-2635
export function includes<T>(value: T, array: T[]): boolean {
  return array.includes(value);  // нативный метод ES6
}

// Из shufflemas() строки 2638-2646 (Fisher-Yates)
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
```

---

## Фаза 4: Игровые системы (4–5 дней)

### 4.1 Создать src/client/systems/TurnManager.ts

**Источник:** cafegame.js:796-883 (nextplayer, setcurplayer)

```
Функции для извлечения:
- nextplayer()       строки 796-842 → TurnManager.endTurn()
- setcurplayer()     строки 845-883 → TurnManager.advanceToNextPlayer()
- playerroll()       строки 1235-1253 → TurnManager.rollDice()
- playerrace()       строки 912-938 → TurnManager.executeRace()
- zapolnimo4ki()     строки 1299-1323 → TurnManager.processDiceResults()
- TheEndAnimations() строки 1327-1352 → TurnManager.onDiceAnimationEnd()
```

### 4.2 Создать src/client/systems/MovementSystem.ts

**Источник:** cafegame.js:983-1068 (raceonboard и связанные)

```
Функции для извлечения:
- raceonboard()       строки 983-1068  → MovementSystem.moveToken()
- finishorendlap()    строки 1073-1103 → MovementSystem.checkLapOrFinish()
- viewAnimationLap()  строки 1128-1144 → MovementSystem.animateLapComplete()
- viewAnimationFinish() строки 1105-1125 → MovementSystem.animateFinish()
- setPosPlayers()     строки 886-910   → MovementSystem.repositionAllPlayers()
- setcafesprites()    строки 432-444   → MovementSystem.positionPlayersInCafe()
- setfinishsprites()  строки 447-455   → MovementSystem.positionFinishedPlayers()
```

**КРИТИЧЕСКАЯ ПРОБЛЕМА: setTimeout со строками**

Строка 1041: `setTimeout('raceonboard();', 500)` — это `eval()`-подобное поведение!

**Замена:**
```typescript
// Было (ОПАСНО):
setTimeout('raceonboard();', 500);

// Стало:
setTimeout(() => this.moveToken(), 500);
// Или лучше: this.scene.time.delayedCall(500, () => this.moveToken());
```

Все setTimeout со строками (10 мест в файле):

| Строка | Текущий код | Замена |
|---|---|---|
| 1041 | `setTimeout('raceonboard();', 500)` | `scene.time.delayedCall(500, () => movementSystem.moveToken())` |
| 1352 | `setTimeout('setAllButtonOut();', 500)` | `scene.time.delayedCall(500, () => ui.resetAllButtons())` |
| 1655 | `setTimeout('MainMenuButtonOut();', 500)` | `scene.time.delayedCall(500, () => resetMenuButton())` |
| 1682 | `setTimeout('MainMenuButtonOut();', 500)` | `scene.time.delayedCall(500, () => resetMenuButton())` |
| 1690 | `setTimeout('MainMenuButtonOut();', 500)` | `scene.time.delayedCall(500, () => resetMenuButton())` |
| 654 | `setTimeout('viewAnimationMedals();', 4000)` | `scene.time.delayedCall(4000, () => medalSystem.animate())` |

### 4.3 Создать src/client/systems/CollisionSystem.ts

**Источник:** cafegame.js:950-979 (setcafeplayer)

```
Функции для извлечения:
- setcafeplayer()  строки 950-979 → CollisionSystem.checkPlayerCollisions()
```

Логика: если текущий игрок стоит на той же клетке, что другой — отправить другого в кафе.

### 4.4 Создать src/client/systems/MedalSystem.ts

**Источник:** cafegame.js:636-783 (система медалей)

```
Функции для извлечения:
- setAllMedals()           строки 636-655  → MedalSystem.calculateAll()
- setTheMedal()            строки 663-710  → MedalSystem.awardMedal()
- viewAnimationMedals()    строки 737-763  → MedalSystem.animateNext()
- endAnimationMedals()     строки 765-772  → MedalSystem.onAnimationEnd()
- dontViewAnimationMedals() строки 774-783 → MedalSystem.clearAnimation()
- theendgame()             строки 580-632  → MedalSystem.onGameEnd()
```

7 типов медалей (строки 638-652):
```typescript
export const MEDALS: Medal[] = [
  { key: 'Pos1S',      statKey: 'medalsPos1',            label: '1st Place' },
  { key: 'Pos2S',      statKey: 'medalsPos2',            label: '2nd Place' },
  { key: 'Pos3S',      statKey: 'medalsPos3',            label: '3rd Place' },
  { key: 'TopSpeedS',  statKey: 'medalsfastPlayer',      label: 'Top Speed' },
  { key: 'HorribleS',  statKey: 'medalshorriblePlayer',  label: 'Horrible Player' },
  { key: 'DesperateS', statKey: 'medalsbreakingPlayer',  label: 'Desperate' },
  { key: 'LoserS',     statKey: 'medalsloserPlayer',     label: 'Loser' },
];
```

### 4.5 Создать src/client/systems/AudioManager.ts

**Источник:** cafegame.js:207-217 (аудио объекты) + :63-76 (flSound)

```typescript
export class AudioManager {
  private sounds: Map<string, Phaser.Sound.BaseSound> = new Map();
  private enabled = true;

  init(scene: Phaser.Scene): void {
    // Из строк 207-217:
    this.sounds.set('diceroll', scene.sound.add('diceroll'));
    this.sounds.set('incafe', scene.sound.add('incafe'));
    this.sounds.set('danger', scene.sound.add('danger'));
    this.sounds.set('finish', scene.sound.add('finish'));
    this.sounds.set('race', scene.sound.add('race'));
    this.sounds.set('about', scene.sound.add('about'));
  }

  play(key: string): void {
    if (this.enabled) this.sounds.get(key)?.play();
  }

  stop(key: string): void {
    this.sounds.get(key)?.stop();
  }

  toggle(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}
```

### 4.6 Создать src/client/ai/AIPlayer.ts

**Источник:** cafegame.js:1164-1232 (robotplay)

```typescript
export class AIController {
  private static readonly DECISION_DELAY = 3000;  // строка 1169

  static decide(player: Player, gameState: GameState): 'roll' | 'race' {
    const { laps } = gameState.settings;
    const canFinish = (Board.CELLS - player.posonboard) <= player.goz;
    const isLastLap = player.lap >= laps;

    // Строки 1182-1194: если последний круг и может финишировать
    if (isLastLap && canFinish && player.goz > 0) return 'race';

    // Строки 1196-1212: если может выбить соперника
    if (gameState.flags.hardcoreEnabled && player.goz > 0) {
      const targetPos = player.posonboard + player.goz;
      const canBreak = gameState.settings.players.some(p =>
        p !== player &&
        !gameState.isPlayerFinished(p) &&
        p.posonboard === targetPos
      );
      if (canBreak) return 'race';
    }

    // Строки 1214-1220: если 3+ перегревов — лучше ехать
    if (player.stopz >= 3 && player.goz > 0) return 'race';

    // Иначе бросать
    return 'roll';
  }
}
```

### 4.7 Создать src/client/systems/SaveManager.ts (НОВЫЙ)

**Текущая ситуация:** Нет сохранения — данные теряются при обновлении страницы.

```typescript
const STORAGE_KEY = 'caferacer_data';

interface SaveData {
  players: Array<{
    nameplayer: string;
    namesprite: string;
    robot: boolean;
    sumAllStep: number;
    medalsPos1: number;
    medalsPos2: number;
    medalsPos3: number;
    medalsfastPlayer: number;
    medalsbreakingPlayer: number;
    medalshorriblePlayer: number;
    medalsloserPlayer: number;
  }>;
  laps: number;
  hardcoreEnabled: boolean;
  soundEnabled: boolean;
}

export class SaveManager {
  static save(state: GameState): void {
    const data: SaveData = {
      players: state.settings.players.map(p => ({
        nameplayer: p.nameplayer,
        namesprite: p.namesprite,
        robot: p.robot,
        sumAllStep: p.sumAllStep,
        medalsPos1: p.medalsPos1,
        medalsPos2: p.medalsPos2,
        medalsPos3: p.medalsPos3,
        medalsfastPlayer: p.medalsfastPlayer,
        medalsbreakingPlayer: p.medalsbreakingPlayer,
        medalshorriblePlayer: p.medalshorriblePlayer,
        medalsloserPlayer: p.medalsloserPlayer,
      })),
      laps: state.settings.laps,
      hardcoreEnabled: state.flags.hardcoreEnabled,
      soundEnabled: state.flags.soundEnabled,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save:', e);
    }
  }

  static load(): SaveData | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
```

---

## Фаза 5: Миграция сцен Phaser v2 → v3 (5–7 дней)

### 5.1 Создать src/client/config/assetManifest.ts

**Источник:** cafegame.js:2449-2496 (preload)

Все ассеты из preload():
```typescript
export const IMAGES = {
  BACKGROUND:  { key: 'backgroundS', path: 'images/CFLogoGame.gif' },
  LOGO_TEXT:   { key: 'logoTextS', path: 'images/Text1.png' },
  BOARD:       { key: 'boardS', path: 'images/Board1.png' },
  JIRUFIK:     { key: 'jirufikS', path: 'images/Jirufik_300.png' },
  CLOSE:       { key: 'closeS', path: 'images/close.png' },
  DANGER:      { key: 'dangerS', path: 'images/danger.png' },
  TON:         { key: 'tonS', path: 'images/ton.png' },
  ABOUT:       { key: 'aboutS', path: 'images/about.png' },
  RULES:       { key: 'rulesS', path: 'images/rules.png' },
  SETTINGS:    { key: 'setplayersS', path: 'images/settingsplayers.png' },
  ROLL:        { key: 'rollS', path: 'images/roll.png' },
  RACE:        { key: 'raceS', path: 'images/race.png' },
  LEFT:        { key: 'leftS', path: 'images/left.png' },
  RIGHT:       { key: 'rightS', path: 'images/right.png' },
  FON:         { key: 'fonS', path: 'images/fon.png' },
  START:       { key: 'startS', path: 'images/start.png' },
  NEWGAME:     { key: 'newgameS', path: 'images/newgame.png' },
  FINISH:      { key: 'finishS', path: 'images/finish.png' },
  PLUS:        { key: 'plusS', path: 'images/plus.png' },
  MINUS:       { key: 'minusS', path: 'images/minus.png' },
  POS1:        { key: 'Pos1S', path: 'images/Pos1.png' },
  POS2:        { key: 'Pos2S', path: 'images/Pos2.png' },
  POS3:        { key: 'Pos3S', path: 'images/Pos3.png' },
  TOP_SPEED:   { key: 'TopSpeedS', path: 'images/TopSpeed.png' },
  LOSER:       { key: 'LoserS', path: 'images/Loser.png' },
  HORRIBLE:    { key: 'HorribleS', path: 'images/Horrible.png' },
  DESPERATE:   { key: 'DesperateS', path: 'images/Desperate.png' },
} as const;

// Фишки игроков (строка 2464, цикл 1-12)
export const PLAYER_TOKENS = Array.from({ length: 12 }, (_, i) => ({
  key: `fishkaS${i + 1}`,
  path: `images/fishka${i + 1}.png`
}));

// Слайды правил (строка 2480, цикл 1-11)
export const RULES_SLIDES = Array.from({ length: 11 }, (_, i) => ({
  key: `slideRulesS${i + 1}`,
  path: `images/slideRules${i + 1}.png`
}));

export const SPRITESHEETS = {
  QUBIC:     { key: 'qubicS', path: 'images/qubic.png', frameWidth: 66, frameHeight: 66 },
  SOUND:     { key: 'soundS', path: 'images/sound.png', frameWidth: 60, frameHeight: 60 },
  CHECK:     { key: 'checkS', path: 'images/check.png', frameWidth: 64, frameHeight: 64 },
  BTN_ADDDEL: { key: 'btnAddDelS', path: 'images/btnAddDel.png', frameWidth: 114, frameHeight: 64 },
  HARDCORE:  { key: 'hardcoreS', path: 'images/hardcore.png', frameWidth: 78, frameHeight: 60 },
} as const;

export const AUDIO = {
  DICE_ROLL: { key: 'diceroll', path: 'sounds/roll_dice.mp3' },
  IN_CAFE:   { key: 'incafe', path: 'sounds/in_cafe.mp3' },
  DANGER:    { key: 'danger', path: 'sounds/danger.mp3' },
  FINISH:    { key: 'finish', path: 'sounds/finish.mp3' },
  RACE:      { key: 'race', path: 'sounds/race.mp3' },
  ABOUT:     { key: 'about', path: 'sounds/about.mp3' },
} as const;
```

### 5.2 Конвертировать StateBoot → src/client/scenes/BootScene.ts

**Источник:** cafegame.js:2407-2437 (StateBoot) + :2440-2496 (preload) + :2418-2432 (createBoot)

| Строка | Phaser v2 | Phaser v3 |
|---|---|---|
| 2442 | `game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL` | `Phaser.Scale.FIT` в конфиге |
| 2450-2496 | `game.load.image/spritesheet/audio(...)` | `this.load.image/spritesheet/audio(...)` |
| 2453 | `this.load.spritesheet(key, path, w, h)` | `this.load.spritesheet(key, path, { frameWidth, frameHeight })` |
| 2421 | `game.add.sprite(...)` | `this.add.sprite(...)` |
| 2423 | `game.add.audio(...)` | `this.sound.add(...)` |
| 2427 | `game.add.tween(sprite.scale).to(...)` | `this.tweens.add({ targets: sprite, scaleX, scaleY, ... })` |
| 2436 | `setTimeout(function(){game.state.start('StateGame')}, 5000)` | `this.time.delayedCall(5000, () => this.scene.start('Game'))` |

### 5.3 Конвертировать StateGame → src/client/scenes/GameScene.ts

**Источник:** cafegame.js:98-578 (StateGame) — самая сложная сцена.

Это ядро игры. Сцена будет делегировать логику системам:

```typescript
export class GameScene extends Phaser.Scene {
  private turnManager!: TurnManager;
  private movementSystem!: MovementSystem;
  private collisionSystem!: CollisionSystem;
  private medalSystem!: MedalSystem;
  private audioManager!: AudioManager;
  private inputHandler!: InputHandler;

  constructor() {
    super({ key: 'Game' });
  }

  create(): void {
    // Из create() строки 107-283
    this.add.image(0, 0, 'boardS').setOrigin(0, 0);  // строка 110

    // Инициализация систем
    this.turnManager = new TurnManager(this, gameState);
    this.movementSystem = new MovementSystem(this, gameState);
    this.collisionSystem = new CollisionSystem(gameState);
    this.medalSystem = new MedalSystem(this, gameState);
    this.audioManager = new AudioManager();
    this.audioManager.init(this);
    this.inputHandler = new InputHandler(this);

    this.createDiceSprites();     // строки 127-134
    this.createUIElements();      // строки 137-204
    this.setupKeyboardBindings(); // строки 256-281
    this.turnManager.startGame(); // строки 221-233
  }

  update(): void {
    // Из update() строки 547-578
    if (gameState.flags.globalPause) return;

    if (gameState.flags.diceAnimating) {
      this.animateDice();  // строки 552-556
    }

    if (gameState.flags.nextPlayerTurn && !gameState.flags.tokenAnimating) {
      this.turnManager.endTurn();  // строки 558-567
    }

    if (gameState.flags.gameFinished) {
      this.medalSystem.onGameEnd();  // строки 571-576
    }
  }
}
```

Полная таблица замен Phaser API для GameScene:

| Строка | Phaser v2 | Phaser v3 |
|---|---|---|
| 110 | `game.add.sprite(0, 0, 'boardS')` | `this.add.image(0, 0, 'boardS').setOrigin(0,0)` |
| 127 | `game.add.sprite(740, 660, 'qubicS')` | `this.add.sprite(740, 660, 'qubicS')` |
| 128 | `qubic1.animations.add('bzzz', [0,1], 9, true)` | `this.anims.create({key:'bzzz', frames:..., frameRate:9, repeat:-1})` |
| 129 | `qubic1.animations.play('bzzz')` | `qubic1.play('bzzz')` |
| 138 | `game.add.text(x, y, text, style)` | `this.add.text(x, y, text, style)` |
| 144-163 | `sprite.inputEnabled=true; sprite.events.onInputDown.add(fn)` | `sprite.setInteractive(); sprite.on('pointerdown', fn)` |
| 166-179 | `sprite.events.onInputOver/Out.add(fn)` | `sprite.on('pointerover'/'pointerout', fn)` |
| 207-217 | `game.add.audio('key')` | `this.sound.add('key')` |
| 256-281 | `game.input.keyboard.addKey(Phaser.Keyboard.M)` | `this.input.keyboard!.on('keydown-M', fn)` |
| 260 | `key.onDown.add(fn)` | `this.input.keyboard!.on('keydown-KEY', fn)` |
| 440 | `game.world.bringToTop(sprite)` | `this.children.bringToTop(sprite)` |
| 748 | `game.add.tween(sprite.scale).to({...})` | `this.tweens.add({targets: sprite, ...})` |
| 1246 | `game.time.events.add(ms, fn, ctx)` | `this.time.delayedCall(ms, fn)` |

### 5.4 Конвертировать StateMainMenu → src/client/scenes/MenuScene.ts

**Источник:** cafegame.js:1369-2120 (~750 строк) — вторая по размеру часть.

Основные замены:

| Строка | Phaser v2 | Phaser v3 |
|---|---|---|
| 1391 | `game.stage.backgroundColor = '#fff'` | `this.cameras.main.setBackgroundColor('#fff')` |
| 1397 | `game.state.start('StateGame')` | `this.scene.start('Game')` |
| 1449 | `game.add.inputField(...)` (Fabrique) | `this.add.dom(x, y, inputElement)` |
| 1593-1628 | `game.input.keyboard.addKey(Phaser.Keyboard.ESC)` | `this.input.keyboard!.on('keydown-ESC', fn)` |
| 2020 | `game.add.group()` | `this.add.group()` |

**Критическая замена: Fabrique InputField (строка 1449)**

```typescript
// Было (строки 1449-1460):
inputUserName = game.add.inputField(602, 60, {
  font: '24px Eras Bold ITC',
  fill: '#212121',
  width: 200,
  height: 38,
  max: 12,
  placeHolder: '...'
});

// Стало (Phaser 3 DOM):
const input = document.createElement('input');
input.type = 'text';
input.maxLength = 12;
input.placeholder = '...';
input.style.cssText = 'font: 24px "Eras Bold ITC"; width:200px; height:38px;';
const domInput = this.add.dom(602, 60, input);
```

### 5.5 Конвертировать StateRules → src/client/scenes/RulesScene.ts

**Источник:** cafegame.js:2252-2399 (~150 строк)

Простая сцена: навигация по 11 слайдам (slideRulesS1-11).

### 5.6 Конвертировать StateAbout → src/client/scenes/AboutScene.ts

**Источник:** cafegame.js:2127-2245 (~120 строк)

Сцена с анимацией логотипа и бегущими титрами (19 строк текста из masCaptions[]).

### 5.7 Создать src/client/index.ts

**Источник:** cafegame.js:2-13 (инициализация) + :2654-2659 (регистрация состояний)

```typescript
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { MenuScene } from './scenes/MenuScene';
import { RulesScene } from './scenes/RulesScene';
import { AboutScene } from './scenes/AboutScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1024,      // строка 2
  height: 728,      // строка 2
  parent: 'gamezzz',
  backgroundColor: '#ffffff',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  dom: { createContainer: true },
  scene: [BootScene, GameScene, MenuScene, RulesScene, AboutScene]
};

new Phaser.Game(config);
```

---

## Фаза 6: Тестирование (3–4 дня)

### 6.1 Unit-тесты для Dice

**Файл:** `tests/unit/Dice.test.ts`

```
Тесты:
- roll() возвращает значение из заданных граней
- roll() никогда не возвращает значение вне граней (100 итераций)
- конструктор с пустым массивом — обработка ошибки
- конструктор по умолчанию [1,2,3,4,5,6]
- конкретные кубики из игры: [1,0,1,1,1,0], [0,1,0,1,1,1], [1,1,0,1,0,1]
```

### 6.2 Unit-тесты для Player

```
Тесты:
- конструктор создаёт игрока с правильными значениями
- reset(false) сбрасывает только текущую игру
- reset(true) сбрасывает всё включая медали
- sendToCafe() обнуляет позицию и увеличивает sumLoser
```

### 6.3 Unit-тесты для Board

```
Тесты:
- getPosition(0) возвращает стартовую позицию (286, 580)
- getPosition(1-4) — нижний ряд
- getPosition(5-13) — левая колонка
- getPosition(14-22) — верхний ряд
- getPosition(23-31) — правая колонка
- getPosition(32-36) — нижний ряд до финиша
- getPosition(36) — финишная позиция
```

### 6.4 Unit-тесты для AIController

```
Тесты:
- decide() = 'race' когда последний круг и может финишировать
- decide() = 'race' когда может выбить соперника (hardcore)
- decide() = 'roll' когда нет смысла ехать (0 перегревов, далеко от финиша)
- decide() = 'race' когда 3+ перегревов и есть тоннаж
- decide() = 'roll' когда goz = 0 (нет тоннажа)
```

### 6.5 Unit-тесты для GameState

```
Тесты:
- getCurrentPlayer() возвращает правильного игрока
- addPlayer() добавляет игрока
- removePlayer() удаляет игрока
- isPlayerFinished() корректно определяет
- resetForNewGame() сбрасывает все значения
```

### 6.6 Unit-тесты для MedalSystem

```
Тесты:
- calculateAll() присваивает медали 1-2-3 место
- calculateAll() определяет TopSpeed правильно
- calculateAll() определяет Horrible правильно
- calculateAll() определяет Desperate правильно
- calculateAll() определяет Loser правильно
```

### 6.7 Unit-тесты для SaveManager

```
Тесты:
- save() сохраняет данные в localStorage
- load() читает данные из localStorage
- load() возвращает null при пустом хранилище
- load() возвращает null при невалидном JSON
- save() обрабатывает QuotaExceededError
```

### 6.8 Integration-тесты

```
Тесты:
- Полный ход: roll → processDice → race → moveToken → endTurn
- Столкновение: два игрока на одной клетке
- Финиш круга: posonboard достигает 36
- Финиш игры: все игроки завершили все круги
- AI ход: робот принимает решение и выполняет действие
```

### 6.9 Тесты сервера (Supertest)

```
Тесты:
- GET / → 200
- GET /caferacer → 200
- GET /CafeRacer → 200
- GET /несуществующий → 404
```

---

## Фаза 7: Сохранение данных (2 дня)

### 7.1 Автосохранение настроек

При каждом изменении в MenuScene (добавление/удаление игрока, смена кругов, hardcore):
- Вызывать `SaveManager.save(gameState)`

### 7.2 Автозагрузка при старте

В BootScene при инициализации:
- `const saved = SaveManager.load()`
- Если есть данные — восстановить игроков и настройки
- Если нет — создать 2 игроков по умолчанию

### 7.3 Сохранение статистики между играми

Медали и `sumAllStep` сохраняются между играми (уже реализовано в Player.reset(false)).

---

## Фаза 8: Стили и PWA (1–2 дня)

### 8.1 Обновить style.css

Текущий файл: 9 строк. Добавить:
- CSS-переменные
- Сброс стилей
- Полноэкранный холст
- `prefers-reduced-motion`

### 8.2 PWA (опционально)

- `public/manifest.json`
- `public/sw.js`
- Кэширование 57 PNG + 6 MP3

---

## Фаза 9: Финализация (2–3 дня)

### 9.1 ESLint + Prettier

Настроить линтинг для TypeScript.

### 9.2 Обновить .gitignore

Добавить: `dist/`, `node_modules/`, `.env`

### 9.3 Полная проверка работоспособности

1. `npm install` — зависимости ставятся
2. `npm run build` — сборка без ошибок
3. `npm run dev` — игра запускается
4. `npm test` — все тесты проходят
5. `npm run lint` — нет ошибок

**Функциональная проверка:**
- [ ] Загрузка: Boot → Game (5 сек анимация лого)
- [ ] Доска отображается корректно
- [ ] Кнопка Start запускает игру
- [ ] Roll бросает кубики с анимацией
- [ ] Race двигает фишку по доске с анимацией
- [ ] AI (autopilot) принимает решения автоматически
- [ ] Столкновение: фишка соперника возвращается в кафе
- [ ] Завершение круга: текст "Lap X"
- [ ] Финиш: анимация и переход к медалям
- [ ] Медали: 7 типов отображаются с анимацией
- [ ] Меню (M): добавление/удаление игроков (2-12)
- [ ] Меню: выбор спрайта фишки (12 вариантов)
- [ ] Меню: ввод имени (max 12 символов)
- [ ] Меню: autopilot checkbox
- [ ] Меню: +/- круги (1-12)
- [ ] Меню: Hardcore mode toggle
- [ ] Меню: New Game
- [ ] Правила (H): навигация по 11 слайдам
- [ ] Об авторе (I): анимация логотипа + титры
- [ ] Звук (S): toggle on/off
- [ ] Клавиатура: M, S, H, I, LEFT, RIGHT, ENTER, ESC, Q, A, N, UP, DOWN
- [ ] Данные сохраняются между обновлениями страницы

### 9.4 Удалить старые файлы

После успешной миграции:
- `public/javascripts/` (весь каталог с phaser.js, cafegame.js и т.д.)
- Старые `app.js`, `bin/www`, `routes/`

---

## Сводная таблица трудозатрат

| Фаза | Задачи | Дни |
|---|---|---|
| 1. Инфраструктура | package.json, tsconfig, vite, структура, удаление vendor | 3–4 |
| 2. Серверная часть | app.ts, www.ts, routes, views | 2–3 |
| 3. Типы и сущности | types, Player, Dice, Board, GameState, helpers | 3–4 |
| 4. Игровые системы | TurnManager, MovementSystem, CollisionSystem, MedalSystem, AudioManager, AIPlayer, SaveManager | 4–5 |
| 5. Сцены Phaser v3 | 5 сцен (Boot, Game, Menu, Rules, About) + index.ts | 5–7 |
| 6. Тестирование | ~40 unit-тестов + integration + server | 3–4 |
| 7. Сохранение | localStorage persistence | 2 |
| 8. Стили и PWA | CSS, manifest, SW | 1–2 |
| 9. Финализация | Lint, проверка, удаление старого | 2–3 |
| **Итого** | | **25–34 дня (~6–7 недель)** |

---

## Маппинг: старые функции → новые модули

### cafegame.js → новые файлы

| Строки | Функция | Новый файл |
|---|---|---|
| 2–13 | Game init + plugin | `index.ts` |
| 24–90 | Глобальные переменные | `core/GameState.ts` |
| 98–105 | StateGame prototype | `scenes/GameScene.ts` |
| 107–283 | create() | `scenes/GameScene.ts:create()` |
| 287–344 | createGame() | `core/GameManager.ts` |
| 358–382 | resetValuesPlayer() | `entities/Player.ts:reset()` |
| 385–429 | returnXYSprite() | `entities/Board.ts:getPosition()` |
| 432–444 | setcafesprites() | `systems/MovementSystem.ts` |
| 447–455 | setfinishsprites() | `systems/MovementSystem.ts` |
| 459–545 | viewStart(), beginGame() | `core/GameManager.ts` |
| 547–578 | update() | `scenes/GameScene.ts:update()` |
| 580–632 | theendgame() | `systems/MedalSystem.ts` |
| 636–783 | Система медалей (7 функций) | `systems/MedalSystem.ts` |
| 796–883 | nextplayer(), setcurplayer() | `systems/TurnManager.ts` |
| 886–979 | setPosPlayers(), playerrace(), setcafeplayer() | `systems/MovementSystem.ts` + `CollisionSystem.ts` |
| 983–1068 | raceonboard() | `systems/MovementSystem.ts` |
| 1073–1144 | finishorendlap(), viewAnimation*() | `systems/MovementSystem.ts` |
| 1164–1232 | robotplay() | `ai/AIPlayer.ts` |
| 1235–1352 | playerroll(), zapolnimo4ki(), TheEndAnimations() | `systems/TurnManager.ts` |
| 1369–2120 | StateMainMenu (все) | `scenes/MenuScene.ts` |
| 2127–2245 | StateAbout (все) | `scenes/AboutScene.ts` |
| 2252–2399 | StateRules (все) | `scenes/RulesScene.ts` |
| 2407–2496 | StateBoot + preload | `scenes/BootScene.ts` |
| 2505–2524 | getPlayer(), getCountPlayers() | `core/GameState.ts` |
| 2527–2541 | goodBuyStateGame() | `core/GameManager.ts` |
| 2543–2568 | Playerz constructor | `entities/Player.ts` |
| 2570–2581 | Qubic constructor | `entities/Dice.ts` |
| 2584–2609 | addplayer() | `core/GameState.ts:addPlayer()` |
| 2612–2627 | allowDel() | `core/GameState.ts` |
| 2630–2646 | in_array(), shufflemas() | `utils/helpers.ts` |
| 2654–2659 | State registration | `index.ts` |

---

## Чеклист готовности

- [ ] package.json обновлён, `npm install` работает
- [ ] TypeScript компилируется без ошибок (`npm run type-check`)
- [ ] Vite собирает клиентский бандл (`npm run build`)
- [ ] Сервер запускается на порту 4002
- [ ] cafegame.js (2660 строк) разбит на 20+ модулей
- [ ] 0 глобальных переменных (все в GameState)
- [ ] 0 использований `var` (только `const`/`let`)
- [ ] 0 prototype-паттернов (только ES6 классы)
- [ ] 0 `setTimeout` со строками (все заменены на arrow functions)
- [ ] Все 5 сцен Phaser 3 работают (Boot → Game → Menu/Rules/About)
- [ ] Vendor-файлы удалены (phaser.js, phaser.min.js, phaser-input.min.js)
- [ ] Fabrique InputField заменён на DOM input
- [ ] Добавлено сохранение в localStorage
- [ ] Все клавиатурные хоткеи работают (13 привязок)
- [ ] AI автопилот работает
- [ ] Система медалей работает (7 типов)
- [ ] Все тесты проходят (`npm test`)
- [ ] ESLint не показывает ошибок (`npm run lint`)
