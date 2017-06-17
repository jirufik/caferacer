var game = new Phaser.Game(
        1024,
        728,
        Phaser.AUTO,
        '#game',
        {
            init: initial,
            preload: preload,
            create: create,
            update: update
        }
    );

//инициализация параметров игры
function initial() {
    //параметры масштабирования экрана
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

    //центруем игровой экран по горизонтали и вертикали
    // game.scale.pageAlignHorizontally = true;
    // game.scale.pageAlignVertically = true;
}

function preload() {
    game.load.image('boardS', 'cafe/Board1.png');
    for (var ii=1; ii<=3; ii++)
        {
            game.load.image('fishkaS'+ii, 'cafe/fishka'+ii+'.png');
        }
    //game.load.image('fishkaS', 'cafe/fishka.png');
    //game.load.image('fishkaS1', 'cafe/fishka1.png');
    game.load.image('dangerS', 'cafe/danger.png');
    game.load.image('tonS', 'cafe/ton.png');
    game.load.spritesheet('qubicS', 'cafe/qubic.png', 66, 66);
    game.load.audio('diceroll', 'cafe/sound/roll_dice.mp3');
    game.load.audio('incafe', 'cafe/sound/in_cafe.mp3');
    game.load.audio('danger', 'cafe/sound/danger.mp3');
    game.load.audio('finish', 'cafe/sound/finish.mp3');
    game.load.audio('race', 'cafe/sound/race.mp3');
    game.load.spritesheet('soundS', 'cafe/sound.png', 60, 60);
    game.load.image('aboutS', 'cafe/about.png');
    game.load.image('rulesS', 'cafe/rules.png');
    game.load.image('setplayersS', 'cafe/settingsplayers.png');
}

function Playerz() {
    var stopz = 0; ///количество перегревов
    var goz = 0; ///количество тон
    var posonboard = 0; ///позиция на доске, номер клетки
    var namesprite = 'fishkaS1'; ///спрайт игрока
    var robot = true; ///АИ или человек
    var lap = 1; ///номер круга
    var nameplayer = 'robot'; ///имя игрока
    var sprite = undefined; ///Фазеровский объект спрайта игрока
}

function Qubic(masgrani) {
    if (Array.isArray(masgrani)) {
       this.grani = masgrani; ///заполним кубик гранями
    }
    else{
       this.grani = [1,2,3,4,5,6]; ///грани по умолчанию
    }
    ///киним кубик и получим случайную грань
    this.rollz = function () {
        return this.grani[Math.floor(Math.random() * (this.grani.length - 0)) + 0];
    } 
}

///Основные настройки текщей игры
var gamesettings = {
    laps : 3,
    players : [],
    curplayers : 0,
    finishplayers : []
}

///Добавляем нового игрока в игру
function addplayer(namesprite, robot, nameplayer) {
    var tmpplayer = new Playerz();
    tmpplayer.stopz = 0;
    tmpplayer.goz = 0;
    tmpplayer.posonboard = 0;
    tmpplayer.namesprite = namesprite;
    tmpplayer.robot = robot;
    tmpplayer.lap = 1;
    tmpplayer.nameplayer = nameplayer;
    tmpplayer.sprite = undefined;
    gamesettings.players.push(tmpplayer);
}

///Создадим 3 кубика (1 - тонна; 0 - перегрев)
var qubiczone = new Qubic([1,0,1,1,1,0]);
var qubicztwo = new Qubic([1,0,1,0,1,0]);
var qubiczthree = new Qubic([1,0,1,0,1,0]);

///Значение кубиков после броска
var znachq1 = 1;
var znachq2 = 1;
var znachq3 = 1;

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

///Звук когда перегрев
var sounddanger;

var soundfinish;

///Анимация движения фишки
var fishkaanimation = false;

///Создадим двух тестовых игроков
function createtestplayers() {
    addplayer('fishkaS1', false, 'You');
    addplayer('fishkaS3', true, 'Rufus');
    addplayer('fishkaS2', true, 'Jirufik');
}

function create() {
    ///Добавим спрайт доски игры
    game.add.sprite(0, 0, 'boardS');
    
    ///Создадим тестовых игроков
    createtestplayers();
    
    ///Жеребьевка перемешаем игроков в случайном порядке
    shufflemas(gamesettings.players);
    
    ///Установим текущего игрока
    gamesettings.curplayers = 0;
    
    ///Добавим спрайты и анимацию для каждого кубика
    qubic1 = game.add.sprite(740, 660, 'qubicS');
    qubic1.animations.add('bzzz', [0, 1], 9, true);
    
    qubic2 = game.add.sprite(812, 660, 'qubicS');
    qubic2.animations.add('bzzz2', [0, 1], 9, true);
    
    qubic3 = game.add.sprite(882, 660, 'qubicS');
    qubic3.animations.add('bzzz3', [0, 1], 9, true);
    
    ///Отобразим тонны игрока на игровом поле
    tonsprite = game.add.sprite(740, 450, 'tonS');
    textgo = game.add.text(820, 460, 'X 0', { font : 'Eras Bold ITC', fontSize: '36px', fill: '#000' });
    
    ///Отобразим перегревы игрока на игровом поле
    dangersprite = game.add.sprite(740, 520, 'dangerS');
    textstop = game.add.text(820, 530, 'X 0', { font : 'Eras Bold ITC', fontSize: '36px', fill: '#000' });

    aboutSprite = game.add.sprite(740, 207, 'aboutS');
    aboutSprite.inputEnabled = true;

    rulesSprite = game.add.sprite(740, 142, 'rulesS');
    rulesSprite.inputEnabled = true;

    setplayersSprite = game.add.sprite(740, 12, 'setplayersS');
    setplayersSprite.inputEnabled = true;

    ///Отобразим вкл/выкл звук
    soundSprite = game.add.sprite(740, 77, 'soundS');
    soundSprite.frame = 0;
    soundSprite.inputEnabled = true;
    soundSprite.events.onInputDown.add(SoundChange, this);
    
    ///Поставим фишки игроков на стартовую позицию
    var firstpos = 286;
    for (var i=0; i<gamesettings.players.length; i++) {
        gamesettings.players[i].sprite = game.add.sprite(firstpos+12, 580, gamesettings.players[i].namesprite);
        firstpos = firstpos + 12;
    }
    
    ///Разместим слово Рэйс и назначим ему обработчики
    textRace = game.add.text(850, 600, 'Race', { font : 'Eras Bold ITC', fontSize: '38px', fill: '#000' });
    textRace.inputEnabled = true;
    textRace.events.onInputDown.add(playerrace, this);
    textRace.events.onInputOver.add(overrace, this);
    textRace.events.onInputOut.add(outrace, this);
    
    ///Разместим слово Roll и назначим ему обработчики
    textRoll = game.add.text(770, 600, 'Roll', { font : 'Eras Bold ITC', fontSize: '38px', fill: '#000' });
    textRoll.inputEnabled = true;
    textRoll.events.onInputDown.add(playerroll, this);
    textRoll.events.onInputOver.add(overroll, this);
    textRoll.events.onInputOut.add(outroll, this);
    
    ///Текст текущий игрок
    textCurPlayer = game.add.text(740, 300, '', { font : 'Eras Bold ITC', fontSize: '36px', fill: '#000' });
    textCurPlayer.inputEnabled = false;
    
    ///Текущий круг из кругов
    textCurLap = game.add.text(740, 405, '', { font : 'Eras Bold ITC', fontSize: '36px', fill: '#000' });
    textCurLap.inputEnabled = false;
    
    ///Добавим звук кубиков
    soundroll = game.add.audio('diceroll');
    
    ///Добавим звук фишка в кафэ
    soundincafe = game.add.audio('incafe');

    ///Добавим звук перегрева
    sounddanger = game.add.audio('danger');
    
    soundfinish = game.add.audio('finish');
    
    soundrace = game.add.audio('race');
    
    ///Заполним текст текущий игрок именем текущего игрока
    settextcurplayer();
    
    ///Отобразим спрайт текущего игрока
    setspritecurplayer(); 
    
    ///Напишем текущий круг текущего игрока
    setlapcurplayer();
    
    ///Флаг перехода к следующему игроку
    flNextPlayer = false;
    
    ///Обнулим массив финишироваших игроков
    gamesettings.finishplayers = [];
    
    //alert(gamesettings.players[gamesettings.curplayers]);
    //gamesettings.finishplayers.push(gamesettings.players[gamesettings.curplayers]);
    //alert(gamesettings.players[0] == gamesettings.finishplayers[0]);
    
}

function update() {
    
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

///Добавляем стэйт режима игры
//var StatePlayGame = new Phaser.state();

///Финиш игры, выводим титры
function theendgame() {
    if (flGameFinish) {
       alert(gamesettings.finishplayers[0].nameplayer + ' WIN');
    }
}

///Проверяем перегревы если их 5 и больше переход хода
///Или переход хода к следующему игроку
function nextplayer() {
    
    if (flSound && (gamesettings.players[gamesettings.curplayers].stopz >= 5)) {
        sounddanger.play();
    }
    
    ///Если пять или больше перегревов переход к другому игроку или предыдущий игрок сходил/закончил свой ход
    if ((gamesettings.players[gamesettings.curplayers].stopz >= 5) || (flNextPlayer == true)) {
        gamesettings.players[gamesettings.curplayers].stopz = 0;
        gamesettings.players[gamesettings.curplayers].goz = 0;
        
        
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
    for (var i=0; i<gamesettings.players.length; i++) {
        //if (!(gamesettings.players[i] in gamesettings.finishplayers)) {
        if (in_array(gamesettings.players[i], gamesettings.finishplayers) == false) {
            finishgamez = false;
            break;
        }
    }
    flGameFinish = finishgamez;
    ///Если не конец игры установим следующего игрока
    if (finishgamez == false) {
        var z = gamesettings.curplayers + 1;
        ///Пробежимся по всем игрокам
        while (z != gamesettings.curplayers) {
            ///Если до этого был последний игрок то переходим к первому
            if (z >= gamesettings.players.length) {
                z = 0;
            }
            ///Если игрок не финишировал тогда передаем ему ход, цикл прерываем
            if (in_array(gamesettings.players[z], gamesettings.finishplayers) == false) {
                gamesettings.curplayers = z;
                break;
            }
            ///Увеличиваем z т.е. переходим к следующему игроку
            z = z + 1;
        }
    }
}

function in_array(value, array) 
{
    for(var i = 0; i < array.length; i++) 
    {
        if(array[i] == value) return true;
    }
    return false;
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
function playerrace() {
    ///Только если больше одной тонны можем ходить
    if (gamesettings.players[gamesettings.curplayers].goz > 0) {
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

///Проверим если фишка встала на другую, то другую сбросим в начало круга    
function setcafeplayer() {
    ///текущий игрок не финишировал
    if (!in_array(gamesettings.players[gamesettings.curplayers], gamesettings.finishplayers)) {
        for (var i = 0; i < gamesettings.players.length; i++) {
            if ((gamesettings.players[gamesettings.curplayers].posonboard == gamesettings.players[i].posonboard) && (i !== gamesettings.curplayers)) {
                if (!in_array(gamesettings.players[i], gamesettings.finishplayers)) {
                    ///Проиграем звук если включено звуковое оповещение
                    if (flSound) {
                        soundincafe.play();
                    }
                    ///Если фишка сбрашиваемого игрока стоит на финише значит круг у него увеличился
                    ///Но т.к. он еще не на старте он отправляется в кафэ и круг считается не пройденым 
                    ///Поэтому минус один круг
                    ///Выстроим фишки в кафэ
                    if (gamesettings.players[i].posonboard === 36) {
                        gamesettings.players[i].lap = gamesettings.players[i].lap - 1;
                    }
                    ///Сбросим в кафэ игрока на которого наехали
                    gamesettings.players[i].posonboard = 0;
                    setcafesprites();
                }
            }
        }
    }
}

///Переместим спрайт на доске т.е. сделаем ход
///Сбросим тонны и перегревы
function raceonboard() {
    
    ///Расположим фишку поверх других
    game.world.bringToTop(gamesettings.players[gamesettings.curplayers].sprite);
    
    ///Если фишка игрока еще не начинала игру то присвоем ей начальные координаты старта спрайта
    ///что бы избежать смещения на игровом поле
    if (gamesettings.players[gamesettings.curplayers].posonboard === 0) {
        gamesettings.players[gamesettings.curplayers].sprite.x = 298;
        gamesettings.players[gamesettings.curplayers].sprite.y = 580;
    }
    
    ///Сколько тонн столько ходов и делаем
    //while (gamesettings.players[gamesettings.curplayers].goz > 0) {
    if (gamesettings.players[gamesettings.curplayers].goz > 0) {
        ///Поставим флаг что происходит анимация фишки
        fishkaanimation = true;
        ///Выводим фишку из кафе на старт 
        if (gamesettings.players[gamesettings.curplayers].posonboard === 0) {
            gamesettings.players[gamesettings.curplayers].sprite.y = gamesettings.players[gamesettings.curplayers].sprite.y + 80;
        }
        ///Идем по низу
        else if ((gamesettings.players[gamesettings.curplayers].posonboard >= 1) && (gamesettings.players[gamesettings.curplayers].posonboard <= 4))  {
            for (var x = 1; x <= 72; x++) {
                gamesettings.players[gamesettings.curplayers].sprite.x = gamesettings.players[gamesettings.curplayers].sprite.x - 1;
            }
        }
        ///Идем слева
        else if ((gamesettings.players[gamesettings.curplayers].posonboard >= 5) && (gamesettings.players[gamesettings.curplayers].posonboard <= 13))  {
            for (var y = 1; y <= 72; y++) {
                gamesettings.players[gamesettings.curplayers].sprite.y = gamesettings.players[gamesettings.curplayers].sprite.y - 1;
            }
        }
        ///Идем по верху
        else if ((gamesettings.players[gamesettings.curplayers].posonboard >= 14) && (gamesettings.players[gamesettings.curplayers].posonboard <= 22))  {
            for (var x = 1; x <= 72; x++) {
                gamesettings.players[gamesettings.curplayers].sprite.x = gamesettings.players[gamesettings.curplayers].sprite.x + 1;
            }
        }
        ///Идем справа
        else if ((gamesettings.players[gamesettings.curplayers].posonboard >= 23) && (gamesettings.players[gamesettings.curplayers].posonboard <= 31))  {
            for (var y = 1; y <= 72; y++) {
                gamesettings.players[gamesettings.curplayers].sprite.y = gamesettings.players[gamesettings.curplayers].sprite.y + 1;
            }
        }
        ///Идем по низу
        else if ((gamesettings.players[gamesettings.curplayers].posonboard >= 32) && (gamesettings.players[gamesettings.curplayers].posonboard <= 36))  {
            for (var x = 1; x <= 72; x++) {
                gamesettings.players[gamesettings.curplayers].sprite.x = gamesettings.players[gamesettings.curplayers].sprite.x - 1;
            }
        }        
        ///Уменьшаем тонну на 1 после хода
        gamesettings.players[gamesettings.curplayers].goz = gamesettings.players[gamesettings.curplayers].goz - 1;
        ///Увеличиваем позицию на игровой доске на 1 после хода
        gamesettings.players[gamesettings.curplayers].posonboard = gamesettings.players[gamesettings.curplayers].posonboard + 1;
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
            gamesettings.players[gamesettings.curplayers].stopz = 0;
            ///Проверим если фишка встала на другую, то другую сбросим в начало круга    
            setcafeplayer(); 
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
        }
}

///Если текущая позиция 36 т.е. финиш, то увеличим круг на 1 и продолжим игру
///Если это был последний круг т.е. текущий круг стал больше всего кругов то игрок финиширует
///Если не финниш и текущая позиция 37 т.е. на старте, новй круг, то присваиваем текущему игроку позицию номер один
function finishorendlap() {
    ///Если текущая позиция 36 т.е. финиш, то увеличим круг на 1
    if (gamesettings.players[gamesettings.curplayers].posonboard === 36) {
        gamesettings.players[gamesettings.curplayers].lap = gamesettings.players[gamesettings.curplayers].lap + 1;
        ///Напишем текущий круг текущего игрока
        setlapcurplayer();
    }
    ///Если это был последний круг т.е. текущий круг стал больше всего кругов то игрок финиширует
    if (gamesettings.players[gamesettings.curplayers].lap > gamesettings.laps) {
        if (flSound) {
            soundfinish.play();
        }
        ///Добавим игрока в массив финишировавших игроков
        gamesettings.finishplayers.push(gamesettings.players[gamesettings.curplayers]);
        ///Сбросим все перегревы и тонны
        gamesettings.players[gamesettings.curplayers].stopz = 0;
        gamesettings.players[gamesettings.curplayers].goz = 0;
        ///Разместим фишки финишировавших игроков
        setfinishsprites();
    }
    ///Если не финниш и текущая позиция 37 т.е. на старте, новй круг, то присваиваем текущему игроку позицию номер один
    else {
        if (gamesettings.players[gamesettings.curplayers].posonboard === 37) {
            gamesettings.players[gamesettings.curplayers].posonboard = 1;
        }
    }
}

///Разместим фишки игроков в кафе
function setcafesprites() {
    var firstpos = 286;
    for (var i=0; i<gamesettings.players.length; i++) {
            if (gamesettings.players[i].posonboard === 0) {
            gamesettings.players[i].sprite.x = firstpos;
            gamesettings.players[i].sprite.y = 580;
            firstpos = firstpos + 12;
        }
    }
}

///Разместим фишки финишировавших игроков
function setfinishsprites() {
    var firstpos = 286;
    for (var i=0; i<gamesettings.finishplayers.length; i++) {
        gamesettings.finishplayers[i].sprite.x = firstpos;
        gamesettings.finishplayers[i].sprite.y = 180;
        firstpos = firstpos + 12;
    }
}

function TheEndPause() {
    flpausegame = false;
}

///Если игрок робот то запустим АИ
function robotplay() {
    if (gamesettings.players[gamesettings.curplayers].robot) {
        ///Пауза между ходами робота
        flpausegame = true;
        game.time.events.add(3000, TheEndPause, this);
        ///Еслти робот запретим нажатие кнопок
        textRace.inputEnabled = false;
        textRoll.inputEnabled = false;
        ///Сделаем кнопки отжатыми
        outrace();
        outroll();
        var flrace = false;
        ///Если количество очков хватает финишировать то ходим
        if ((gamesettings.laps == gamesettings.players[gamesettings.curplayers].lap) && (gamesettings.players[gamesettings.curplayers].posonboard != 36)) {
            if ((gamesettings.players[gamesettings.curplayers].goz + gamesettings.players[gamesettings.curplayers].posonboard) >= 36) {
                playerrace();
                flrace = true;
            }
        }
        ///Если текущее количество тонн больше 0 и можно сбросить
        ///другого игрока то ходим
        if ((gamesettings.players[gamesettings.curplayers].goz > 0) && (!flrace)) {
            ///текущий игрок не финишировал
            if (!in_array(gamesettings.players[gamesettings.curplayers], gamesettings.finishplayers)) {
                var pos = gamesettings.players[gamesettings.curplayers].posonboard + gamesettings.players[gamesettings.curplayers].goz;
                for (var i = 0; i < gamesettings.players.length; i++) {
                    if ((pos == gamesettings.players[i].posonboard) && (i !== gamesettings.curplayers)) {
                        if (!in_array(gamesettings.players[i], gamesettings.finishplayers)) {
                            ///Сбросим игрока
                            playerrace(); 
                            flrace = true;
                            break;
                        }
                    }
                }
            }
        }
        ///Если больше или равно 3 перегрева ходим иначе кидаем
        if (!flrace) {
            if ((gamesettings.players[gamesettings.curplayers].stopz >= 3) && (gamesettings.players[gamesettings.curplayers].goz > 0)) {
                playerrace();
            } 
            else {
                playerroll();
            }
        }  
    }
    ///Если не робот разрешим нажатие кнопок
    else {
        textRace.inputEnabled = true;
        textRoll.inputEnabled = true;
    }
}   

///Курсор наведен на Рэйс увеличем
function overrace() {
    textRace.fontSize = '38px';
    textRace.fill = '#04B404';
}

///Курсор не наведен на Рэйс уменьшим
function outrace() {
    textRace.fontSize = '36px';
    textRace.fill = '#000';
}

///Напишем имя текущего игрока
function settextcurplayer() {
    textCurPlayer.text = gamesettings.players[gamesettings.curplayers].nameplayer;
}

///Напишем текущий круг текущего игрока
function setlapcurplayer() {
    textCurLap.text = 'Lap: ' + gamesettings.players[gamesettings.curplayers].lap + ' of ' + gamesettings.laps;
}

///Отобразим спрайт текущего игрока
function setspritecurplayer() {
    spriteCurPlayer = game.add.sprite(740, 350, gamesettings.players[gamesettings.curplayers].namesprite);
    //spriteCurPlayer.destroy();
}

///Нажатие на Roll кидаем кубики
function playerroll() {
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

///Отключаем анимацию записываем очки
function TheEndAnimations() {
    zapolnimo4ki();
    QubicAnimations = false;
}

///Заполним и выведем очки текущего пользователя
function zapolnimo4ki() {
    
    if (znachq1 === 1){
       gamesettings.players[gamesettings.curplayers].goz = gamesettings.players[gamesettings.curplayers].goz + 1;
    }
    else {
        gamesettings.players[gamesettings.curplayers].stopz = gamesettings.players[gamesettings.curplayers].stopz + 1;
    }
    
    if (znachq2 === 1){
       gamesettings.players[gamesettings.curplayers].goz = gamesettings.players[gamesettings.curplayers].goz + 1;
    }
    else {
        gamesettings.players[gamesettings.curplayers].stopz = gamesettings.players[gamesettings.curplayers].stopz + 1;
    }
    
    if (znachq3 === 1){
       gamesettings.players[gamesettings.curplayers].goz = gamesettings.players[gamesettings.curplayers].goz + 1;
    }
    else {
        gamesettings.players[gamesettings.curplayers].stopz = gamesettings.players[gamesettings.curplayers].stopz + 1;
    }
    ///Выведем значения перегревов и тонн
    outtext();
}

///Выведем значения перегревов и тонн
function outtext() {
    textgo.text = 'X '+gamesettings.players[gamesettings.curplayers].goz;
    textstop.text = 'X '+gamesettings.players[gamesettings.curplayers].stopz;
}

///Курсор наведен на Roll увеличем
function overroll() {
    textRoll.fontSize = '38px';
    textRoll.fill = '#04B404';
}

///Курсор не наведен на Roll уменьшим
function outroll() {
    textRoll.fontSize = '36px';
    textRoll.fill = '#000';
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

///Включить выключить звуковое сопровождение
function SoundChange() {
    if (flSound === true) {
        soundSprite.frame = 1;
        flSound = false;
    }
    else {
        soundSprite.frame = 0;
        flSound = true;
    }
}
///