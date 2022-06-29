// 創造長寬400*400的畫面，Phaser.AUTO代表使用預設的繪圖方式，''是告訴畫面放在網頁的哪個部分
// preload載入素材(圖片、聲音)，create遊戲一開始初始化動作，只會執行一次，update在遊戲進行中，會不斷的執行
var game = new Phaser.Game(613, 492, Phaser.AUTO, '',
    { preload: preload, create: create, update: update });

var player1;
var player2;
var keyboard;

var beer;
var beers = [];
var platforms = [];

var leftWall;
var rightWall;
var leftWall2;
var rightWall2;
var ceiling;

var text1;
var beerscoreicon;
var beerscore;
var beertext;

var life1;
var life2;

var distance = 0;
var status = 'start';

var lastTime = 0;
var starttime = 0;
var endtime = 0;

// preload載入素材(圖片、聲音)
function preload () {
	// // baseURL載入資源的來源
    // game.load.baseURL = 'https://x7852398521.github.io/NS-Shaft/assets/';
    // game.load.crossOrigin = 'anonymous';
	// spritesheet與image差異，在於spritesheet包含很多個分別的圖片，有助於減少儲存空間，32, 32 就是裁切的長和寬，編號是從 0 開始
    // game.load.spritesheet('player1', 'player1.png', 32, 32);
    // game.load.spritesheet('player2', 'player2.png', 32, 32);
    // game.load.spritesheet('life', 'life.png', 120, 20);
    // game.load.image('wall', 'wall.png');
    // game.load.image('ceiling', 'ceiling.png');
    // game.load.image('normal', 'normal.png');
    // game.load.image('nails', 'nails.png');
    // game.load.image('background', 'background.png');
    // game.load.image('beer', 'beer.png');
    // game.load.spritesheet('conveyorRight', 'conveyor_right.png', 96, 16);
    // game.load.spritesheet('conveyorLeft', 'conveyor_left.png', 96, 16);
    // game.load.spritesheet('trampoline', 'trampoline.png', 96, 22);
    // game.load.spritesheet('fake', 'fake.png', 96, 36);

    game.load.spritesheet('player1', './assets/player1.png', 32, 32);
    game.load.spritesheet('player2', './assets/player2.png', 32, 32);
    game.load.spritesheet('life', './assets/life.png', 120, 20);
    game.load.image('wall', './assets/wall.png');
    game.load.image('ceiling', './assets/ceiling.png');
    game.load.image('normal', './assets/normal.png');
    game.load.image('nails', './assets/nails.png');
    game.load.image('background', './assets/background.png');
    game.load.image('beer', './assets/beer.png');
    game.load.spritesheet('conveyorRight', './assets/conveyor_right.png', 96, 16);
    game.load.spritesheet('conveyorLeft', './assets/conveyor_left.png', 96, 16);
    game.load.spritesheet('trampoline', './assets/trampoline.png', 96, 22);
    game.load.spritesheet('fake', './assets/fake.png', 96, 36);

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
    createLifeBoard();
    createBeerBoard();
}

// update在遊戲進行中，會不斷的執行
function update () {
    // 當ENTER被按下
    if(status == 'gameOver' && keyboard.enter.isDown) restart();
    // if(status != 'running') return;

    // game.physics.arcade.collide(A, B) 會判斷 A,B 是否碰撞。接受陣列做為參數，以下程式會檢查玩家是否與左牆或右牆碰撞
    this.physics.arcade.collide([player1, player2], platforms, effect);
    // https://www.html5gamedevs.com/topic/28876-collision-make-sprites-immovable-and-impassable/
    this.physics.arcade.collide([player1, player2], [leftWall, rightWall, leftWall2, rightWall2]);
    this.physics.arcade.collide(player1, player2);
    checkTouchCeiling(player1);
    checkTouchCeiling(player2);
    updateLifeBoard();
    checkGameOver();

    updatePlayer();
    updatePlatforms();

    createPlatforms();
    // this.physics.arcade.collide(beer, platforms);
    this.physics.arcade.collide(beers, platforms);
    // 重疊判斷
    this.physics.arcade.overlap([player1, player2], beers, collectBeer);
    updateBeers();
    background.bringToTop();
    beerscoreicon.bringToTop();
    beertext.bringToTop();
    life1.bringToTop();
    life2.bringToTop();
}

function createBounders () {
    // 頂部尖刺，遊戲左上角點 26, 70.3
    ceiling = game.add.image(26, 70.3, 'ceiling');

    // sprite為遊戲物件 game.add.sprite(x, y, 'image_name')
    leftWall = game.add.sprite(26, -50, 'wall');
    // game.physics.arcade.enable(物件) 掛載物理引擎，使物體具有移動、碰撞等狀態
    game.physics.arcade.enable(leftWall);
    // 固定物件
    leftWall.body.immovable = true;

    leftWall2 = game.add.sprite(26, 349, 'wall');
    game.physics.arcade.enable(leftWall2);
    leftWall2.body.immovable = true;

    rightWall = game.add.sprite(409, -50, 'wall');
    game.physics.arcade.enable(rightWall);
    rightWall.body.immovable = true;

    rightWall2 = game.add.sprite(409, 349, 'wall');
    game.physics.arcade.enable(rightWall2);
    rightWall2.body.immovable = true;

    background = game.add.image(0, 0, 'background');
}

function createPlatforms () {
    // game.time.now 可以取得遊戲開始到現在的時間
    if (status == 'start' || game.time.now == starttime)  {
        initialPlatform(200);
        initialPlatform(250);
        initialPlatform(300);
        initialPlatform(350);
        initialPlatform(400);
        initialPlatform(450);
        // initialPlatformtest(0, 500);
        // initialPlatformtest(100, 500);
        // initialPlatformtest(200, 500);
        // initialPlatformtest(300, 500);
        // initialPlatformtest(400, 500);
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
    var beer;
    var x = Math.random()*(400 - 96 - 40) + 46;  // x+26
    var beerdisplay = Math.random();
    var beerhorizontal = x + Math.random() * 80;
    platform = game.add.sprite(x, y, 'normal');
    game.physics.arcade.enable(platform);
    platform.body.immovable = true;
    platforms.push(platform);
    if (beerdisplay > 0.5) {
        beer = game.add.sprite(beerhorizontal , y-50, 'beer');
        game.physics.arcade.enable(beer);
        beers.push(beer);
    }
}

function initialPlatformtest (x, y) {
    var platform;
    platform = game.add.sprite(x ,y, 'normal');
    game.physics.arcade.enable(platform);
    platform.body.immovable = true;
    platforms.push(platform);
}

function createOnePlatform () {

    var platform;
    var beer;
    // 執行 Math.random() 會產生0~1的隨機數字
    var x = Math.random()*(400 - 96 - 40) + 46; // x+26
    var y = 470.3; // y+20.3
    var rand = Math.random() * 100;
    var beerdisplay = Math.random();
    var beerhorizontal = x + Math.random() * 80;
    if (status == 'running') {
        if(rand < 20) {
            platform = game.add.sprite(x, y, 'normal');
            if (beerdisplay > 0.95) {
                beer = game.add.sprite(beerhorizontal , y-50, 'beer');
                // 放大酒杯
                beer.scale.set(2, 2);
            } else if (beerdisplay > 0.7) {
                beer = game.add.sprite(beerhorizontal , y-50, 'beer');
            }
        } else if (rand < 40) {
            platform = game.add.sprite(x, y, 'nails');
            game.physics.arcade.enable(platform);
            // 修改圖片碰撞的邊界，sprite.body.setSize(長, 寬, x座標, y座標)
            platform.body.setSize(96, 15, 0, 15);
            if (beerdisplay > 0.5) {
                beer = game.add.sprite(beerhorizontal , y-50, 'beer');
            }
        } else if (rand < 50) {
            platform = game.add.sprite(x, y, 'conveyorLeft');
            // 幫角色增加動畫，Sprite.animations.add(動畫名字, 影格, 每秒幀數, 持續播放動畫)
            platform.animations.add('scroll', [0, 1, 2, 3], 16, true);
            // 播放動畫 Sprite.play(動畫名字)
            platform.play('scroll');
            // beer = game.add.sprite(x, y-50, 'beer');
        } else if (rand < 60) {
            platform = game.add.sprite(x, y, 'conveyorRight');
            platform.animations.add('scroll', [0, 1, 2, 3], 16, true);
            platform.play('scroll');
            // beer = game.add.sprite(x, y-50, 'beer');
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
    
        if (beer) {
            game.physics.arcade.enable(beer);
            beers.push(beer);
        }
        platform.body.checkCollision.down = false;
        platform.body.checkCollision.left = false;
        platform.body.checkCollision.right = false;
    }
    //取消左邊、右邊、下邊的碰撞。增加以下語法接到創造 platform 程式後面，角色彈跳時就不會撞到上面的平台
}

function createPlayer () {
    // sprite為遊戲物件 game.add.sprite(x, y, 'image_name')
    player1 = game.add.sprite(326, 120.3, 'player1');
    player2 = game.add.sprite(126, 120.3, 'player2');
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

function createLifeBoard () {
    // loadFont("serife", "./assets/fonts/serife.fon");
    var style = {fill: '#FFFFFF', fontSize: '20px'} // font: "32px Arial"
    // 創造文字物件，game.add.text(x座標, y座標, 文字內容);
    text1 = game.add.text(160, 240.3, 'Enter 重新開始', style);
    text1.visible = false;

    life1 = game.add.sprite(310, 39, 'life');
    life1.frame = 12;
    life2 = game.add.sprite(20, 39, 'life');
    life2.frame = 12;
}

function createBeerBoard () {
    // 啤酒計分板
    beerscoreicon = game.add.image(190, 19, 'beer');
    beerscoreicon.scale.setTo(1.5, 1.5);
    beerscore = 0;
    beertext = game.add.text(225, 25, 'X 0', {fontSize: '24px', fill: '#FF0000'});

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
        if(platform.body.position.y <= 50.3) { // x + 20.3
            // 銷毀 platform 物件
            platform.destroy();
            // 從陣列移除第 i 個平台
            platforms.splice(i, 1);
        }
    }
}

function updateBeers () {
    for(var i=0; i<beers.length; i++) {
        var beer = beers[i];
        if(beer.body.position.y <= 50.3) { // x + 20.3
            beer.kill();
        }
    }
}

function updateLifeBoard () {
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

function collectBeer(player, beer) {
    beer.kill();
    if(beer.scale.x == 2){
        beerscore += 2;
    } else{
        beerscore += 1;
    }
    beertext.text = 'X ' + beerscore;
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
    if (player.touchOn !== platform) {
        if(player.life < 10) {
            player.life += 1;
        }
        player.touchOn = platform;
    }
}

function conveyorLeftEffect(player, platform) {
    player.body.x -= 2;
    if (player.touchOn !== platform) {
        if(player.life < 10) {
            player.life += 1;
        }
        player.touchOn = platform;
    }
}

function trampolineEffect(player, platform) {
    // 播放動畫 Sprite.play(動畫名字)
    platform.animations.play('jump');
    // 設定速度，每秒垂直移動
    player.body.velocity.y = -350;
    if (player.touchOn !== platform) {
        if(player.life < 10) {
            player.life += 1;
        }
        player.touchOn = platform;
    }

}

function nailsEffect(player, platform) {
    // touchOn 紀錄碰撞的物體
    if (player.touchOn !== platform && status == 'running') {
        // 扣生命
        player.life -= 2;
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
        if(game.time.now > player.unbeatableTime && status == 'running') {
            player.life -= 2;
            // 背景閃爍，game.camera.flash(顏色色碼, 時間)
            game.camera.flash(0xff0000, 100);
            // unbeatableTime 角色無敵狀態的時間
            player.unbeatableTime = game.time.now + 2000;
        }
    }
}

function checkGameOver () {
    if(player1.life <= 0 || player1.body.y > 570.3) { // x+20.3
        life1.frame = 0;
        player1.visible = false;
        player2.visible = false;
        gameOver('player2');
    }
    if(player2.life <= 0 || player2.body.y > 570.3) { // x+20.3
        life2.frame = 0;
        player1.visible = false;
        player2.visible = false;
        gameOver('player1');
    }
}

function gameOver(winner) {
    text1.visible = true;
    text1.setText('勝利者 ' + winner + '\nEnter 重新開始');
    // destroy 銷毀 platform 物件
    platforms.forEach(function(s) {s.destroy()});
    platforms = [];
    // GAME OVER時刪除BEER
    beers.forEach(function(s) {s.destroy()});
    beers = [];
    status = 'gameOver';
    endtime = game.time.now;
}

function restart () {
    text1.visible = false;
    distance = 0;
    createPlayer();
    status = 'running';
    starttime = game.time.now;
    beerscore = 0;
    beertext.text = 'X ' + beerscore;
}
