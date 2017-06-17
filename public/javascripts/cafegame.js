
game = new Phaser.Game(
    1024,
    728,
    Phaser.AUTO,
    '#gamezzz'
);

///Добавляем плагин ввода текста
Phaser.Device.whenReady(function () {
    game.plugins.add(Fabrique.Plugins.InputField);
    //game.plugins.add(Fabrique.Plugins.NineSlice);
});
///Прверить в игре десктоп или мобильный девайс можно
///if (!game.device.desktop) 


/////////////////////
//                 // 
//   Global Var    //
//                 //
/////////////////////
///Основные настройки текщей игры
var gamesettings = {
    laps: 1,
    players: [],
    curplayers: 0,
    finishplayers: [],
    playerRaceOnBoard: false
};

///Создадим 3 кубика (1 - тонна; 0 - перегрев)
var qubiczone = new Qubic([1, 0, 1, 1, 1, 0]);
var qubicztwo = new Qubic([1, 0, 1, 0, 1, 0]);
var qubiczthree = new Qubic([1, 0, 1, 0, 1, 0]);

///Значение кубиков после броска
var znachq1 = 1;
var znachq2 = 1;
var znachq3 = 1;

///Положение на старте первой фишки
var START_POS_X = 286;
var START_POS_Y = 580;

///Положение на финише первой фишки
var FINISH_POS_X = 286;
var FINISH_POS_Y = 180;

///Анимация кубика
var QubicAnimations = false;

///Пауза для робота
var flpausegame = false;

///Флаг перехода к следующему игроку
var flNextPlayer = false;

///Флаг игра закончена
var flGameFinish = false;

///Флаг звука
var flSound = true;

///Звук кубиков
var soundroll;

///Звук когда фишка улетает в начало круга
var soundincafe;

var soundabout;

///Звук когда перегрев
var sounddanger;

var soundfinish;

///Анимация движения фишки
var fishkaanimation = false;

///Будем ли сбрасывать игроков в игре
var flBreakPlayers = true;

///Флаг глобальной паузы принимает иситину когда текущий 
///стэйт не игра т.е. не StateGame
var flGlobalPause = false;

///Флаг новой игры, если истина то создаем новую игру
///прервав текущую 
var flNewGame = true;


/////////////////////
//                 // 
//   State Game    //
//                 //
/////////////////////
var StateGame = function () {

};

StateGame.prototype = {
    create: function () { create(); },
    update: function () { update(); }
};

function create() {

    ///Добавим спрайт доски игры
    game.add.sprite(0, 0, 'boardS');

    createGame();

    // //1
    // ///Создадим тестовых игроков
    // createtestplayers();

    //1
    // ///Жеребьевка перемешаем игроков в случайном порядке
    // shufflemas(gamesettings.players);

    //1
    // ///Установим текущего игрока
    // gamesettings.curplayers = 0;

    ///Добавим спрайты и анимацию для каждого кубика
    qubic1 = game.add.sprite(740, 660, 'qubicS');
    qubic1.animations.add('bzzz', [0, 1], 9, true);

    qubic2 = game.add.sprite(812, 660, 'qubicS');
    qubic2.animations.add('bzzz2', [0, 1], 9, true);

    qubic3 = game.add.sprite(882, 660, 'qubicS');
    qubic3.animations.add('bzzz3', [0, 1], 9, true);

    ///Отобразим тонны игрока на игровом поле
    tonsprite = game.add.sprite(740, 450, 'tonS');
    textgo = game.add.text(820, 460, 'X 0', { font: 'Eras Bold ITC', fontSize: '36px', fill: '#000' });

    ///Отобразим перегревы игрока на игровом поле
    dangersprite = game.add.sprite(740, 520, 'dangerS');
    textstop = game.add.text(820, 530, 'X 0', { font: 'Eras Bold ITC', fontSize: '36px', fill: '#000' });

    aboutSprite = game.add.sprite(770, 237, 'aboutS');
    aboutSprite.inputEnabled = true;
    aboutSprite.anchor.setTo(0.5, 0.5);
    aboutSprite.events.onInputDown.add(viewAbout, this);
    aboutSprite.events.onInputOver.add(overMenuSprite, this);
    aboutSprite.events.onInputOut.add(outMenuSprite, this);

    rulesSprite = game.add.sprite(770, 172, 'rulesS');
    rulesSprite.inputEnabled = true;
    rulesSprite.anchor.setTo(0.5, 0.5);
    rulesSprite.events.onInputDown.add(viewRules, this);
    rulesSprite.events.onInputOver.add(overMenuSprite, this);
    rulesSprite.events.onInputOut.add(outMenuSprite, this);

    setplayersSprite = game.add.sprite(770, 42, 'setplayersS');
    setplayersSprite.inputEnabled = true;
    setplayersSprite.anchor.setTo(0.5, 0.5);
    setplayersSprite.events.onInputDown.add(viewMainMenu, this);
    setplayersSprite.events.onInputOver.add(overMenuSprite, this);
    setplayersSprite.events.onInputOut.add(outMenuSprite, this);

    ///Отобразим вкл/выкл звук
    soundSprite = game.add.sprite(770, 107, 'soundS');
    soundSprite.frame = 0;
    soundSprite.inputEnabled = true;
    soundSprite.anchor.setTo(0.5, 0.5);
    soundSprite.events.onInputDown.add(SoundChange, this);
    soundSprite.events.onInputOver.add(overMenuSprite, this);
    soundSprite.events.onInputOut.add(outMenuSprite, this);

    if (flSound === true) {
        soundSprite.frame = 0;
    }
    else {
        soundSprite.frame = 1;
    }

    ///Разместим слово Рэйс и назначим ему обработчики
    raceSprite = game.add.sprite(900, 622, 'raceS');
    raceSprite.inputEnabled = true;
    raceSprite.anchor.setTo(0.5, 0.5);
    raceSprite.events.onInputDown.add(playerrace, this);
    raceSprite.events.onInputOver.add(overMenuSprite, this);
    raceSprite.events.onInputOut.add(outMenuSprite, this);


    ///Разместим слово Roll и назначим ему обработчики
    rollSprite = game.add.sprite(780, 622, 'rollS');
    rollSprite.inputEnabled = true;
    rollSprite.anchor.setTo(0.5, 0.5);
    rollSprite.events.onInputDown.add(playerroll, this);
    rollSprite.events.onInputOver.add(overMenuSprite, this);
    rollSprite.events.onInputOut.add(outMenuSprite, this);

    ///Текст текущий игрок
    textCurPlayer = game.add.text(740, 300, '', { font: 'Eras Bold ITC', fontSize: '36px', fill: '#000' });
    textCurPlayer.inputEnabled = false;

    ///Текущий круг из кругов
    textCurLap = game.add.text(740, 405, '', { font: 'Eras Bold ITC', fontSize: '36px', fill: '#000' });
    textCurLap.inputEnabled = false;

    ///Добавим звук кубиков
    soundroll = game.add.audio('diceroll');

    ///Добавим звук фишка в кафэ
    soundincafe = game.add.audio('incafe');

    ///Добавим звук перегрева
    sounddanger = game.add.audio('danger');

    soundfinish = game.add.audio('finish');

    soundrace = game.add.audio('race');

    ///Если новая игра или новый этап то запретим нажатие кубиков и Рэйс
    ///Выведем START
    viewStart();

    ///Выедем тонны и перегревы
    outtext();

    ///Заполним текст текущий игрок именем текущего игрока
    settextcurplayer();

    ///Отобразим спрайт текущего игрока
    setspritecurplayer();

    ///Напишем текущий круг текущего игрока
    setlapcurplayer();
    //1
    ///Флаг перехода к следующему игроку
    //flNextPlayer = false;

    //1
    // ///Обнулим массив финишироваших игроков
    // gamesettings.finishplayers = [];

    //alert(gamesettings.players[gamesettings.curplayers]);
    //gamesettings.finishplayers.push(gamesettings.players[gamesettings.curplayers]);
    //alert(gamesettings.players[0] == gamesettings.finishplayers[0]);

    ///Снимим флаг глобальной паузы т.к. вернулись в игру
    if (!flGameFinish && !flNewGame) {
        flGlobalPause = false;
    }

    if ((!flNewGame) && (gamesettings.playerRaceOnBoard)) {
        raceonboard();
    }

    ///Откроем MainMenu
    keyMenu = game.input.keyboard.addKey(Phaser.Keyboard.M);
    keyMenu.onDown.add(keyPress, this);

    ///Вкл/Выкл звук
    keySound = game.input.keyboard.addKey(Phaser.Keyboard.S);
    keySound.onDown.add(keyPress, this);

    ///Откроем Help
    keyHelp = game.input.keyboard.addKey(Phaser.Keyboard.H);
    keyHelp.onDown.add(keyPress, this);

    ///Откроем About
    keyAbout = game.input.keyboard.addKey(Phaser.Keyboard.I);
    keyAbout.onDown.add(keyPress, this);

    ///Race
    keyRace = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    keyRace.onDown.add(keyPress, this);

    ///Roll
    keyRoll = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    keyRoll.onDown.add(keyPress, this);

    ///Start
    keyStart = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    keyStart.onDown.add(keyPress, this);

}

///Создаем состояние игры, либо новое если новая игра
///Либо восстанавливаем состояние игры на момент прерывания
function createGame() {

    ///Новая игра
    if (flNewGame) {
        ///Создадим игроков по умолчанию если нет игроков в игре
        var countPlayers = getCountPlayers();
        if (countPlayers === 0) {
            createtestplayers();
        }
        ///Сбрасываем все показатели и медали
        var players = gamesettings.players;
        for (var i = 0; i < countPlayers; i++) {
            resetValuesPlayer(players[i], flNewGame);
        }
        ///Жеребьевка перемешаем игроков в случайном порядке
        //shufflemas(gamesettings.players);
        ///Установим текущего игрока
        gamesettings.curplayers = 0;
        ///Поставим фишки игроков на стартовую позицию
        var firstpos = START_POS_X;
        var countPlayers = getCountPlayers();
        for (i = 0; i < countPlayers; i++) {
            var player = getPlayer(i);
            player.sprite = game.add.sprite(firstpos + 12, START_POS_Y, player.namesprite);
            firstpos = firstpos + 12;
        }
        ///Обнулим массив финишироваших игроков
        gamesettings.finishplayers = [];
        ///Переход хода к следующему игроку
        flNextPlayer = false;
    }
    ///Продолжаем игру
    else {
        ///Раставим спрайты игроков
        var firstpos = START_POS_X;
        var countPlayers = getCountPlayers();
        for (var i = 0; i < countPlayers; i++) {
            ///Если игрок в кафе
            var player = getPlayer(i);
            if (player.posonboard === 0) {
                player.sprite = game.add.sprite(firstpos + 12, START_POS_Y, player.namesprite);
                firstpos = firstpos + 12;
            }
            ///Если игрок на доске
            else {
                otvet = returnXYSprite(player.posonboard);
                player.sprite = game.add.sprite(otvet.x, otvet.y, player.namesprite);
            }
        }
    }
    ///Раставим фишки финишировавших игроков
    setfinishsprites();
    ///т.к. игра создана сбросим флаг новой игры
    //flNewGame = false;
    ///Пауза для робота
    flpausegame = false;

}

///Создадим двух тестовых игроков
function createtestplayers() {
    gamesettings.players = [];
    gamesettings.finishplayers = [];
    addplayer('fishkaS1', false, 'You');
    addplayer('fishkaS3', true, 'Player1');
    addplayer('fishkaS2', true, 'Player2');
}

///Обнулим показатели игроков. Все если новая игра
///Если новый этап игры(продолжаем игру) то Обнулим
///показатели в текущей игре
function resetValuesPlayer(player, allvalues) {
    if (typeof allvalues != 'boolean') {
        allvalues = false;
    }
    player.stopz = 0;
    player.goz = 0;
    player.posonboard = 0;
    player.lap = 1;
    player.posInGame = 0; ///Место игрока в текущей игре
    player.maxTon = 0; ///Самое большое количество тон выброшеных игроком
    player.sumLoser = 0; ///Сколько раз игрок отправлялся в кафэ
    player.sumStopz = 0; ///Количество перегревов в текущей игре
    player.sumBreak = 0; ///Сколько раз игрок отправлял в кафэ
    player.sumStep = 0; ///Количес
    if (allvalues) {
        player.sumAllStep = 0;
        player.medalsPos1 = 0; ///Первое место
        player.medalsPos2 = 0; ///Второе место
        player.medalsPos3 = 0; ///Третье место
        player.medalsfastPlayer = 0; ///Самый быстрый ход (больше всего выбрашено тон в игре)
        player.medalsbreakingPlayer = 0; ///Самый ломающийся (больше всего словил перегревов за игру)
        player.medalshorriblePlayer = 0; ///Самый ужасный (больше всех отправил игроков в кафэ)
        player.medalsloserPlayer = 0; //
    }
}

///Вернем координаты спрайта в зависимости от позиции на доске
function returnXYSprite(tmpPos) {
    var x = 298;
    var y = 580;
    ///Если фишка игрока в кафэ
    if (tmpPos === 0) {
        x = 298;
        y = 580;
    }
    ///Иначе если фишка в игре
    else {
        var tmpPosOnBoard = 0;

        while (tmpPosOnBoard < tmpPos) {
            ///Выводим фишку из кафе на старт 
            if (tmpPosOnBoard === 0) {
                y = y + 80;
            }
            ///Идем по низу
            else if ((tmpPosOnBoard >= 1) && (tmpPosOnBoard <= 4)) {
                x -= 72;
            }
            ///Идем слева
            else if ((tmpPosOnBoard >= 5) && (tmpPosOnBoard <= 13)) {
                y -= 72;
            }
            ///Идем по верху
            else if ((tmpPosOnBoard >= 14) && (tmpPosOnBoard <= 22)) {
                x += 72;
            }
            ///Идем справа
            else if ((tmpPosOnBoard >= 23) && (tmpPosOnBoard <= 31)) {
                y += 72;
            }
            ///Идем по низу
            else if ((tmpPosOnBoard >= 32) && (tmpPosOnBoard <= 36)) {
                x -= 72;
            }
            tmpPosOnBoard++;
        }
    }
    return {
        x: x,
        y: y
    };
}

///Разместим фишки игроков в кафе
function setcafesprites() {
    var firstpos = START_POS_X;
    var countPlayers = getCountPlayers();
    for (var i = 0; i < countPlayers; i++) {
        var player = getPlayer(i);
        if (player.posonboard === 0) {
            player.sprite.x = firstpos;
            player.sprite.y = START_POS_Y;
            game.world.bringToTop(player.sprite);
            firstpos = firstpos + 12;
        }
    }
}

///Разместим фишки финишировавших игроков
function setfinishsprites() {
    var firstpos = FINISH_POS_X;
    for (var i = 0; i < gamesettings.finishplayers.length; i++) {
        gamesettings.finishplayers[i].sprite.x = firstpos;
        gamesettings.finishplayers[i].sprite.y = FINISH_POS_Y;
        game.world.bringToTop(gamesettings.finishplayers[i].sprite);
        firstpos = firstpos + 12;
    }
}

///Если новая игра или новый этап то запретим нажатие куиков и Рэйс
///Выведем START
function viewStart() {
    if (flGameFinish || flNewGame) {
        raceSprite.inputEnabled = false;
        rollSprite.inputEnabled = false;
        startSprite = game.add.sprite(364, game.world.centerY, 'startS');
        startSprite.anchor.setTo(0.5, 0.5);
        startSprite.inputEnabled = true;
        startSprite.events.onInputDown.add(beginGame, this);
        startSprite.events.onInputOver.add(overMenuSprite, this);
        startSprite.events.onInputOut.add(outMenuSprite, this);
        flGlobalPause = true;
    }
}

///Выведем значения перегревов и тонн
function outtext() {
    var curPlayer = getPlayer();
    textgo.text = 'X ' + curPlayer.goz;
    textstop.text = 'X ' + curPlayer.stopz;
}

///Напишем имя текущего игрока
function settextcurplayer() {
    var curPlayer = getPlayer();
    textCurPlayer.text = curPlayer.nameplayer;
}

///Напишем текущий круг текущего игрока
function setlapcurplayer() {
    var curPlayer = getPlayer();
    var lap = curPlayer.lap;
    if (lap > gamesettings.laps) {
        lap--;
    }
    textCurLap.text = 'Lap: ' + lap + ' of ' + gamesettings.laps;
}

///Отобразим спрайт текущего игрока
function setspritecurplayer() {
    var curPlayer = getPlayer();
    spriteCurPlayer = game.add.sprite(740, 350, curPlayer.namesprite);
    //spriteCurPlayer.destroy();
}

///Начнем игру нажали START
function beginGame() {
    ///Убираем старт
    startSprite.destroy();
    ///Обнуляем все показатели текущей игры и медали у всех игроков если новая игра
    ///Если новый этап то обнуляем только показатели текущей игры медали не трогаем
    var countPlayers = getCountPlayers();
    var players = gamesettings.players;
    for (var i = 0; i < countPlayers; i++) {
        resetValuesPlayer(players[i], flNewGame);
    }
    ///Жеребьевка перемешаем игроков в случайном порядке
    shufflemas(gamesettings.players);
    ///Установим текущего игрока
    gamesettings.curplayers = 0;
    ///Обнулим финишировавших игроков
    gamesettings.finishplayers = [];
    ///Поставим фишки игроков на стартовую позицию
    players = gamesettings.players;
    var firstpos = START_POS_X;
    for (i = 0; i < countPlayers; i++) {
        var player = players[i];
        player.sprite.x = firstpos + 12;
        player.sprite.y = START_POS_Y;
        firstpos = firstpos + 12;
        game.world.bringToTop(player.sprite);
    }
    ///Выедем тонны и перегревы
    outtext();

    ///Заполним текст текущий игрок именем текущего игрока
    settextcurplayer();

    ///Отобразим спрайт текущего игрока
    setspritecurplayer();

    ///Напишем текущий круг текущего игрока
    setlapcurplayer();
    ///Сбрасываем все флаги тем самым начинаем игру
    flNewGame = false;
    flGameFinish = false;
    flGlobalPause = false;
}

function update() {
    ///Если не стэйт игры приостановим все расчеты/ходы
    if (!flGlobalPause) {
        ///Если анимация включена то анимируем кубики
        ///Иначе отображаем то что выпало на кубике
        if (QubicAnimations) {
            qubic1.animations.play('bzzz');
            qubic2.animations.play('bzzz2');
            qubic3.animations.play('bzzz3');
        }
        else {
            setspritequbicz();

            ///Даем роботу сходить только после того как закончилась анимация ходьбы фишки  
            ///и анимация кидания кубика роботом
            ///если был ход то в конце хода запускается функция nextplayer для того что бы робот 
            ///не кинул кубик после того как принял решение ехать
            if (!flpausegame && !fishkaanimation) {
                ///Если игрок робот то запустим АИ
                robotplay();
            }

        }
        ///Если фишка еще двиагется ничего не делаем, ждем пока закончит передвижение
        if (!fishkaanimation) {
            ///Проверяем перегревы если их 5 и больше переход хода
            nextplayer();
            ///Финиш игры, выводим титры
            theendgame();
        }
    }
}

function keyPress(tmpKey) {
    ///Откроем MainMenu
    if (tmpKey.keyCode === keyMenu.keyCode) {
        viewMainMenu();
    }
    ///Вкл/Выкл звук
    if (tmpKey.keyCode === keySound.keyCode) {
        SoundChange(soundSprite);
    }
    ///Help
    if (tmpKey.keyCode === keyHelp.keyCode) {
        viewRules();
    }
    ///About
    if (tmpKey.keyCode === keyAbout.keyCode) {
        viewAbout();
    }
    ///Roll
    if (rollSprite.inputEnabled) {
        if (tmpKey.keyCode === keyRoll.keyCode) {
            playerroll(rollSprite);
        }
    }
    ///Race
    if (raceSprite.inputEnabled) {
        if (tmpKey.keyCode === keyRace.keyCode) {
            playerrace(raceSprite);
        }
    }
    ///Press Start
    if (flGameFinish || flNewGame) {
        if (tmpKey.keyCode === keyStart.keyCode) {
            beginGame();
        }
    }
}

///Финиш игры, выводим титры
function theendgame() {
    if (flGameFinish) {
        ///Текущая игра окончена поэтому остановим какие либо действия
        flGlobalPause = true;
        ///Запретим нажатие кнопок
        raceSprite.inputEnabled = false;
        rollSprite.inputEnabled = false;
        ///Присвоим медали игрокам
        setAllMedals();
        ///Тут не будем выводить, выведем кнопку START после анимации
        ///Анимацию вызовим в setAllMedals
        ///Выведем кнопку START
        //viewStart();
    }
}

///Раздадим медали игрокам
///Выведем анимацию медалек
function setAllMedals() {

    ///Обнулим массив анимации медалей
    viewMedalsMas = [];
    ///Первые 3 призовых места
    setTheMedal('medalsPos1', '');
    setTheMedal('medalsPos2', '');
    setTheMedal('medalsPos3', '');
    ///Игрок развивший самую максимальную скорость
    setTheMedal('medalsfastPlayer', 'maxTon');
    ///Игрок у которого мотик косячил больше всех перегревался
    setTheMedal('medalsbreakingPlayer', 'sumStopz');
    ///Самый ужасный игрок который больше всех совал палки в колеса
    setTheMedal('medalshorriblePlayer', 'sumBreak');
    ///Самый лузер игрок который больше всех отправлялся в кафэ
    setTheMedal('medalsloserPlayer', 'sumLoser');
    ///Покажем анимацию
    ///Задержка т.к. надо дождаться окончания анимации финиша
    setTimeout('viewAnimationMedals();', 4000);
}

///Массив игроков и присвоенных им медалей для вывода анимации
///Элемент массива это объект со свойтсвами:
///medal - наименование медали, nameplayer - наименование игрока
var viewMedalsMas = [];

///Выдадим медаль
function setTheMedal(tmpMedal, tmpVal) {

    ///Первые 3 призовых места
    if (tmpMedal === 'medalsPos1') {
        gamesettings.finishplayers[0].medalsPos1++;
        ///Выводим анимацию победителя 1
        viewMedalsMas.push({ medal: tmpMedal, nameplayer: gamesettings.finishplayers[0].nameplayer });
    }
    if (tmpMedal === 'medalsPos2') {
        gamesettings.finishplayers[1].medalsPos2++;
        ///Выводим анимацию победителя 2
        viewMedalsMas.push({ medal: tmpMedal, nameplayer: gamesettings.finishplayers[1].nameplayer });
    }
    if (tmpMedal === 'medalsPos3') {
        if (gamesettings.finishplayers.length > 2) {
            gamesettings.finishplayers[2].medalsPos3++;
            ///Выводим анимацию победителя 3
            viewMedalsMas.push({ medal: tmpMedal, nameplayer: gamesettings.finishplayers[2].nameplayer });
        }
    }

    var tmpP = 0;
    var tmpValue = 0;
    var tmpPlayer = gamesettings.finishplayers[0];
    for (var i = 0; i < gamesettings.finishplayers.length; i++) {
        tmpPlayer = gamesettings.finishplayers[i];
        if (tmpPlayer[tmpVal] > tmpValue) {
            tmpValue = tmpPlayer[tmpVal];
            tmpP = i;
        }
    }
    if (tmpValue > 0) {
        tmpPlayer = gamesettings.finishplayers[tmpP];
        tmpPlayer[tmpMedal]++;
        ///Выводим анимацию
        viewMedalsMas.push({ medal: tmpMedal, nameplayer: tmpPlayer.nameplayer });
        ///Если несколько игроков оказались c одинаковым показателем
        for (i = 0; i < gamesettings.finishplayers.length; i++) {
            tmpPlayer = gamesettings.finishplayers[i];
            if ((tmpPlayer[tmpVal] === tmpValue) && (i !== tmpP)) {
                tmpPlayer[tmpMedal]++;
                ///Выводим анимацию
                viewMedalsMas.push({ medal: tmpMedal, nameplayer: tmpPlayer.nameplayer });
            }
        }
    }

}

function getMedalNameSprite(tmpNameSprite) {
    if (tmpNameSprite === 'medalsPos1') {
        return 'Pos1S';
    }
    if (tmpNameSprite === 'medalsPos2') {
        return 'Pos2S';
    }
    if (tmpNameSprite === 'medalsPos3') {
        return 'Pos3S';
    }
    if (tmpNameSprite === 'medalsfastPlayer') {
        return 'TopSpeedS';
    }
    if (tmpNameSprite === 'medalsbreakingPlayer') {
        return 'DesperateS';
    }
    if (tmpNameSprite === 'medalshorriblePlayer') {
        return 'HorribleS';
    }
    if (tmpNameSprite === 'medalsloserPlayer') {
        return 'LoserS';
    }
    return tmpNameSprite;
}

function viewAnimationMedals() {
    destroyAnimationMedals();
    if (viewMedalsMas.length > 0) {

        var nameplayer = viewMedalsMas[0].nameplayer;
        var nameSprite = getMedalNameSprite(viewMedalsMas[0].medal);

        var txtStyle = { font: 'Eras Bold ITC', fontSize: '30px', fill: '#000', fontWeight: 'bold' };
        txtLap = game.add.text(364, 420, nameplayer, txtStyle);
        txtLap.anchor.setTo(0.5, 0.5);

        var txtLapSize = game.add.tween(txtLap);
        txtLapSize.to({ fontSize: '90px' }, 2000, Phaser.Easing.Linear.None, true);
        var txtLapDrive = game.add.tween(txtLap);
        txtLapDrive.to({ y: 510 }, 2000, Phaser.Easing.Linear.None, true);

        medalSprite = game.add.sprite(364, 364, nameSprite);
        medalSprite.anchor.setTo(0.5, 0.5);

        var medalSpriteScale = game.add.tween(medalSprite.scale);
        medalSpriteScale.to({ x: 3, y: 3 }, 2000, Phaser.Easing.Linear.None, true);
        medalSpriteScale.onComplete.add(endAnimationMedals, this);
    }
    else {
        viewStart();
    }
}

function endAnimationMedals() {
    var medalSpriteAlpha = game.add.tween(medalSprite);
    medalSpriteAlpha.to({ alpha: 0.1 }, 1000, Phaser.Easing.Linear.None, true);
    medalSpriteAlpha.onComplete.add(dontViewAnimationMedals, this);

    var txtLapAlpha = game.add.tween(txtLap);
    txtLapAlpha.to({ alpha: 0.1 }, 1000, Phaser.Easing.Linear.None, true);
}

function dontViewAnimationMedals() {
    destroyAnimationMedals();
    viewMedalsMas.splice(0, 1);
    if (viewMedalsMas.length === 0) {
        viewStart();
    }
    else {
        viewAnimationMedals();
    }
}

function destroyAnimationMedals() {
    if (typeof medalSprite === 'object') {
        medalSprite.destroy();
    }
    if (typeof txtLap === 'object') {
        txtLap.destroy();
    }
}

///Проверяем перегревы если их 5 и больше переход хода
///Или переход хода к следующему игроку
function nextplayer() {

    var curPlayer = getPlayer();
    if (flSound && (curPlayer.stopz >= 5)) {
        sounddanger.play();
    }

    ///Если пять или больше перегревов переход к другому игроку или предыдущий игрок сходил/закончил свой ход
    if ((curPlayer.stopz >= 5) || (flNextPlayer === true)) {

        if (curPlayer.stopz >= 5) {
            curPlayer.sumStopz++;
        }

        curPlayer.stopz = 0;
        curPlayer.goz = 0;

        curPlayer.sumStep++;
        curPlayer.sumAllStep++;

        /*///Если не последний игрок то переход к следующему
        if (gamesettings.curplayers+1 < gamesettings.players.length) {
            gamesettings.curplayers = gamesettings.curplayers + 1;
        }
        ///Иначе переход к первому игроку
        else {
            gamesettings.curplayers = 0;
        }*/

        ///Установим следующего игрока
        setcurplayer();
        ///Установим спрайты кубиков
        setspritequbicz();
        ///Выведем значения перегревов и тонн
        outtext();
        ///Выведем имя текущего игрока
        settextcurplayer();
        ///Уничтожим спрайт предыдущего игрока
        spriteCurPlayer.destroy();
        ///Отобразим спрайт текущего игрока
        setspritecurplayer();
        ///Напишем текущий круг текущего игрока
        setlapcurplayer();
        ///Сбросим флаг перехода к следующему игроку
        flNextPlayer = false;
    }
}

///Установим следующего игрока
function setcurplayer() {
    ///Если все игроки финишировали останавливаем игру
    var finishgamez = true;
    var countPlayers = getCountPlayers();
    for (var i = 0; i < countPlayers; i++) {
        var player = getPlayer(i);
        //if (!(gamesettings.players[i] in gamesettings.finishplayers)) {
        if (in_array(player, gamesettings.finishplayers) === false) {
            finishgamez = false;
            break;
        }
    }
    flGameFinish = finishgamez;
    ///Если не конец игры установим следующего игрока
    if (finishgamez === false) {
        var z = gamesettings.curplayers + 1;
        ///Пробежимся по всем игрокам
        while (z != gamesettings.curplayers) {
            ///Если до этого был последний игрок то переходим к первому
            var countPlayers = getCountPlayers();
            if (z >= countPlayers) {
                z = 0;
            }
            ///Если игрок не финишировал тогда передаем ему ход, цикл прерываем
            var player = getPlayer(z);
            if (in_array(player, gamesettings.finishplayers) === false) {
                gamesettings.curplayers = z;
                game.world.bringToTop(player.sprite);
                break;
            }
            ///Увеличиваем z т.е. переходим к следующему игроку
            z = z + 1;
        }
    }
    // else {
    //     ///Финиш игры, выводим титры
    //     theendgame();
    // }
}

///Отображаем то что выпало на кубике
function setspritequbicz() {

    if (znachq1 === 1) {
        qubic1.frame = 0;
    }
    else {
        qubic1.frame = 1;
    }

    if (znachq2 === 1) {
        qubic2.frame = 0;
    }
    else {
        qubic2.frame = 1;
    }

    if (znachq3 === 1) {
        qubic3.frame = 0;
    }
    else {
        qubic3.frame = 1;
    }

}

///Нажатие на Рэйс делаем ход
function playerrace(tmpSprite) {
    var curPlayer = getPlayer();
    if (!curPlayer.robot) {
        overMenuSprite(tmpSprite);
        allButtonOut();
    }
    ///Только если больше одной тонны можем ходить
    if (curPlayer.goz > 0) {
        ///Проверим самый ли быстрый ход в текущей игре
        ///Если да то запишем значение Тон
        setMaxTonCurPlayer();
        ///Переместим спрайт на доске т.е. сделаем ход
        ///Сбросим тонны и перегревы
        //raceonboard_old();
        raceonboard();
        /*if (!fishkaanimation) {
            ///Напишем текущий круг текущего игрока
            setlapcurplayer();   
            ///Установим флаг перехода к следующему игроку
            flNextPlayer = true;
            ///Снимим паузу робота
            flpausegame = false;    
            ///После того как ход окончен передаем ход следующему игроку
            //nextplayer();
        }*/
    }
}

///Проверим самый ли быстрый ход в текущей игре у текущего игрока
///Если да то запишем значение Тон
function setMaxTonCurPlayer() {
    var curPlayer = getPlayer();
    if (curPlayer.goz > curPlayer.maxTon) {
        curPlayer.maxTon = curPlayer.goz;
    }
}

///Проверим если фишка встала на другую, то другую сбросим в начало круга    
function setcafeplayer() {
    ///текущий игрок не финишировал
    var curPlayer = getPlayer();
    if (!in_array(curPlayer, gamesettings.finishplayers)) {
        var countPlayers = getCountPlayers();
        for (var i = 0; i < countPlayers; i++) {
            var player = getPlayer(i);
            if ((curPlayer.posonboard == player.posonboard) && (i !== gamesettings.curplayers)) {
                if (!in_array(player, gamesettings.finishplayers)) {
                    ///Проиграем звук если включено звуковое оповещение
                    if (flSound) {
                        soundincafe.play();
                    }
                    ///Если фишка сбрашиваемого игрока стоит на финише значит круг у него увеличился
                    ///Но т.к. он еще не на старте он отправляется в кафэ и круг считается не пройденым 
                    ///Поэтому минус один круг
                    ///Выстроим фишки в кафэ
                    if (player.posonboard === 36) {
                        player.lap--;
                    }
                    ///Сбросим в кафэ игрока на которого наехали
                    player.posonboard = 0;
                    player.sumLoser++;
                    curPlayer.sumBreak++;
                    setcafesprites();
                }
            }
        }
    }
}

///Переместим спрайт на доске т.е. сделаем ход
///Сбросим тонны и перегревы
function raceonboard() {

    var curPlayer = getPlayer();
    if (!flGlobalPause) {
        ///текущий игрок движетя фишкой по доске
        gamesettings.playerRaceOnBoard = true;
        ///Расположим фишку поверх других
        game.world.bringToTop(curPlayer.sprite);

        ///Если фишка игрока еще не начинала игру то присвоем ей начальные координаты старта спрайта
        ///что бы избежать смещения на игровом поле
        if (curPlayer.posonboard === 0) {
            curPlayer.sprite.x = 298;
            curPlayer.sprite.y = 580;
        }

        ///Сколько тонн столько ходов и делаем
        //while (gamesettings.players[gamesettings.curplayers].goz > 0) {
        if (curPlayer.goz > 0) {
            ///Поставим флаг что происходит анимация фишки
            fishkaanimation = true;
            ///Выводим фишку из кафе на старт 
            if (curPlayer.posonboard === 0) {
                curPlayer.sprite.y += 80;
            }
            ///Идем по низу
            else if ((curPlayer.posonboard >= 1) && (curPlayer.posonboard <= 4)) {
                curPlayer.sprite.x -= 72;
            }
            ///Идем слева
            else if ((curPlayer.posonboard >= 5) && (curPlayer.posonboard <= 13)) {
                curPlayer.sprite.y -= 72;
            }
            ///Идем по верху
            else if ((curPlayer.posonboard >= 14) && (curPlayer.posonboard <= 22)) {
                curPlayer.sprite.x += 72;
            }
            ///Идем справа
            else if ((curPlayer.posonboard >= 23) && (curPlayer.posonboard <= 31)) {
                curPlayer.sprite.y += 72;
            }
            ///Идем по низу
            else if ((curPlayer.posonboard >= 32) && (curPlayer.posonboard <= 36)) {
                curPlayer.sprite.x -= 72;
            }
            ///Уменьшаем тонну на 1 после хода
            curPlayer.goz -= 1;
            ///Увеличиваем позицию на игровой доске на 1 после хода
            curPlayer.posonboard += 1;
            ///Если текущая позиция 36 т.е. финиш, то увеличим круг на 1 и продолжим игру
            ///Если это был последний круг т.е. текущий круг стал больше всего кругов то игрок финиширует
            ///Если не финниш и текущая позиция 37 т.е. на старте, новй круг, то присваиваем текущему игроку позицию номер один
            finishorendlap();
            ///Звуковое сопровождение
            if (flSound === true) {
                soundrace.play();
            }
            ///Задержка между ходами фишки
            setTimeout('raceonboard();', 500);
        }
        ///Все ходы сделаны необходимо завершить ход снять флаги анимации и передать ход другому игроку
        else {
            ///Сбросим перегревы
            curPlayer.stopz = 0;
            ///Проверим если фишка встала на другую, то другую сбросим в начало круга 
            if (flBreakPlayers) {
                setcafeplayer();
            }
            ///Определим места игроков
            setPosPlayers();
            //return true;
            ///Напишем текущий круг текущего игрока
            setlapcurplayer();
            ///Установим флаг перехода к следующему игроку
            flNextPlayer = true;
            ///После того как ход окончен передаем ход следующему игроку
            nextplayer();
            ///Снимим паузу робота
            flpausegame = false;
            ///Фишка передвинулась сбросим флаг анимации
            fishkaanimation = false;
            ///текущий игрок закончил движение фишкой по доске
            gamesettings.playerRaceOnBoard = false;
        }
    }
}

///Если текущая позиция 36 т.е. финиш, то увеличим круг на 1 и продолжим игру
///Если это был последний круг т.е. текущий круг стал больше всего кругов то игрок финиширует
///Если не финниш и текущая позиция 37 т.е. на старте, новй круг, то присваиваем текущему игроку позицию номер один
function finishorendlap() {
    var curPlayer = getPlayer();
    ///Если текущая позиция 36 т.е. финиш, то увеличим круг на 1
    if (curPlayer.posonboard === 36) {
        curPlayer.lap += 1;
        ///Напишем текущий круг текущего игрока
        setlapcurplayer();
        viewAnimationLap();
    }
    ///Если это был последний круг т.е. текущий круг стал больше всего кругов то игрок финиширует
    if (curPlayer.lap > gamesettings.laps) {
        if (flSound) {
            soundfinish.play();
        }
        viewAnimationFinish();
        ///Добавим игрока в массив финишировавших игроков
        curPlayer.posInGame = gamesettings.finishplayers.length + 1;
        gamesettings.finishplayers.push(curPlayer);
        ///Сбросим все перегревы и тонны
        curPlayer.stopz = 0;
        curPlayer.goz = 0;
        ///Разместим фишки финишировавших игроков
        setfinishsprites();
    }
    ///Если не финниш и текущая позиция 37 т.е. на старте, новй круг, то присваиваем текущему игроку позицию номер один
    else {
        if (curPlayer.posonboard === 37) {
            curPlayer.posonboard = 1;
        }
    }
}

function viewAnimationFinish() {
    finishSpriteDestroy();
    finishSprite = game.add.sprite(364, 364, 'finishS');
    finishSprite.anchor.setTo(0.5, 0.5);
    finishSprite.scale.setTo(0.2);
    var finishTweenScale = game.add.tween(finishSprite.scale);
    finishTweenScale.to({ x: 1, y: 1 }, 2000, Phaser.Easing.Linear.None, true);
    finishTweenScale.onComplete.add(endAnimationFinish, this);
}

function endAnimationFinish() {
    var finishTweenAlpha = game.add.tween(finishSprite);
    finishTweenAlpha.to({ alpha: 0.1 }, 1000, Phaser.Easing.Linear.None, true);
    finishTweenAlpha.onComplete.add(finishSpriteDestroy, this);
}

function finishSpriteDestroy() {
    if (typeof finishSprite === 'object') {
        finishSprite.destroy();
    }
}

///Выведем анимацию нового круга
function viewAnimationLap() {
    txtLapDestroy();
    var curPlayer = getPlayer();
    var countLaps = gamesettings.laps;
    var viewAnimation = (countLaps >= curPlayer.lap);
    if (viewAnimation) {
        var txt = 'Lap ' + curPlayer.lap;
        var txtStyle = { font: 'Eras Bold ITC', fontSize: '30px', fill: '#000', fontWeight: 'bold' };
        txtLap = game.add.text(364, 364, txt, txtStyle);
        txtLap.anchor.setTo(0.5, 0.5);
        //var lapTween = game.add.tween(txtLap.fontSize);
        var lapTweenSize = game.add.tween(txtLap);
        lapTweenSize.to({ fontSize: '120px' }, 2000, Phaser.Easing.Linear.None, true);
        ///Удаляем спрайт с экрана
        lapTweenSize.onComplete.add(endAnimationLap, this);
    }
}

///Закончим анимацию нового круга
function endAnimationLap() {
    var lapTweenAlpha = game.add.tween(txtLap);
    lapTweenAlpha.to({ alpha: 0.1 }, 1000, Phaser.Easing.Linear.None, true);
    lapTweenAlpha.onComplete.add(txtLapDestroy, this);
}

function txtLapDestroy() {
    if (typeof txtLap === 'object') {
        txtLap.destroy();
    }
}

function TheEndPause() {
    flpausegame = false;
}

///Если игрок робот то запустим АИ
function robotplay() {
    var curPlayer = getPlayer();
    if (curPlayer.robot) {
        ///Пауза между ходами робота
        flpausegame = true;
        game.time.events.add(3000, TheEndPause, this);
        ///Еслти робот запретим нажатие кнопок
        raceSprite.inputEnabled = false;
        rollSprite.inputEnabled = false;
        ///Сделаем кнопки отжатыми
        // outrace();
        // outroll();
        var flrace = false;
        ///Если количество очков хватает финишировать то ходим
        if ((gamesettings.laps == curPlayer.lap) && (curPlayer.posonboard != 36)) {
            if ((curPlayer.goz + curPlayer.posonboard) >= 36) {
                playerrace();
                flrace = true;
            }
        }
        ///Если текущее количество тонн больше 0 и можно сбросить
        ///другого игрока то ходим
        if (flBreakPlayers) {
            if ((curPlayer.goz > 0) && (!flrace)) {
                ///текущий игрок не финишировал
                if (!in_array(curPlayer, gamesettings.finishplayers)) {
                    var pos = curPlayer.posonboard + curPlayer.goz;
                    var countPlayers = getCountPlayers();
                    for (var i = 0; i < countPlayers; i++) {
                        var player = getPlayer(i);
                        if ((pos == player.posonboard) && (i !== gamesettings.curplayers)) {
                            if (!in_array(player, gamesettings.finishplayers)) {
                                ///Если игроков больше пяти и фишка другого игрока только на первом кругу
                                ///находится на позиции от 1 до 9, то не трогаем ее дадим стартануть игрокам
                                var posOnBoard = player.posonboard;
                                var curLap = player.lap;
                                //var countPlayers = gamesettings.players.length;
                                if (countPlayers > 5) {
                                    if ((curLap === 1) && (posOnBoard < 9)) {
                                        ///Не трогаем игрока
                                        continue;
                                    }
                                }
                                ///Сбросим игрока
                                playerrace();
                                flrace = true;
                                break;
                            }
                        }
                    }
                }
            }
        }
        ///Если больше или равно 3 перегрева ходим иначе кидаем
        if (!flrace) {
            if ((curPlayer.stopz >= 3) && (curPlayer.goz > 0)) {
                playerrace();
            }
            else {
                playerroll();
            }
        }
    }
    ///Если не робот разрешим нажатие кнопок
    else {
        raceSprite.inputEnabled = true;
        rollSprite.inputEnabled = true;
    }
}

///Нажатие на Roll кидаем кубики
function playerroll(tmpSprite) {
    var curPlayer = getPlayer();
    if (!curPlayer.robot) {
        overMenuSprite(tmpSprite);
        allButtonOut();
    }
    ///Если звук включен проиграем бросок кубиков
    if (flSound) {
        soundroll.play();
    }
    ///Запустим паузу 1250мс после чего отключаем анимацию
    game.time.events.add(1250, TheEndAnimations, this);
    ///Включаем анимацию кубиков
    QubicAnimations = true;
    ///запишем значение броска каждого кубика
    znachq1 = qubiczone.rollz();
    znachq2 = qubicztwo.rollz();
    znachq3 = qubiczthree.rollz();
}

///Распределим места игроков в текущей игре
function setPosPlayers() {

    var tmpMax = 100000;
    var tmpValue = 0;
    var tmpScore = 0;

    ///Определим количество финишировавших и с этого места начнем 
    ///расчитывать места для тех кто еще в игре
    var sumFinPlayers = gamesettings.finishplayers.length;
    var firstPos = sumFinPlayers + 1;
    var endPos = gamesettings.players.length;
    ///Цикл по местам
    for (var i = firstPos; i <= endPos; i++) {
        ///Цикл по игрокам
        var countPlayers = getCountPlayers();
        for (var Oo = 0; Oo < countPlayers; Oo++) {
            ///Определяем какое место занимает игрок
            ///Если игрок еще не финишировал
            var player = getPlayer(Oo);
            if (in_array(player, gamesettings.finishplayers) === false) {
                tmpScore = player.posonboard + player.lap * 100;
                if ((tmpScore < tmpMax) && (tmpScore >= tmpValue)) {
                    player.posInGame = i;
                    tmpValue = tmpScore;
                }
            }
        }
        tmpMax = tmpValue;
        tmpValue = 0;
    }
    ///Распределим места финишировавших игроков
    for (var f = 0; f < gamesettings.finishplayers.length; f++) {
        gamesettings.finishplayers[f].posInGame = f + 1;
    }
}

///Отключаем анимацию записываем очки
function TheEndAnimations() {
    zapolnimo4ki();
    QubicAnimations = false;
}

///Заполним и выведем очки текущего пользователя
function zapolnimo4ki() {
    var curPlayer = getPlayer();
    if (znachq1 === 1) {
        curPlayer.goz += 1;
    }
    else {
        curPlayer.stopz += 1;
    }

    if (znachq2 === 1) {
        curPlayer.goz += 1;
    }
    else {
        curPlayer.stopz += 1;
    }

    if (znachq3 === 1) {
        curPlayer.goz += 1;
    }
    else {
        curPlayer.stopz += 1;
    }
    ///Выведем значения перегревов и тонн
    outtext();
}

///Включить выключить звуковое сопровождение
function SoundChange(tmpSprite) {
    if (flSound === true) {
        soundSprite.frame = 1;
        flSound = false;
    }
    else {
        soundSprite.frame = 0;
        flSound = true;
    }
    overMenuSprite(tmpSprite);
    allButtonOut();
}

///Увеличиваем спрайт меню когда над ним курсор
function overMenuSprite(tmpSprite) {
    //allButtonOut();
    tmpSprite.scale.setTo(1.2);
}

///Уменьшаем спрайт
function outMenuSprite(tmpSprite) {
    tmpSprite.scale.setTo(1);
}

///Отжать все кнопки
function allButtonOut() {
    setTimeout('setAllButtonOut();', 500);
}

function setAllButtonOut() {
    aboutSprite.scale.setTo(1);
    rulesSprite.scale.setTo(1);
    setplayersSprite.scale.setTo(1);
    soundSprite.scale.setTo(1);
    raceSprite.scale.setTo(1);
    rollSprite.scale.setTo(1);
}

/////////////////////
//                 // 
// State Main Menu //
//                 //
/////////////////////
///Стэйт настройки игры
var SPRITE_PLAYER_X = 512;
var SPRITE_PLAYER_Y = 60;

var StateMainMenu = function () { };

StateMainMenu.prototype = {
    create: function () { createMainMenu(); },
    update: function () { updateMainMenu(); }
};

function viewMainMenu() {
    game.state.start('StateMainMenu');
}

function createMainMenu() {
    ///Приостанавлеваем игру
    goodBuyStateGame();
    curSlideRules = 0;
    game.stage.backgroundColor = "#FFFFFF";
    ///Выводим лого
    backgroundImg = game.add.image(0, 0, 'backgroundS');
    ///Даем лого прозрачность
    backgroundImg.alpha = 0.2;
    ///Выводим кнопку закрытия
    closeSprite = game.add.sprite(980, 50, 'closeS');
    closeSprite.inputEnabled = true;
    closeSprite.anchor.setTo(0.5, 0.5);
    closeSprite.events.onInputDown.add(function () { game.state.start('StateGame'); }, this);
    closeSprite.events.onInputOver.add(overMenuSprite, this);
    closeSprite.events.onInputOut.add(outMenuSprite, this);

    rightSprite = game.add.sprite(990, game.world.centerY, 'rightS');
    rightSprite.anchor.setTo(0.5, 0.5);
    rightSprite.inputEnabled = true;
    rightSprite.events.onInputDown.add(viewUserNext, this);
    rightSprite.events.onInputOut.add(outMenuSprite, this);
    rightSprite.events.onInputOver.add(overMenuSprite, this);

    leftSprite = game.add.sprite(30, game.world.centerY, 'leftS');
    leftSprite.anchor.setTo(0.5, 0.5);
    leftSprite.inputEnabled = true;
    leftSprite.events.onInputDown.add(viewUserPrevious, this);
    leftSprite.events.onInputOut.add(outMenuSprite, this);
    leftSprite.events.onInputOver.add(overMenuSprite, this);

    inputUserName = game.add.inputField(SPRITE_PLAYER_X - 100, SPRITE_PLAYER_Y + 65, {
        font: '28px Eras Bold ITC',
        fill: '#212121',
        fillAlpha: 0.5,
        fontWeight: 'bold',
        width: 180,
        max: 12,
        padding: 8,
        borderWidth: 3,
        borderColor: '#000',
        borderRadius: 0,
        placeHolder: 'Username',
        textAlign: 'center',
        zoom: true
    });
    inputUserName.setText('userblya');
    ///Что бы неотрабатывали назначеные клавишам колбэки когда вводим имя
    inputUserName.blockInput = true;

    CurUserMainMenu = gamesettings.curplayers;
    CurUserMainMenuTmp = gamesettings.curplayers;
    var curPlayerInMainMenu = getPlayer(CurUserMainMenu);
    tmpSpriteUser = game.add.sprite(SPRITE_PLAYER_X, SPRITE_PLAYER_Y, curPlayerInMainMenu.namesprite);
    tmpSpriteUser.anchor.setTo(0.5, 0.5);
    tmpSpriteUser.inputEnabled = true;
    tmpSpriteUser.events.onInputDown.add(setUserSprite, this);
    tmpSpriteUser.events.onInputOut.add(outMenuSprite, this);
    tmpSpriteUser.events.onInputOver.add(overMenuSprite, this);

    ///Чекбуттон Робот или человек
    checkSprite = game.add.sprite(SPRITE_PLAYER_X + 180, SPRITE_PLAYER_Y + 80, 'checkS');
    checkSprite.anchor.setTo(0.5, 0.5);
    checkSprite.inputEnabled = true;
    checkSprite.events.onInputDown.add(setRobotUser, this);
    game.add.text(SPRITE_PLAYER_X + 220, SPRITE_PLAYER_Y + 65, 'Autopilot', { font: 'Eras Bold ITC', fontSize: '30px', fill: '#000', fontWeight: 'bold' });

    ///Отобразим медали
    txtMedals = game.add.text(game.world.centerX, 360, 'Medals', { font: 'Eras Bold ITC', fontSize: '36px', fill: '#000', fontWeight: 'bold' });
    txtMedals.anchor.setTo(0.5, 0.5);
    ///Pos1
    game.add.sprite(342, 390, 'Pos1S');
    var txt = 'X ' + curPlayerInMainMenu.medalsPos1;
    txtPos1 = game.add.text(412, 405, txt, { font: 'Eras Bold ITC', fontSize: '30px', fill: '#000', fontWeight: 'bold' });
    ///Pos2
    game.add.sprite(482, 390, 'Pos2S');
    txt = 'X ' + curPlayerInMainMenu.medalsPos2;
    txtPos2 = game.add.text(552, 405, txt, { font: 'Eras Bold ITC', fontSize: '30px', fill: '#000', fontWeight: 'bold' });
    ///Pos3
    game.add.sprite(622, 390, 'Pos3S');
    txt = 'X ' + curPlayerInMainMenu.medalsPos3;
    txtPos3 = game.add.text(692, 405, txt, { font: 'Eras Bold ITC', fontSize: '30px', fill: '#000', fontWeight: 'bold' });
    ///Top Speed
    game.add.sprite(270, 460, 'TopSpeedS');
    txt = 'X ' + curPlayerInMainMenu.medalsfastPlayer;
    txtTopSpeed = game.add.text(340, 475, txt, { font: 'Eras Bold ITC', fontSize: '30px', fill: '#000', fontWeight: 'bold' });
    ///Horrible
    game.add.sprite(410, 460, 'HorribleS');
    txt = 'X ' + curPlayerInMainMenu.medalshorriblePlayer;
    txtHorrible = game.add.text(480, 475, txt, { font: 'Eras Bold ITC', fontSize: '30px', fill: '#000', fontWeight: 'bold' });
    ///Desperate
    game.add.sprite(550, 460, 'DesperateS');
    txt = 'X ' + curPlayerInMainMenu.medalsbreakingPlayer;
    txtDesperate = game.add.text(620, 475, txt, { font: 'Eras Bold ITC', fontSize: '30px', fill: '#000', fontWeight: 'bold' });
    ///Loser
    game.add.sprite(690, 460, 'LoserS');
    txt = 'X ' + curPlayerInMainMenu.medalsloserPlayer;
    txtLoser = game.add.text(760, 475, txt, { font: 'Eras Bold ITC', fontSize: '30px', fill: '#000', fontWeight: 'bold' });

    ///Состояние дел в текущей игре
    ///Место игрока в текущей игре
    var line1PosX = 220;
    txt = 'Pos: ' + curPlayerInMainMenu.posInGame;
    txtPos = game.add.text(line1PosX, SPRITE_PLAYER_Y + 150, txt, { font: 'Eras Bold ITC', fontSize: '30px', fill: '#000', fontWeight: 'bold' });
    ///Текущий круг
    txt = 'Lap: ' + curPlayerInMainMenu.lap;
    txtLap = game.add.text(line1PosX + 120, SPRITE_PLAYER_Y + 150, txt, { font: 'Eras Bold ITC', fontSize: '30px', fill: '#000', fontWeight: 'bold' });
    ///Самое большое количество тон выброшеных игроком
    txt = 'Top Speed: ' + curPlayerInMainMenu.maxTon;
    txtTS = game.add.text(line1PosX + 250, SPRITE_PLAYER_Y + 150, txt, { font: 'Eras Bold ITC', fontSize: '30px', fill: '#000', fontWeight: 'bold' });
    ///Сколько раз игрок отправлял в кафэ
    txt = 'Horrible: ' + curPlayerInMainMenu.sumBreak;
    txtHor = game.add.text(line1PosX + 460, SPRITE_PLAYER_Y + 150, txt, { font: 'Eras Bold ITC', fontSize: '30px', fill: '#000', fontWeight: 'bold' });
    var line2PosX = 270;
    ///Количество перегревов в текущей игре
    txt = 'Desperate: ' + curPlayerInMainMenu.sumStopz;
    txtDes = game.add.text(line2PosX, SPRITE_PLAYER_Y + 210, txt, { font: 'Eras Bold ITC', fontSize: '30px', fill: '#000', fontWeight: 'bold' });
    ///Сколько раз игрок отправлялся в кафэ
    txt = 'Loser: ' + curPlayerInMainMenu.sumLoser;
    txtLos = game.add.text(line2PosX + 220, SPRITE_PLAYER_Y + 210, txt, { font: 'Eras Bold ITC', fontSize: '30px', fill: '#000', fontWeight: 'bold' });
    ///Количество шагов в текущей игре(во всех играх)
    txt = 'Steps: ' + curPlayerInMainMenu.sumStep + ' (' + curPlayerInMainMenu.sumAllStep + ')';
    txtSteps = game.add.text(line2PosX + 380, SPRITE_PLAYER_Y + 210, txt, { font: 'Eras Bold ITC', fontSize: '30px', fill: '#000', fontWeight: 'bold' });

    ///Добавим кнопку удаления добавления игрока
    btnAddDelSprite = game.add.sprite(SPRITE_PLAYER_X - 220, SPRITE_PLAYER_Y + 80, 'btnAddDelS');
    btnAddDelSprite.anchor.setTo(0.5, 0.5);
    btnAddDelSprite.inputEnabled = true;
    btnAddDelSprite.frame = 0;
    btnAddDelSprite.events.onInputDown.add(playerAddDel, this);
    btnAddDelSprite.events.onInputOut.add(outMenuSprite, this);
    btnAddDelSprite.events.onInputOver.add(overMenuSprite, this);

    var line3PosX = 260;
    ///Включение выключение хардкорного режима т.е. сброс другого игрока
    btnHardcoreSprite = game.add.sprite(line3PosX + 580, SPRITE_PLAYER_Y + 540, 'hardcoreS');
    btnHardcoreSprite.anchor.setTo(0.5, 0.5);
    btnHardcoreSprite.inputEnabled = true;
    btnHardcoreSprite.frame = Number(!flBreakPlayers);
    btnHardcoreSprite.events.onInputDown.add(changeHardcore, this);
    btnHardcoreSprite.events.onInputOut.add(outMenuSprite, this);
    btnHardcoreSprite.events.onInputOver.add(overMenuSprite, this);

    ///Настройка кругов
    txt = 'Laps: ' + gamesettings.laps;
    txtLaps = game.add.text(line3PosX + 250, SPRITE_PLAYER_Y + 515, txt, { font: 'Eras Bold ITC', fontSize: '38px', fill: '#000', fontWeight: 'bold' });

    minusSprite = game.add.sprite(line3PosX + 210, SPRITE_PLAYER_Y + 540, 'minusS');
    minusSprite.anchor.setTo(0.5, 0.5);
    minusSprite.inputEnabled = true;
    minusSprite.events.onInputDown.add(delLap, this);
    minusSprite.events.onInputOut.add(outMenuSprite, this);
    minusSprite.events.onInputOver.add(overMenuSprite, this);

    plusSprite = game.add.sprite(line3PosX + 450, SPRITE_PLAYER_Y + 540, 'plusS');
    plusSprite.anchor.setTo(0.5, 0.5);
    plusSprite.inputEnabled = true;
    plusSprite.events.onInputDown.add(addLap, this);
    plusSprite.events.onInputOut.add(outMenuSprite, this);
    plusSprite.events.onInputOver.add(overMenuSprite, this);

    ///New game
    newgameSprite = game.add.sprite(line3PosX, SPRITE_PLAYER_Y + 540, 'newgameS');
    newgameSprite.anchor.setTo(0.5, 0.5);
    newgameSprite.inputEnabled = true;
    newgameSprite.events.onInputDown.add(stopGame, this);
    newgameSprite.events.onInputOut.add(outMenuSprite, this);
    newgameSprite.events.onInputOver.add(overMenuSprite, this);

    ///Добавим горячие клавиши
    addHotkey();

    ///Откроем текущего игрока
    viewUser();
}

function keyPressSateMainMenu(tmpKey) {
    //if (!inputUserName.focus) {
    if ((tmpKey.keyCode === keyESC.keyCode) || (tmpKey.keyCode === keyQuit.keyCode)) {
        game.state.start('StateGame');
    }
    if (tmpKey.keyCode === keyNext.keyCode) {
        viewUserNext();
    }
    if (tmpKey.keyCode === keyPrevious.keyCode) {
        viewUserPrevious();
    }
    if (tmpKey.keyCode === keyAutopilot.keyCode) {
        setRobotUser();
    }
    if (tmpKey.keyCode === keyNewGame.keyCode) {
        stopGame();
    }
    if (tmpKey.keyCode === keyHardcore.keyCode) {
        changeHardcore();
    }
    if (tmpKey.keyCode === keyAddLap.keyCode) {
        addLap();
    }
    if (tmpKey.keyCode === keyDelLap.keyCode) {
        delLap();
    }
    //}
    // else {
    //     //game.input.keyboard.removeKeyCapture(Phaser.Keyboard.S);
    // }
}

///Добавим горячие клавиши
function addHotkey() {

    ///Quit
    keyESC = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
    keyESC.onDown.add(keyPressSateMainMenu, this);
    keyQuit = game.input.keyboard.addKey(Phaser.Keyboard.Q);
    keyQuit.onDown.add(keyPressSateMainMenu, this);

    ///Next player
    keyNext = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    keyNext.onDown.add(keyPressSateMainMenu, this);

    ///Previous player
    keyPrevious = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    keyPrevious.onDown.add(keyPressSateMainMenu, this);

    ///Autopilot check/uncheck
    keyAutopilot = game.input.keyboard.addKey(Phaser.Keyboard.A);
    keyAutopilot.onDown.add(keyPressSateMainMenu, this);

    ///New Game
    keyNewGame = game.input.keyboard.addKey(Phaser.Keyboard.N);
    keyNewGame.onDown.add(keyPressSateMainMenu, this);

    ///Hardcore check/uncheck
    keyHardcore = game.input.keyboard.addKey(Phaser.Keyboard.H);
    keyHardcore.onDown.add(keyPressSateMainMenu, this);

    ///Add Lap
    keyAddLap = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    keyAddLap.onDown.add(keyPressSateMainMenu, this);

    ///Del Lap
    keyDelLap = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    keyDelLap.onDown.add(keyPressSateMainMenu, this);
}

///Начнем новую игру текущую заканчиваем
function stopGame() {
    flNewGame = true;
    ///Обнуляем все показатели текущей игры и медали у всех игроков если новая игра
    ///Если новый этап то обнуляем только показатели текущей игры медали не трогаем
    var countPlayers = getCountPlayers();
    var players = gamesettings.players;
    for (var i = 0; i < countPlayers; i++) {
        resetValuesPlayer(players[i], flNewGame);
    }
    game.state.start('StateGame');
}

///Добавим круг
function addLap() {
    var laps = gamesettings.laps;
    var countFinishPlayers = gamesettings.finishplayers.length;
    if (countFinishPlayers === 0) {
        if (laps < 12) {
            laps++;
        }
    }
    gamesettings.laps = laps;
    txtLaps.text = 'Laps: ' + laps;
    overMenuSprite(plusSprite);
    setTimeout('MainMenuButtonOut();', 500);
}

///Удалим круг
function delLap() {
    var laps = gamesettings.laps;
    var minlaps = 1;
    var countPlayers = getCountPlayers();
    var players = gamesettings.players;
    ///Находим игрока с самым большим текущим кругом
    ///ниже уже уменьшать нельзя
    for (var i = 0; i < countPlayers; i++) {
        var player = players[i];
        var playerLap = player.lap;
        if (in_array(player, gamesettings.finishplayers)) {
            playerLap--;
        }
        if (playerLap > minlaps) {
            minlaps = playerLap;
        }
    }
    if (laps > minlaps) {
        laps--;
    }
    gamesettings.laps = laps;
    txtLaps.text = 'Laps: ' + laps;
    overMenuSprite(minusSprite);
    setTimeout('MainMenuButtonOut();', 500);
}

///Включаем выключаем хардкорный режим
function changeHardcore() {
    btnHardcoreSprite.frame = Number(flBreakPlayers);
    flBreakPlayers = !flBreakPlayers;
    overMenuSprite(btnHardcoreSprite);
    setTimeout('MainMenuButtonOut();', 500);
}

function MainMenuButtonOut() {
    btnHardcoreSprite.scale.setTo(1);
    plusSprite.scale.setTo(1);
    minusSprite.scale.setTo(1);
}

var CurUserMainMenu = 0;
var CurUserMainMenuTmp = 0;

function viewUserNext() {
    ///Если жмем следующего игрока в карточке добавления
    ///то перейдем к первому игроку
    if (CurUserMainMenuTmp > CurUserMainMenu) {
        CurUserMainMenuTmp = -1;
        CurUserMainMenu = -1;
    }
    ///Если карточка добавить игрока была открыта после первого игрока
    ///т.е. опять откроем карточку первого игрока
    if (CurUserMainMenuTmp < CurUserMainMenu) {
        CurUserMainMenu = CurUserMainMenuTmp;
    }
    overMenuSprite(rightSprite);
    ///Выводим данные следующего игрока 
    var countPlayers = getCountPlayers();
    if (CurUserMainMenu + 1 < countPlayers) {
        CurUserMainMenu++;
        CurUserMainMenuTmp++;
        viewUser();
    }
    ///Если был последний игрок то предлагаем добавить нового 
    else {
        ///Если максимальное количество игроков то нельзя добавлять
        //var countPlayers = countPlayers;
        if (countPlayers < 12) {
            CurUserMainMenuTmp++;
            addPlayerInGame();
        }
        else {
            CurUserMainMenuTmp = 0;
            CurUserMainMenu = 0;
            viewUser();
        }
    }
    setOutButtonRules();
}

function viewUserPrevious() {
    ///Если жмем предыдущего игрока в карточке добавления
    ///то перейдем к последнему игроку
    if (CurUserMainMenuTmp < 0) {
        var countPlayers = getCountPlayers();
        CurUserMainMenuTmp = countPlayers;
        CurUserMainMenu = countPlayers;
    }
    ///Если карточка добавить игрока была открыта после последнего игрока
    ///т.е. опять откроем карточку последнего игрока
    if (CurUserMainMenuTmp > CurUserMainMenu) {
        CurUserMainMenu = CurUserMainMenuTmp;
    }
    overMenuSprite(leftSprite);
    ///Выводим данные следующего игрока 
    if (CurUserMainMenu - 1 >= 0) {
        CurUserMainMenu--;
        CurUserMainMenuTmp--;
        viewUser();
    }
    ///Если был последний игрок то предлагаем добавить нового 
    else {
        ///Если максимальное количество игроков то нельзя добавлять
        var countPlayers = getCountPlayers();
        if (countPlayers < 12) {
            CurUserMainMenuTmp--;
            addPlayerInGame();
        }
        else {
            CurUserMainMenuTmp = 11;
            CurUserMainMenu = 11;
            viewUser();
        }
    }
    setOutButtonRules();
}

///Выведем добавить нового игрока
function addPlayerInGame() {
    flNewPlayer = true;
    ///Удалим спрайт предыдущего игрока
    tmpSpriteUser.destroy();
    ///Добавим поле ввода имени и выведем имя
    inputUserName.setText('new player');
    ///Выведем спрайт первой свободной фишки
    var countPlayers = getCountPlayers();
    for (var i = 1; i <= 12; i++) {
        var flFind = false;
        tmpFishka = 'fishkaS' + i;
        for (var z = 0; z < countPlayers; z++) {
            var player = getPlayer(z);
            if (tmpFishka === player.namesprite) {
                flFind = true;
                break;
            }
        }
        if (!flFind) {
            break;
        }
    }
    tmpSpriteUser = game.add.sprite(SPRITE_PLAYER_X, SPRITE_PLAYER_Y, tmpFishka);
    tmpSpriteUser.anchor.setTo(0.5, 0.5);
    tmpSpriteUser.inputEnabled = true;
    tmpSpriteUser.events.onInputDown.add(setUserSprite, this);
    tmpSpriteUser.events.onInputOut.add(outMenuSprite, this);
    tmpSpriteUser.events.onInputOver.add(overMenuSprite, this);
    checkSprite.frame = 0;

    ///Отобразим медали
    ///Pos1
    txtPos1.text = 'X 0';
    ///Pos2
    txtPos2.text = 'X 0';
    ///Pos3
    txtPos3.text = 'X 0';
    ///Top Speed
    txtTopSpeed.text = 'X 0';
    ///Horrible
    txtHorrible.text = 'X 0';
    ///Desperate
    txtDesperate.text = 'X 0';
    ///Loser
    txtLoser.text = 'X 0';

    ///Состояние дел в текущей игре
    ///Место игрока в текущей игре
    txtPos.text = 'Pos: 0';
    ///Текущий круг
    txtLap.text = 'Lap: 0';
    ///Самое большое количество тон выброшеных игроком
    txtTS.text = 'Top Speed: 0';
    ///Сколько раз игрок отправлял в кафэ
    txtHor.text = 'Horrible: 0';
    ///Количество перегревов в текущей игре
    txtDes.text = 'Desperate: 0';
    ///Сколько раз игрок отправлялся в кафэ
    txtLos.text = 'Loser: 0';
    ///Количество шагов в текущей игре(во всех играх)
    txtSteps.text = 'Steps: 0';

    btnAddDelSprite.inputEnabled = true;
    btnAddDelSprite.alpha = 1;
    btnAddDelSprite.frame = 0;
}

function playerAddDel() {
    var newUser = (CurUserMainMenuTmp > CurUserMainMenu) || (CurUserMainMenuTmp < 0);
    ///Если новый игрок то добавим
    if (newUser) {
        addNewPlayer();
    }
    ///Иначе Удалим
    else {
        delPlayer();
    }
}

///Добавим нового игрока
function addNewPlayer() {
    var nameNewPlayer = inputUserName.value;
    var fishkaNewPlayer = tmpSpriteUser.key;
    var flRobot = false;
    if (checkSprite.frame === 1) {
        flRobot = true;
    }
    addplayer(fishkaNewPlayer, flRobot, nameNewPlayer);
    var countPlayers = getCountPlayers();
    CurUserMainMenu = countPlayers - 1;
    CurUserMainMenuTmp = countPlayers - 1;
    setPosPlayers();
    viewUser();
}

///Удаляем игрока
function delPlayer() {

    var indexCurPlayer = gamesettings.curplayers;
    var indexMainMenuPlayer = CurUserMainMenu;
    var countPlayers = getCountPlayers() - 1;
    var player = getPlayer(indexMainMenuPlayer);
    ///Разрешено ли удалить
    var goDel = allowDel(player);

    if (goDel) {
        gamesettings.players.splice(indexMainMenuPlayer, 1);

        countPlayers = countPlayers - 1;

        ///Если удалили элемент с игроком находившийся в массиве раньше
        ///Элемента текущего игрока то уменьшим индекс что бы остался текущий игрок
        if (indexMainMenuPlayer < indexCurPlayer) {
            indexCurPlayer -= 1;
        }
        ///Если ходил последний игрок и его удалили
        ///То передаем ход самому первому игроку 
        if (indexCurPlayer > countPlayers) {
            indexCurPlayer = 0;
        }
        ///Если была открыта карточка последнего игрока и его удалили
        ///То открываем карточку самого первого игрока 
        if (indexMainMenuPlayer > countPlayers) {
            indexMainMenuPlayer = 0;
        }
        gamesettings.curplayers = indexCurPlayer;
        CurUserMainMenu = indexMainMenuPlayer;

        setPosPlayers();

        viewUser();
    }
}

function viewUser() {
    ///Удалим спрайт предыдущего игрока
    tmpSpriteUser.destroy();
    ///Добавим поле ввода имени и выведем имя текущего игрока
    var curPlayerInMainMenu = getPlayer(CurUserMainMenu);
    inputUserName.setText(curPlayerInMainMenu.nameplayer);
    ///Выведем спрайт игрока по клику на спрайт дадим возможность выбрать другое изображение
    tmpSpriteUser = game.add.sprite(SPRITE_PLAYER_X, SPRITE_PLAYER_Y, curPlayerInMainMenu.namesprite);
    tmpSpriteUser.anchor.setTo(0.5, 0.5);
    tmpSpriteUser.inputEnabled = true;
    tmpSpriteUser.events.onInputDown.add(setUserSprite, this);
    tmpSpriteUser.events.onInputOut.add(outMenuSprite, this);
    tmpSpriteUser.events.onInputOver.add(overMenuSprite, this);
    if (curPlayerInMainMenu.robot) {
        checkSprite.frame = 1;
    }
    else {
        checkSprite.frame = 0;
    }
    ///Отобразим медали
    ///Pos1
    txtPos1.text = 'X ' + curPlayerInMainMenu.medalsPos1;
    ///Pos2
    txtPos2.text = 'X ' + curPlayerInMainMenu.medalsPos2;
    ///Pos3
    txtPos3.text = 'X ' + curPlayerInMainMenu.medalsPos3;
    ///Top Speed
    txtTopSpeed.text = 'X ' + curPlayerInMainMenu.medalsfastPlayer;
    ///Horrible
    txtHorrible.text = 'X ' + curPlayerInMainMenu.medalshorriblePlayer;
    ///Desperate
    txtDesperate.text = 'X ' + curPlayerInMainMenu.medalsbreakingPlayer;
    ///Loser
    txtLoser.text = 'X ' + curPlayerInMainMenu.medalsloserPlayer;

    ///Состояние дел в текущей игре
    ///Место игрока в текущей игре
    txtPos.text = 'Pos: ' + curPlayerInMainMenu.posInGame;
    ///Текущий круг
    var lap = curPlayerInMainMenu.lap;
    var playerIsFinish = in_array(curPlayerInMainMenu, gamesettings.finishplayers);
    if (playerIsFinish) {
        lap--;
    }
    txtLap.text = 'Lap: ' + lap;
    ///Самое большое количество тон выброшеных игроком
    txtTS.text = 'Top Speed: ' + curPlayerInMainMenu.maxTon;
    ///Сколько раз игрок отправлял в кафэ
    txtHor.text = 'Horrible: ' + curPlayerInMainMenu.sumBreak;
    ///Количество перегревов в текущей игре
    txtDes.text = 'Desperate: ' + curPlayerInMainMenu.sumStopz;
    ///Сколько раз игрок отправлялся в кафэ
    txtLos.text = 'Loser: ' + curPlayerInMainMenu.sumLoser;
    ///Количество шагов в текущей игре(во всех играх)
    txtSteps.text = 'Steps: ' + curPlayerInMainMenu.sumStep + ' (' + curPlayerInMainMenu.sumAllStep + ')';

    ///Покажем кнопку удаления игрока если количество игроков больше двух
    ///И игрока можно удалять
    var countPlayers = getCountPlayers();
    var viewbtnAddDelSprite = (countPlayers > 2) && (allowDel(curPlayerInMainMenu));
    if (viewbtnAddDelSprite) {
        btnAddDelSprite.inputEnabled = true;
        btnAddDelSprite.alpha = 1;
        btnAddDelSprite.frame = 1;
    }
    ///Если меньшем 2 игроков, то прячем кнопку удалить и запрещаем нажатие
    else {
        btnAddDelSprite.inputEnabled = false;
        btnAddDelSprite.alpha = 0;
    }

}

////Установить снять режим автопилота
function setRobotUser() {
    var curPlayerInMainMenu = getPlayer(CurUserMainMenu);
    var newUser = (CurUserMainMenuTmp > CurUserMainMenu) || (CurUserMainMenuTmp < 0);
    ///Если меняем значение у существующего игрока
    if (!newUser) {
        if (curPlayerInMainMenu.robot) {
            curPlayerInMainMenu.robot = false;
            checkSprite.frame = 0;
        }
        else {
            curPlayerInMainMenu.robot = true;
            checkSprite.frame = 1;
        }
    }
    ///Если меняем значение у вновь добавляемого игрока
    else {
        if (checkSprite.frame === 0) {
            checkSprite.frame = 1;
        }
        else {
            checkSprite.frame = 0;
        }
    }
}

///Выберем спрайт игрока
function setUserSprite() {
    ///Если максимальное количество игроков то нельзя 
    ///изменить фишку
    var countPlayers = getCountPlayers();
    if (countPlayers < 12) {
        leftSprite.inputEnabled = false;
        rightSprite.inputEnabled = false;
        closeSprite.inputEnabled = false;
        fonSprite = game.add.sprite(0, 0, 'fonS');
        groupFishki = game.add.group();
        var newUser = (CurUserMainMenuTmp > CurUserMainMenu) || (CurUserMainMenuTmp < 0);
        var tmpFishka = '';
        var flFind = false;
        var PosX = 70;
        var PosY = 70;
        var nextLine = 0;
        ///Выводим фишку игрока и все свободные фишки
        for (var i = 1; i <= 12; i++) {
            tmpFishka = 'fishkaS' + i; ///Фишка от fishkaS1 до fishkaS12
            for (var z = 0; z < countPlayers; z++) {
                var player = getPlayer(z);
                if (z !== CurUserMainMenu) {
                    if (tmpFishka === player.namesprite) {
                        flFind = true;
                        break;
                    }
                }
                ///Если фишку выбираем для нового игрока то нельзя выбирать 
                ///фишку существующего игрока
                else {
                    if (newUser) {
                        if (tmpFishka === player.namesprite) {
                            flFind = true;
                            break;
                        }
                    }
                }
            }
            ///Если фишка не используется то можно ее выбрать
            if (!flFind) {
                nextLine++;
                var tmpFishkaSprite = game.add.sprite(PosX, PosY, tmpFishka);
                tmpFishkaSprite.anchor.setTo(0.5, 0.5);
                tmpFishkaSprite.scale.setTo(2);
                tmpFishkaSprite.inputEnabled = true;
                tmpFishkaSprite.events.onInputDown.add(getFishka, this);
                tmpFishkaSprite.events.onInputOut.add(outFishkaSprite, this);
                tmpFishkaSprite.events.onInputOver.add(overFishkaSprite, this);
                groupFishki.add(tmpFishkaSprite);
                PosX += 140;
            }
            flFind = false;
            if (nextLine === 4) {
                nextLine = 0;
                PosX = 70;
                PosY += 140;
            }
        }
    }
}

///Увеличиваем спрайт когда над ним курсор
function overFishkaSprite(tmpSprite) {
    //allButtonOut();
    tmpSprite.scale.setTo(2.2);
}

///Уменьшаем спрайт
function outFishkaSprite(tmpSprite) {
    tmpSprite.scale.setTo(2);
}

///Выбрали фишку присваиваем ее и удаялем спрайты
function getFishka(tmpSprite) {
    leftSprite.inputEnabled = true;
    rightSprite.inputEnabled = true;
    closeSprite.inputEnabled = true;
    ///Если выбираем фишку для существующего игрока
    var curPlayerInMainMenu = getPlayer(CurUserMainMenu);
    var newUser = (CurUserMainMenuTmp > CurUserMainMenu) || (CurUserMainMenuTmp < 0);
    if (!newUser) {
        curPlayerInMainMenu.namesprite = tmpSprite.key;
        groupFishki.destroy();
        fonSprite.destroy();
        viewUser();
    }
    ///Если выбрали фишку для нового игрока
    else {
        var namesprite = tmpSprite.key;
        groupFishki.destroy();
        fonSprite.destroy();
        tmpSpriteUser.destroy();
        tmpSpriteUser = game.add.sprite(SPRITE_PLAYER_X, SPRITE_PLAYER_Y, namesprite);
        tmpSpriteUser.anchor.setTo(0.5, 0.5);
        tmpSpriteUser.inputEnabled = true;
        tmpSpriteUser.events.onInputDown.add(setUserSprite, this);
        tmpSpriteUser.events.onInputOut.add(outMenuSprite, this);
        tmpSpriteUser.events.onInputOver.add(overMenuSprite, this);
    }

}

function updateMainMenu() {
    /// Присовем текущему игроку введеное имя
    var curPlayerInMainMenu = getPlayer(CurUserMainMenu);
    var newUser = (CurUserMainMenuTmp > CurUserMainMenu) || (CurUserMainMenuTmp < 0);
    if (!newUser) {
        curPlayerInMainMenu.nameplayer = inputUserName.value;
    }
}

/////////////////
//             // 
// State About //
//             //
/////////////////
///State о игре
var StateAbout = function () {

};

StateAbout.prototype = {
    create: function () { createAbout(); }
};

function createAbout() {
    //flGlobalPause = true;
    goodBuyStateGame();
    if (flSound) {
        soundabout.play();
    }
    ///Белый цветбакграунда игры
    game.stage.backgroundColor = "#FFFFFF";
    ///Выводим лого
    backgroundImg = game.add.image(0, 0, 'backgroundS');
    ///Даем лого прозрачность на половину
    backgroundImg.alpha = 0.5;
    ///Выводим кнопку закрытия
    closeSprite = game.add.sprite(980, 50, 'closeS');
    closeSprite.inputEnabled = true;
    closeSprite.anchor.setTo(0.5, 0.5);
    closeSprite.events.onInputDown.add(function () { soundabout.stop(); game.state.start('StateGame'); }, this);
    closeSprite.events.onInputOver.add(overMenuSprite, this);
    closeSprite.events.onInputOut.add(outMenuSprite, this);
    ///Добавляем лого жЫруфика
    jirufikS = game.add.sprite(game.world.centerX, game.world.centerY, 'jirufikS');
    ///Уменьшаем размер жЫруфика
    jirufikS.scale.setTo(0.2);
    ///Устанавливаем точку в центре спрайта
    jirufikS.anchor.setTo(0.5, 0.5);
    ///Увеличиваем в течении 2 сек жЫруфика 
    var jirufikTw = game.add.tween(jirufikS.scale);
    jirufikTw.to({ x: 1.3, y: 1.3 }, 2000, Phaser.Easing.Linear.None, true);
    ///Удаляем спрайт с экрана
    jirufikTw.onComplete.add(jirufikOutScreen, this);
    //game.add.tween(jirufikS).to({ x: game.world.centerY, y: -400 }, 2000, Phaser.Easing.Linear.None, true);
    ///Через 4 сек возвращаемся в игру
    //game.time.events.add(Phaser.Timer.SECOND * 15, function () { game.state.start('StateGame'); }, this);
    ///Quit
    keyESC = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
    keyESC.onDown.add(keyPressSateAbout, this);
    keyQuit = game.input.keyboard.addKey(Phaser.Keyboard.Q);
    keyQuit.onDown.add(keyPressSateAbout, this);

}

///Обработка нажатия клавиш
function keyPressSateAbout(tmpKey) {
    if ((tmpKey.keyCode === keyESC.keyCode) || (tmpKey.keyCode === keyQuit.keyCode)) {
        soundabout.stop();
        game.state.start('StateGame');
    }
}

///Выведем титры
function captionsGo() {
    captionGoz(0);
}

function captionGoz(tmpI) {
    var i = tmpI;
    //if (flGlobalPause) {
    if (game.state.current === 'StateAbout') {
        if (tmpI < masCaptions.length) {
            if (masCaptions[i].nameCap.length === 0) {
                var tmpStr = masCaptions[i].doljCap;
            }
            else {
                var tmpStr = masCaptions[i].doljCap + ' - ' + masCaptions[i].nameCap;
            }
            tmpTxt = game.add.text(game.world.centerX, 800, tmpStr, { font: 'Eras Bold ITC', fontSize: '50px', fill: '#000' });
            tmpTxt.anchor.setTo(0.5, 0.5);
            jirufikTw = game.add.tween(tmpTxt).to({ x: game.world.centerX, y: -100 }, 4000, Phaser.Easing.Linear.None, true);
            i = i + 1;
            setTimeout(function () { captionGoz(i); }, 1000);
        }
        else {
            setTimeout(function () { soundabout.stop(); game.state.start('StateGame'); }, 4000);
        }
    }
}

///Массив титров
var masCaptions = [
    { doljCap: 'Produced', nameCap: 'Jirufik Gamez' },
    { doljCap: 'Producer', nameCap: 'Jirufik' },
    { doljCap: 'Game Director', nameCap: 'Jirufik' },
    { doljCap: 'Art Director', nameCap: 'Jirufik' },
    { doljCap: 'Designer', nameCap: 'Jirufik' },
    { doljCap: 'Programmer', nameCap: 'Jirufik' },
    { doljCap: 'Tester', nameCap: 'Jirufik' },
    { doljCap: 'Soundman', nameCap: 'Jirufik' },
    { doljCap: 'Sound', nameCap: 'http://freesound.org' },
    { doljCap: 'Game engine', nameCap: 'http://phaser.io' },
    { doljCap: 'Phaser library', nameCap: 'Phaser input' },
    { doljCap: 'Сode editor', nameCap: 'Visual Studio Code for Mac OS X' },
    { doljCap: 'Raster graphics editor', nameCap: 'Paint.net' },
    { doljCap: 'Vector graphics editor', nameCap: 'Inkscape' },
    { doljCap: 'Photo from the Internet', nameCap: '' },
    { doljCap: 'Jirufik', nameCap: 'Rufus' },
    { doljCap: 'My "Hello World" in JavaScript and Phaser', nameCap: '' },
    { doljCap: 'http://rufus.pro', nameCap: 'jirufik@gmail.com' },
    { doljCap: 'Created by Jirufik Gamez 2016', nameCap: '' }
];

///Уводим объект за пределы игры
function jirufikOutScreen() {
    var jirufikTw = game.add.tween(jirufikS).to({ x: game.world.centerX, y: -400 }, 2000, Phaser.Easing.Linear.None, true);
    jirufikTw.onComplete.add(captionsGo, this);
}

///Покажем стэйт о игре
function viewAbout() {
    game.state.start('StateAbout');
}

/////////////////
//             // 
// State Rules //
//             //
/////////////////
///Стэйт правила
var StateRules = function () {

};

StateRules.prototype = {
    create: function () { createRules(); },
    update: function () { updateRules(); }
};

function viewRules() {
    game.state.start('StateRules');
}

function createRules() {
    ///Приостанавлеваем игру
    goodBuyStateGame();
    curSlideRules = 0;
    game.stage.backgroundColor = "#FFFFFF";
    ///Выводим лого
    backgroundImg = game.add.image(0, 0, 'backgroundS');
    ///Даем лого прозрачность
    backgroundImg.alpha = 0.2;
    ///Выводим кнопку закрытия
    closeSprite = game.add.sprite(980, 50, 'closeS');
    closeSprite.inputEnabled = true;
    closeSprite.anchor.setTo(0.5, 0.5);
    closeSprite.events.onInputDown.add(function () { game.state.start('StateGame'); }, this);
    closeSprite.events.onInputOver.add(overMenuSprite, this);
    closeSprite.events.onInputOut.add(outMenuSprite, this);

    rightSprite = game.add.sprite(990, game.world.centerY, 'rightS');
    rightSprite.anchor.setTo(0.5, 0.5);
    rightSprite.inputEnabled = true;
    rightSprite.events.onInputDown.add(nextSlideRules, this);
    rightSprite.events.onInputOut.add(outMenuSprite, this);
    rightSprite.events.onInputOver.add(overMenuSprite, this);

    leftSprite = game.add.sprite(30, game.world.centerY, 'leftS');
    leftSprite.anchor.setTo(0.5, 0.5);
    leftSprite.inputEnabled = true;
    leftSprite.events.onInputDown.add(previousSlideRules, this);
    leftSprite.events.onInputOut.add(outMenuSprite, this);
    leftSprite.events.onInputOver.add(overMenuSprite, this);

    tmpSpriteRules = game.add.sprite(game.world.centerX, game.world.centerY, masRules[curSlideRules].spriteName);
    tmpSpriteRules.anchor.setTo(0.5, 0.5);

    textSlide = game.add.text(game.world.centerX, 685, '1 of ' + masRules.length, { font: 'Eras Bold ITC', fontSize: '30px', fill: '#000' });

    ///Quit
    keyESC = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
    keyESC.onDown.add(keyPressSateRules, this);
    keyQuit = game.input.keyboard.addKey(Phaser.Keyboard.Q);
    keyQuit.onDown.add(keyPressSateRules, this);

    ///Next slide
    keyNext = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    keyNext.onDown.add(keyPressSateRules, this);

    ///Previous slide
    keyPrevious = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    keyPrevious.onDown.add(keyPressSateRules, this);
}

function keyPressSateRules(tmpKey) {
    if ((tmpKey.keyCode === keyESC.keyCode) || (tmpKey.keyCode === keyQuit.keyCode)) {
        game.state.start('StateGame');
    }
    if (tmpKey.keyCode === keyNext.keyCode) {
        nextSlideRules();
    }
    if (tmpKey.keyCode === keyPrevious.keyCode) {
        previousSlideRules();
    }
}

function nextSlideRules() {
    overMenuSprite(rightSprite);
    viewSlideRules(true);
    setOutButtonRules();
}

function previousSlideRules() {
    overMenuSprite(leftSprite);
    viewSlideRules(false);
    setOutButtonRules();
}

function viewSlideRules(nextSlide) {
    ///Удалим предыдущий спрайт справки
    tmpSpriteRules.destroy();
    ///Если нажали просмотреть следующий слайд
    if (nextSlide) {
        if (curSlideRules === masRules.length - 1) {
            curSlideRules = 0;
        }
        else {
            curSlideRules++;
        }
    }
    ///Если нажали предыдущий слайд
    else {
        if (curSlideRules === 0) {
            curSlideRules = masRules.length - 1;
        }
        else {
            curSlideRules--;
        }
    }
    textSlide.text = (curSlideRules + 1) + ' of ' + masRules.length;
    if (masRules[curSlideRules].spriteName === '') {
        //tmpSpriteRules.destroy();
    }
    else {
        tmpSpriteRules = game.add.sprite(game.world.centerX, game.world.centerY, masRules[curSlideRules].spriteName);
        tmpSpriteRules.anchor.setTo(0.5, 0.5);
    }
}

var curSlideRules = 0;

var masRules = [
    { spriteName: 'slideRulesS1', textRules: '' },
    { spriteName: 'slideRulesS2', textRules: '' },
    { spriteName: 'slideRulesS3', textRules: '' },
    { spriteName: 'slideRulesS5', textRules: '' },
    { spriteName: 'slideRulesS6', textRules: '' },
    { spriteName: 'slideRulesS7', textRules: '' },
    { spriteName: 'slideRulesS8', textRules: '' },
    { spriteName: 'slideRulesS9', textRules: '' },
    { spriteName: 'slideRulesS10', textRules: '' },
    { spriteName: 'slideRulesS11', textRules: '' },
    { spriteName: 'slideRulesS4', textRules: '' }
];

function setOutButtonRules() {
    setTimeout('setAllOutButtonRules();', 500);
}

function setAllOutButtonRules() {
    rightSprite.scale.setTo(1);
    leftSprite.scale.setTo(1);
}

function updateRules() {

}

/////////////////
//             // 
// State Boot  //
//             //
/////////////////
///Создадим стэйт загрузки
var StateBoot = function () {

};

///В прототипе переопредлеим 
StateBoot.prototype = {
    init: function () { initial(); },
    preload: function () { preload(); },
    create: function () { createBoot(); }
};

function createBoot() {
    flGlobalPause = true;
    flNewGame = true;
    flSound = true;
    game.add.image(0, 0, 'backgroundS');
    soundabout = game.add.audio('about');
    logoTextS = game.add.sprite(game.world.centerX, game.world.centerY, 'logoTextS');
    logoTextS.scale.setTo(0.2);
    logoTextS.anchor.setTo(0.5, 0.5);
    logoTextS.angle = -60;
    game.add.tween(logoTextS).to({ angle: 20 }, 2000, Phaser.Easing.Linear.None, true);
    game.add.tween(logoTextS.scale).to({ x: 1, y: 1 }, 2000, Phaser.Easing.Linear.None, true);
    logoTextS.alpha = 0.8;
    StartGame();
}

///Создадим стэйт самой игры, игрового процесса
function StartGame() {
    setTimeout(function () { game.state.start('StateGame'); }, 5000);
}

//инициализация параметров игры
function initial() {
    //параметры масштабирования экрана
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

    //центруем игровой экран по горизонтали и вертикали
    // game.scale.pageAlignHorizontally = true;
    // game.scale.pageAlignVertically = true;
}

function preload() {
    game.load.image('backgroundS', 'images/CFLogoGame.gif');
    game.load.image('logoTextS', 'images/Text1.png');
    game.load.image('boardS', 'images/Board1.png');
    game.load.image('jirufikS', 'images/Jirufik_300.png');
    game.load.image('closeS', 'images/close.png');
    for (var i = 1; i <= 12; i++) {
        game.load.image('fishkaS' + i, 'images/fishka' + i + '.png');
    }
    //game.load.image('fishkaS', 'cafe/fishka.png');
    //game.load.image('fishkaS1', 'cafe/fishka1.png');
    game.load.image('dangerS', 'images/danger.png');
    game.load.image('tonS', 'images/ton.png');
    game.load.spritesheet('qubicS', 'images/qubic.png', 66, 66);
    game.load.audio('diceroll', 'sounds/roll_dice.mp3');
    game.load.audio('incafe', 'sounds/in_cafe.mp3');
    game.load.audio('danger', 'sounds/danger.mp3');
    game.load.audio('finish', 'sounds/finish.mp3');
    game.load.audio('race', 'sounds/race.mp3');
    game.load.audio('about', 'sounds/about.mp3');
    game.load.spritesheet('soundS', 'images/sound.png', 60, 60);
    game.load.spritesheet('checkS', 'images/check.png', 64, 64);
    game.load.image('aboutS', 'images/about.png');
    game.load.image('rulesS', 'images/rules.png');
    game.load.image('setplayersS', 'images/settingsplayers.png');
    game.load.image('rollS', 'images/roll.png');
    game.load.image('raceS', 'images/race.png');
    game.load.image('leftS', 'images/left.png');
    game.load.image('rightS', 'images/right.png');
    game.load.image('fonS', 'images/fon.png');
    for (var i = 1; i <= 11; i++) {
        game.load.image('slideRulesS' + i, 'images/slideRules' + i + '.png');
    }
    game.load.image('Pos1S', 'images/Pos1.png');
    game.load.image('Pos2S', 'images/Pos2.png');
    game.load.image('Pos3S', 'images/Pos3.png');
    game.load.image('TopSpeedS', 'images/TopSpeed.png');
    game.load.image('LoserS', 'images/Loser.png');
    game.load.image('HorribleS', 'images/Horrible.png');
    game.load.image('DesperateS', 'images/Desperate.png');
    game.load.image('plusS', 'images/plus.png');
    game.load.image('minusS', 'images/minus.png');
    game.load.image('startS', 'images/start.png');
    game.load.image('newgameS', 'images/newgame.png');
    game.load.image('finishS', 'images/finish.png');
    game.load.spritesheet('btnAddDelS', 'images/btnAddDel.png', 114, 64);
    game.load.spritesheet('hardcoreS', 'images/hardcore.png', 78, 60);
}


//////////////////////
//                  // 
// Other functions  //
//                  //
//////////////////////
///Получим текущего игрока либо по индексу
function getPlayer(indexPlayer) {
    var typeIndex = typeof indexPlayer;
    if ((typeIndex === 'undefined') || (typeIndex !== 'number')) {
        return gamesettings.players[gamesettings.curplayers];
    }
    else {
        var countPlayers = getCountPlayers();
        if ((indexPlayer >= 0) && (indexPlayer < countPlayers)) {
            return gamesettings.players[indexPlayer];
        }
        else {
            return gamesettings.players[gamesettings.curplayers];
        }
    }
}

///Получим количество игроков
function getCountPlayers() {
    return gamesettings.players.length;
}

///Вызываем когда прерываем игру т.е. вызываем другой стэйт
function goodBuyStateGame() {
    ///Приостановим какие либо дейсвтия в игре
    flGlobalPause = true;
    ///Если игрок не двигал фишку по доске, то отсановим анимацию кубиков
    ///и заполним тоны да перегревы
    if (!gamesettings.playerRaceOnBoard) {
        if (QubicAnimations) {
            QubicAnimations = false;
            zapolnimo4ki();
        }
    }
    ///Обнулим массив анимации медалей
    viewMedalsMas = [];
    destroyAnimationMedals();
}

function Playerz() {
    var stopz = 0; ///количество перегревов
    var goz = 0; ///количество тон
    var posonboard = 0; ///позиция на доске, номер клетки
    var namesprite = 'fishkaS1'; ///спрайт игрока
    var robot = true; ///АИ или человек
    var lap = 1; ///номер круга
    var nameplayer = 'robot'; ///имя игрока
    var sprite; ///Фазеровский объект спрайта игрока
    var posInGame = 0; ///Место игрока в текущей игре
    var maxTon = 0; ///Самое большое количество тон выброшеных игроком
    var sumLoser = 0; ///Сколько раз игрок отправлялся в кафэ
    var sumStopz = 0; ///Количество перегревов в текущей игре
    var sumBreak = 0; ///Сколько раз игрок отправлял в кафэ
    var sumStep = 0; ///Количество шагов в текущей игре
    var sumAllStep = 0; ///Количество шагов во всех играх
    ///Медали здесь хранится количество значков/медалей 
    ///собранных за все игры
    var medalsPos1 = 0; ///Первое место
    var medalsPos2 = 0; ///Второе место
    var medalsPos3 = 0; ///Третье место
    var medalsfastPlayer = 0; ///Самый быстрый ход (больше всего выбрашено тон в игре)
    var medalsbreakingPlayer = 0; ///Самый ломающийся (больше всего словил перегревов за игру)
    var medalshorriblePlayer = 0; ///Самый ужасный (больше всех отправил игроков в кафэ)
    var medalsloserPlayer = 0; ///Самый неудачник (больше всех отправлялся в кафэ)
}

function Qubic(masgrani) {
    if (Array.isArray(masgrani)) {
        this.grani = masgrani; ///заполним кубик гранями
    }
    else {
        this.grani = [1, 2, 3, 4, 5, 6]; ///грани по умолчанию
    }
    ///киним кубик и получим случайную грань
    this.rollz = function () {
        return this.grani[Math.floor(Math.random() * (this.grani.length - 0)) + 0];
    };
}

///Добавляем нового игрока в игру
function addplayer(namesprite, robot, nameplayer) {
    var player = new Playerz();
    player.stopz = 0;
    player.goz = 0;
    player.posonboard = 0;
    player.namesprite = namesprite;
    player.robot = robot;
    player.lap = 1;
    player.nameplayer = nameplayer;
    player.sprite = undefined;
    player.posInGame = 0; ///Место игрока в текущей игре
    player.maxTon = 0; ///Самое большое количество тон выброшеных игроком
    player.sumLoser = 0; ///Сколько раз игрок отправлялся в кафэ
    player.sumStopz = 0; ///Количество перегревов в текущей игре
    player.sumBreak = 0; ///Сколько раз игрок отправлял в кафэ
    player.sumStep = 0; ///Количес
    player.sumAllStep = 0;
    player.medalsPos1 = 0; ///Первое место
    player.medalsPos2 = 0; ///Второе место
    player.medalsPos3 = 0; ///Третье место
    player.medalsfastPlayer = 0; ///Самый быстрый ход (больше всего выбрашено тон в игре)
    player.medalsbreakingPlayer = 0; ///Самый ломающийся (больше всего словил перегревов за игру)
    player.medalshorriblePlayer = 0; ///Самый ужасный (больше всех отправил игроков в кафэ)
    player.medalsloserPlayer = 0; //
    gamesettings.players.push(player);
}

///Разрешено удалить игрока
function allowDel(player) {
    ///Новая игра
    if (flNewGame) {
        return true;
    }
    ///Игра закончена
    if (flGameFinish) {
        return true;
    }
    ///Игра не закончена игрок не финишировал
    var playerIsFinish = in_array(player, gamesettings.finishplayers);
    if (!playerIsFinish) {
        return true;
    }
    return false;
}

///Есть ли элемент в массиве
function in_array(value, array) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] == value) return true;
    }
    return false;
}

///сортируем масив в случайном порядке т.е. перемешиваем
function shufflemas(mas) {
    for (var i = mas.length - 1; i > 0; i--) {
        var num = Math.floor(Math.random() * (i + 1));
        var d = mas[num];
        mas[num] = mas[i];
        mas[i] = d;
    }
    return mas;
}

//////////////////////
//                  // 
// Load and Start   //
//       GAME       //
//////////////////////
///Добавим стэйты и запустим самый первый
game.state.add('StateBoot', StateBoot);
game.state.add('StateGame', StateGame);
game.state.add('StateAbout', StateAbout);
game.state.add('StateRules', StateRules);
game.state.add('StateMainMenu', StateMainMenu);
game.state.start('StateBoot');
