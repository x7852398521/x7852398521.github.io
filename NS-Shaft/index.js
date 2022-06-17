// 創造長寬400*400的畫面，Phaser.AUTO代表使用預設的繪圖方式，''是告訴畫面放在網頁的哪個部分
// preload載入素材(圖片、聲音)，create遊戲一開始初始化動作，只會執行一次，update在遊戲進行中，會不斷的執行
var game = new Phaser.Game(400, 400, Phaser.AUTO, '',
    { preload: preload, create: create, update: update });

var player1;
var player2;
var keyboard;

var platforms = [];

var leftWall;
var rightWall;
var ceiling;

var text1;
var text2;
var text3;

var distance = 0;
var status = 'running';

// preload載入素材(圖片、聲音)
function preload () {
	// baseURL載入資源的來源
    game.load.baseURL = 'https://x7852398521.github.io/NS-Shaft/assets/';
    game.load.crossOrigin = 'anonymous';
	// spritesheet與image差異，在於spritesheet包含很多個分別的圖片，有助於減少儲存空間
    game.load.spritesheet('player1', 'player1.png', 32, 32);
    game.load.spritesheet('player2', 'player2.png', 32, 32);
    game.load.image('wall', 'wall.png');
    game.load.image('ceiling', 'ceiling.png');
    game.load.image('normal', 'normal.png');
    game.load.image('nails', 'nails.png');
    game.load.spritesheet('conveyorRight', 'conveyor_right.png', 96, 16);
    game.load.spritesheet('conveyorLeft', 'conveyor_left.png', 96, 16);
    game.load.spritesheet('trampoline', 'trampoline.png', 96, 22);
    game.load.spritesheet('fake', 'fake.png', 96, 36);
}

// create遊戲一開始初始化動作，只會執行一次，update在遊戲進行中，會不斷的執行
function create () {

    // 鍵盤事件
    keyboard = game.input.keyboard.addKeys({
        'enter': Phaser.Keyboard.ENTER,
        'up': Phaser.Keyboard.UP,
        'down': Phaser.Keyboard.DOWN,
        'left': Phaser.Keyboard.LEFT,
        'right': Phaser.Keyboard.RIGHT,
        'w': Phaser.Keyboard.W,
        'a': Phaser.Keyboard.A,
        's': Phaser.Keyboard.S,
        'd': Phaser.Keyboard.D
    });

    createBounders();
    createPlayer();
    createTextsBoard();
}

// update在遊戲進行中，會不斷的執行
function update () {

    // bad
    // 當ENTER被按下
    if(status == 'gameOver' && keyboard.enter.isDown) restart();
    if(status != 'running') return;

    this.physics.arcade.collide([player1, player2], platforms, effect);
    this.physics.arcade.collide([player1, player2], [leftWall, rightWall]);
    this.physics.arcade.collide(player1, player2);
    checkTouchCeiling(player1);
    checkTouchCeiling(player2);
    checkGameOver();

    updatePlayer();
    updatePlatforms();
    updateTextsBoard();

    createPlatforms();
}

function createBounders () {
    // sprite為遊戲物件 game.add.sprite(x, y, 'image_name')
    leftWall = game.add.sprite(0, 0, 'wall');
    // game.physics.arcade.enable(物件) 掛載物理引擎，使物體具有移動、碰撞等狀態
    game.physics.arcade.enable(leftWall);
    // 非移動物件
    leftWall.body.immovable = true;

    rightWall = game.add.sprite(383, 0, 'wall');
    game.physics.arcade.enable(rightWall);
    rightWall.body.immovable = true;

    ceiling = game.add.image(0, 0, 'ceiling');
}

var lastTime = 0;
function createPlatforms () {
    if(game.time.now > lastTime + 600) {
        lastTime = game.time.now;
        createOnePlatform();
        distance += 1;
    }
}

function createOnePlatform () {

    var platform;
    var x = Math.random()*(400 - 96 - 40) + 20;
    var y = 400;
    var rand = Math.random() * 100;

    if(rand < 20) {
        platform = game.add.sprite(x, y, 'normal');
    } else if (rand < 40) {
        platform = game.add.sprite(x, y, 'nails');
        game.physics.arcade.enable(platform);
        platform.body.setSize(96, 15, 0, 15);
    } else if (rand < 50) {
        platform = game.add.sprite(x, y, 'conveyorLeft');
        platform.animations.add('scroll', [0, 1, 2, 3], 16, true);
        platform.play('scroll');
    } else if (rand < 60) {
        platform = game.add.sprite(x, y, 'conveyorRight');
        platform.animations.add('scroll', [0, 1, 2, 3], 16, true);
        platform.play('scroll');
    } else if (rand < 80) {
        platform = game.add.sprite(x, y, 'trampoline');
        platform.animations.add('jump', [4, 5, 4, 3, 2, 1, 0, 1, 2, 3], 120);
        platform.frame = 3;
    } else {
        platform = game.add.sprite(x, y, 'fake');
        platform.animations.add('turn', [0, 1, 2, 3, 4, 5, 0], 14);
    }

    game.physics.arcade.enable(platform);
    platform.body.immovable = true;
    platforms.push(platform);

    platform.body.checkCollision.down = false;
    platform.body.checkCollision.left = false;
    platform.body.checkCollision.right = false;
}

function createPlayer () {
    // sprite為遊戲物件 game.add.sprite(x, y, 'image_name')
    player1 = game.add.sprite(300, 50, 'player1');
    player2 = game.add.sprite(100, 50, 'player2');

    setPlayerAttr(player1);
    setPlayerAttr(player2);
}

function setPlayerAttr(player) {
    // game.physics.arcade.enable(物件) 掛載物理引擎，使物體具有移動、碰撞等狀態
    game.physics.arcade.enable(player);
    player.body.gravity.y = 500;
    player.animations.add('left', [0, 1, 2, 3], 8);
    player.animations.add('right', [9, 10, 11, 12], 8);
    player.animations.add('flyleft', [18, 19, 20, 21], 12);
    player.animations.add('flyright', [27, 28, 29, 30], 12);
    player.animations.add('fly', [36, 37, 38, 39], 12);
    player.life = 10;
    player.unbeatableTime = 0;
    player.touchOn = undefined;
}

function createTextsBoard () {
    var style = {fill: '#ff0000', fontSize: '20px'}
    text1 = game.add.text(10, 10, '', style);
    text2 = game.add.text(350, 10, '', style);
    text3 = game.add.text(140, 200, '', style);
    text3.visible = false;
}

function updatePlayer () {
    // 當左鍵被按下
    if(keyboard.left.isDown) {
        // 設定速度，每秒平行移動
        player1.body.velocity.x = -250;
    // 當右鍵被按下
    } else if(keyboard.right.isDown) {
        player1.body.velocity.x = 250;
    } else {
        player1.body.velocity.x = 0;
    }
    // 當a鍵被按下
    if(keyboard.a.isDown) {
        player2.body.velocity.x = -250;
    // 當d鍵被按下
    } else if(keyboard.d.isDown) {
        player2.body.velocity.x = 250;
    } else {
        player2.body.velocity.x = 0;
    }
    setPlayerAnimate(player1);
    setPlayerAnimate(player2);
}

function setPlayerAnimate(player) {
    // 速度
    var x = player.body.velocity.x;
    var y = player.body.velocity.y;

    if (x < 0 && y > 0) {
        player.animations.play('flyleft');
    }
    if (x > 0 && y > 0) {
        player.animations.play('flyright');
    }
    if (x < 0 && y == 0) {
        player.animations.play('left');
    }
    if (x > 0 && y == 0) {
        player.animations.play('right');
    }
    if (x == 0 && y != 0) {
        player.animations.play('fly');
    }
    if (x == 0 && y == 0) {
      player.frame = 8;
    }
}

function updatePlatforms () {
    for(var i=0; i<platforms.length; i++) {
        var platform = platforms[i];
        platform.body.position.y -= 2;
        if(platform.body.position.y <= -20) {
            platform.destroy();
            platforms.splice(i, 1);
        }
    }
}

function updateTextsBoard () {
    text1.setText('life:' + player1.life);
    text2.setText('life:' + player2.life);
}

function effect(player, platform) {
    if(platform.key == 'conveyorRight') {
        conveyorRightEffect(player, platform);
    }
    if(platform.key == 'conveyorLeft') {
        conveyorLeftEffect(player, platform);
    }
    if(platform.key == 'trampoline') {
        trampolineEffect(player, platform);
    }
    if(platform.key == 'nails') {
        nailsEffect(player, platform);
    }
    if(platform.key == 'normal') {
        basicEffect(player, platform);
    }
    if(platform.key == 'fake') {
        fakeEffect(player, platform);
    }
}

function conveyorRightEffect(player, platform) {
    // 平行移動，物件.body.x(取得當前物件的x軸位置)，物件.body.x=數字(設定物件座標)
    player.body.x += 2;
}

function conveyorLeftEffect(player, platform) {
    player.body.x -= 2;
}

function trampolineEffect(player, platform) {
    platform.animations.play('jump');
    // 設定速度，每秒垂直移動
    player.body.velocity.y = -350;
}

function nailsEffect(player, platform) {
    if (player.touchOn !== platform) {
        player.life -= 3;
        player.touchOn = platform;
        game.camera.flash(0xff0000, 100);
    }
}

function basicEffect(player, platform) {
    if (player.touchOn !== platform) {
        if(player.life < 10) {
            player.life += 1;
        }
        player.touchOn = platform;
    }
}

function fakeEffect(player, platform) {
    if(player.touchOn !== platform) {
        platform.animations.play('turn');
        setTimeout(function() {
            platform.body.checkCollision.up = false;
        }, 100);
        player.touchOn = platform;
    }
}

function checkTouchCeiling(player) {
    if(player.body.y < 0) {
        if(player.body.velocity.y < 0) {
            // 設定速度，每秒垂直移動
            player.body.velocity.y = 0;
        }
        if(game.time.now > player.unbeatableTime) {
            player.life -= 3;
            game.camera.flash(0xff0000, 100);
            player.unbeatableTime = game.time.now + 2000;
        }
    }
}

function checkGameOver () {
    if(player1.life <= 0 || player1.body.y > 500) {
        gameOver('player2');
    }
    if(player2.life <= 0 || player2.body.y > 500) {
        gameOver('player1');
    }
}

function gameOver(winner) {
    text3.visible = true;
    text3.setText('勝利者 ' + winner + '\nEnter 重新開始');
    platforms.forEach(function(s) {s.destroy()});
    platforms = [];
    status = 'gameOver';
}

function restart () {
    text3.visible = false;
    distance = 0;
    createPlayer();
    status = 'running';
}
