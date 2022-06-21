// 創造長寬400*400的畫面，Phaser.AUTO代表使用預設的繪圖方式，''是告訴畫面放在網頁的哪個部分
// preload載入素材(圖片、聲音)，create遊戲一開始初始化動作，只會執行一次，update在遊戲進行中，會不斷的執行
var game = new Phaser.Game(400, 450, Phaser.AUTO, '',
    { preload: preload, create: create, update: update });

var player1;
var player2;
var keyboard;

var platforms = [];

var leftWall;
var rightWall;
var leftWall2;
var rightWall2;
var ceiling;

var text1;
var text2;
var text3;

var distance = 0;
var status = 'start';

var lastTime = 0;
var starttime = 0;
var endtime = 0;

// preload載入素材(圖片、聲音)
function preload () {
	// baseURL載入資源的來源
    game.load.baseURL = 'https://x7852398521.github.io/NS-Shaft/assets/';
    game.load.crossOrigin = 'anonymous';
	// spritesheet與image差異，在於spritesheet包含很多個分別的圖片，有助於減少儲存空間，32, 32 就是裁切的長和寬，編號是從 0 開始
    game.load.spritesheet('player1', 'player1.png', 32, 32);
    game.load.spritesheet('player2', 'player2.png', 32, 32);
    game.load.spritesheet('life', 'life.png', 120, 20);
    game.load.image('wall', 'wall.png');
    game.load.image('ceiling', 'ceiling.png');
    game.load.image('normal', 'normal.png');
    game.load.image('nails', 'nails.png');
    game.load.image('black', 'black.png');
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
    // if(status != 'running') return;

    // game.physics.arcade.collide(A, B) 會判斷 A,B 是否碰撞。接受陣列做為參數，以下程式會檢查玩家是否與左牆或右牆碰撞
    this.physics.arcade.collide([player1, player2], platforms, effect);
    this.physics.arcade.collide([player1, player2], [leftWall, rightWall, leftWall2, rightWall2]);
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
    ceiling = game.add.image(0, 50, 'ceiling');

    // sprite為遊戲物件 game.add.sprite(x, y, 'image_name')
    leftWall = game.add.sprite(0, -50, 'wall');
    // game.physics.arcade.enable(物件) 掛載物理引擎，使物體具有移動、碰撞等狀態
    game.physics.arcade.enable(leftWall);
    // 固定物件
    leftWall.body.immovable = true;

    leftWall2 = game.add.sprite(0, 349, 'wall');
    game.physics.arcade.enable(leftWall2);
    leftWall2.body.immovable = true;

    rightWall = game.add.sprite(383, -50, 'wall');
    game.physics.arcade.enable(rightWall);
    rightWall.body.immovable = true;

    rightWall2 = game.add.sprite(383, 349, 'wall');
    game.physics.arcade.enable(rightWall2);
    rightWall2.body.immovable = true;

    black = game.add.image(0, 0, 'black');
}

function createPlatforms () {
    // game.time.now 可以取得遊戲開始到現在的時間
    if (status == 'start' || game.time.now == starttime)  {
        initialPlatform(200);
        initialPlatform(250);
        initialPlatform(300);
        initialPlatform(350);
        status = 'running'
    }
    if(game.time.now > lastTime + 600) {
        lastTime = game.time.now;
        createOnePlatform();
        distance += 1;
    }
}

function initialPlatform (y) {
    var platform;
    var x = Math.random()*(400 - 96 - 40) + 20;
    // var y = Math.random()*200 + 150;
    platform = game.add.sprite(x, y, 'normal');
    game.physics.arcade.enable(platform);
    platform.body.immovable = true;
    platforms.push(platform);
}

function createOnePlatform () {

    var platform;
    // 執行 Math.random() 會產生0~1的隨機數字
    var x = Math.random()*(400 - 96 - 40) + 20;
    var y = 450;
    var rand = Math.random() * 100;

    if(rand < 20) {
        platform = game.add.sprite(x, y, 'normal');
    } else if (rand < 40) {
        platform = game.add.sprite(x, y, 'nails');
        game.physics.arcade.enable(platform);
        // 修改圖片碰撞的邊界，sprite.body.setSize(長, 寬, x座標, y座標)
        platform.body.setSize(96, 15, 0, 15);
    } else if (rand < 50) {
        platform = game.add.sprite(x, y, 'conveyorLeft');
        // 幫角色增加動畫，Sprite.animations.add(動畫名字, 影格, 每秒幀數, 持續播放動畫)
        platform.animations.add('scroll', [0, 1, 2, 3], 16, true);
        // 播放動畫 Sprite.play(動畫名字)
        platform.play('scroll');
    } else if (rand < 60) {
        platform = game.add.sprite(x, y, 'conveyorRight');
        platform.animations.add('scroll', [0, 1, 2, 3], 16, true);
        platform.play('scroll');
    } else if (rand < 80) {
        platform = game.add.sprite(x, y, 'trampoline');
        platform.animations.add('jump', [4, 5, 4, 3, 2, 1, 0, 1, 2, 3], 120);
        // 設定外觀為圖片編號 3 的部分
        platform.frame = 3;
    } else {
        platform = game.add.sprite(x, y, 'fake');
        platform.animations.add('turn', [0, 1, 2, 3, 4, 5, 0], 14);
    }

    game.physics.arcade.enable(platform);
    platform.body.immovable = true;
    platforms.push(platform);

    //取消左邊、右邊、下邊的碰撞。增加以下語法接到創造 platform 程式後面，角色彈跳時就不會撞到上面的平台
    platform.body.checkCollision.down = false;
    platform.body.checkCollision.left = false;
    platform.body.checkCollision.right = false;
}

function createPlayer () {
    // sprite為遊戲物件 game.add.sprite(x, y, 'image_name')
    player1 = game.add.sprite(300, 100, 'player1');
    player2 = game.add.sprite(100, 100, 'player2');

    setPlayerAttr(player1);
    setPlayerAttr(player2);
}

function setPlayerAttr(player) {
    // game.physics.arcade.enable(物件) 掛載物理引擎，使物體具有移動、碰撞等狀態
    game.physics.arcade.enable(player);
    // 玩家引力
    player.body.gravity.y = 500;
    // 幫角色增加動畫，Sprite.animations.add(動畫名字, 影格, 每秒幀數, 持續播放動畫)
    player.animations.add('left', [0, 1, 2, 3], 8);
    player.animations.add('right', [9, 10, 11, 12], 8);
    player.animations.add('flyleft', [18, 19, 20, 21], 12);
    player.animations.add('flyright', [27, 28, 29, 30], 12);
    player.animations.add('fly', [36, 37, 38, 39], 12);
    player.life = 12;

    
    // unbeatableTime 角色無敵狀態的時間
    player.unbeatableTime = 0;
    // touchOn 紀錄碰撞的物體，防止重複觸法事件
    player.touchOn = undefined;
}

function createTextsBoard () {
    var style = {fill: '#ff0000', fontSize: '20px'}
    // 創造文字物件，game.add.text(x座標, y座標, 文字內容);
    text1 = game.add.text(10, 60, '', style);
    text2 = game.add.text(350, 60, '', style);
    text3 = game.add.text(140, 250, 'Enter 重新開始', style);
    text3.visible = false;

    life1 = game.add.sprite(25, 23, 'life');
    life1.frame = 12;
    life2 = game.add.sprite(255, 23, 'life');
    life2.frame = 12;
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
        // 播放動畫 Sprite.play(動畫名字)
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
        // 設定外觀為圖片編號 1 的部分
        player.frame = 8;
    }
}

function updatePlatforms () {
    for(var i=0; i<platforms.length; i++) {
        var platform = platforms[i];
        platform.body.position.y -= 2;
        if(platform.body.position.y <= -20) {
            // 銷毀 platform 物件
            platform.destroy();
            // 從陣列移除第 i 個平台
            platforms.splice(i, 1);
        }
    }
}

function updateTextsBoard () {
    text1.setText('life:' + player1.life);
    text2.setText('life:' + player2.life);
    if(player1.life < 0) {
        life1.frame = 0;
    } else {
        life1.frame = player1.life;
    }
    if(player2.life < 0) {
        life2.frame = 0;
    } else {
        life2.frame = player2.life;
    }
}

function effect(player, platform) {
    // platform.key 會是 sprite 的圖片名字
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
    // 播放動畫 Sprite.play(動畫名字)
    platform.animations.play('jump');
    // 設定速度，每秒垂直移動
    player.body.velocity.y = -350;
}

function nailsEffect(player, platform) {
    // touchOn 紀錄碰撞的物體
    if (player.touchOn !== platform) {
        // 扣生命
        player.life -= 3;
        player.touchOn = platform;
        // 背景閃爍，game.camera.flash(顏色色碼, 時間)
        game.camera.flash(0xff0000, 100);
    }
}

function basicEffect(player, platform) {
    // touchOn 紀錄碰撞的物體
    if (player.touchOn !== platform) {
        if(player.life < 10) {
            player.life += 1;
        }
        player.touchOn = platform;
    }
}

function fakeEffect(player, platform) {
    // touchOn 紀錄碰撞的物體
    if(player.touchOn !== platform) {
        // 播放動畫 Sprite.play(動畫名字)
        platform.animations.play('turn');
        // 延遲執行函式，setTimeout(執行的函式, 延遲時間ms)
        setTimeout(function() {
            platform.body.checkCollision.up = false;
        }, 100);
        player.touchOn = platform;
    }
}

function checkTouchCeiling(player) {
    if(player.body.y < 50) {
        if(player.body.velocity.y < 0) {
            // 設定速度，每秒垂直移動
            player.body.velocity.y = 0;
        }
        // game.time.now 可以取得遊戲開始到現在的時間
        if(game.time.now > player.unbeatableTime) {
            player.life -= 3;
            // 背景閃爍，game.camera.flash(顏色色碼, 時間)
            game.camera.flash(0xff0000, 100);
            // unbeatableTime 角色無敵狀態的時間
            player.unbeatableTime = game.time.now + 2000;
        }
    }
}

function checkGameOver () {
    if(player1.life <= 0 || player1.body.y > 550) {
        player1.visible = false
        player2.visible = false
        gameOver('player2');
    }
    if(player2.life <= 0 || player2.body.y > 550) {
        player1.visible = false
        player2.visible = false
        gameOver('player1');
    }
}

function gameOver(winner) {
    text3.visible = true;
    text3.setText('勝利者 ' + winner + '\nEnter 重新開始');
    // destroy 銷毀 platform 物件
    platforms.forEach(function(s) {s.destroy()});
    platforms = [];
    status = 'gameOver';
    endtime = game.time.now;
}

function restart () {
    text3.visible = false;
    distance = 0;
    createPlayer();
    status = 'running';
    starttime = game.time.now;
}
