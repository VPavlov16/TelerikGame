
var game = new Phaser.Game(1200, 1000, Phaser.AUTO, 'game-canvas', { preload, create, update })

function preload() {

    game.load.image('bullet', 'assets/bullet.png');
    game.load.image('enemyBullet', 'assets/bullet2.png');
    game.load.image('enemy', 'assets/enemy2.png');
    game.load.image('ship', 'assets/samolet.png');
    game.load.spritesheet('boom', 'assets/boom.png ', 128, 128);
    game.load.image('bg', 'assets/background.png');
    game.load.image('jivotcheta',"assets/mcheart.png")
    game.load.audio('pShoot', "assets/playerShoot.mp3")
    game.load.audio('eShoot', "assets/enemyShoot.mp3")
    game.load.audio('winSound',"assets/bonus.mp3")

}
//player
var player,jivoti;
//enemy
var enemy,livingEnemies = [];
//bullets
var bullets,bulletTime = 0,fireButton,explosions,enemyBullet,firingTimer = 0;
//other
var bonus
var keys;
var speed =3;
var background;
//sound
var endSound
var pSound
var eSound
//score
var score = 0,scoreString = '',scoreText,stateText;

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    background = game.add.tileSprite(0, 0, 1200, 1000, 'bg');
    pSound = game.add.audio('pShoot')
    eSound = game.add.audio('eShoot')
    endSound = game.add.audio('winSound')

    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet');      
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(30, 'enemyBullet');
    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 1);
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);

    player = game.add.sprite(600, 800, 'ship');
    player.scale.setTo(0.3)
    player.anchor.setTo(0.5, 0.5);
    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.body.collideWorldBounds = true;

    enemy = game.add.group();
    enemy.enableBody = true;
    enemy.scale.setTo(2.5)
    enemy.physicsBodyType = Phaser.Physics.ARCADE;

    createEnemies();

    keys = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    //  score
    scoreString = 'Score : ';
    scoreText = game.add.text(10, 10, scoreString + score, { font: '34px Arial', fill: '#fff' });

    //  jivoti
    jivoti = game.add.group();
    game.add.text(game.world.width - 100, 10, 'Lives : ', { font: '34px Arial', fill: '#fff' });

    //  text
    stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '84px Arial', fill: '#fff' });
    stateText.anchor.setTo(0.5, 0.5);
    stateText.visible = false;

    for (var i = 0; i < 3; i++){
        var ship = jivoti.create(game.world.width - 100 + (40 * i), 60, 'jivotcheta');
        ship.anchor.setTo(0.5, 0.5);
        ship.alpha = 0.4;
    }

    //  boom
    explosions = game.add.group();
    explosions.createMultiple(30, 'boom');
    explosions.forEach(setupEnemies, this);
    
}

function createEnemies () {

    for (var y = 0; y < 4; y++){
        for (var x = 0; x < 9; x++){
            var enemies = enemy.create(x * 45, y * 35, 'enemy');
            enemies.anchor.setTo(0.5, 0.5);
            enemies.body.moves = false;
        }
    }

    enemy.x = 100;
    enemy.y = 100;

    //tween
    var tween = game.add.tween(enemy).to( { x: 230 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
    tween.onLoop.add(descend, this);
}

function setupEnemies (amogus) {

    amogus.anchor.x = 0.5;
    amogus.anchor.y = 0.5;
    amogus.animations.add('boom');

}

function descend() {
    enemy.y += 10;
}

function update() {
    background.tilePosition.y += 2;

    if (player.alive){
        player.body.velocity.setTo(0, 0);

        if(keys.right.isDown){
            player.x += speed;
        } 
        if(keys.left.isDown){
            player.x -= speed;
        }
         if(keys.up.isDown){
            player.y -= speed;
        }
         if(keys.down.isDown){
            player.y += speed*1.5;
        }
        if (fireButton.isDown){
            fire();
            //count++
            //pSound.play();
        }
        if (game.time.now > firingTimer){
            enemyFires();
            //eSound.play();
        }
        game.physics.arcade.overlap(bullets, enemy, collisionHandler, null, this);
        game.physics.arcade.overlap(enemyBullets, player, enemyHitsPlayer, null, this);
    }

}
function collisionHandler (bullet, enemies) {
    bullet.kill();
    enemies.kill();

    // rezultat
    score += 15;
    scoreText.text = scoreString + score;

    //  boom
    var explosion = explosions.getFirstExists(false);
    explosion.reset(enemies.body.x, enemies.body.y);
    explosion.play('boom', 30, false, true);

    if (enemy.countLiving() == 0){
        score += 1000;
        scoreText.text = scoreString + score;
        enemyBullets.callAll('kill',this);
        stateText.text = " YOU WON \n Click to restart";
        stateText.visible = true;
        endSound.play();
        game.input.onTap.addOnce(rst,this);
    }

}

function enemyHitsPlayer (player,bullet) {
    bullet.kill();
    jivot = jivoti.getFirstAlive();
    if (jivot){
        jivot.kill();
    }

    //  boom
    var explosion = explosions.getFirstExists(false);
    explosion.reset(player.body.x, player.body.y);
    explosion.play('boom', 30, false, true);

    if (jivoti.countLiving() < 1){
        player.kill();
        enemyBullets.callAll('kill');

        stateText.text=" GAME OVER \n Click to restart";
        stateText.visible = true;
        game.input.onTap.addOnce(rst,this);
    }

}

function enemyFires () {
    enemyBullet = enemyBullets.getFirstExists(false);
    livingEnemies.length=0;
    enemy.forEachAlive(function(enemies){
        livingEnemies.push(enemies);
    });

    if (enemyBullet && livingEnemies.length > 0){
        var random=game.rnd.integerInRange(0,livingEnemies.length-1);
        var shoot=livingEnemies[random];
        enemyBullet.reset(shoot.body.x, shoot.body.y);

        game.physics.arcade.moveToObject(enemyBullet,player,120);
        firingTimer = game.time.now + 2000;
        eSound.play();
    }
}

function fire () {
    if (game.time.now > bulletTime){
        bullet = bullets.getFirstExists(false);

        if (bullet){
            bullet.reset(player.x, player.y + 8);
            bullet.body.velocity.y = -400;
            bulletTime = game.time.now + 200;
            pSound.play();
        }
    }

}

function resBullet (bullet) {
    bullet.kill();
}

function rst () {
    jivoti.callAll('revive');
    enemy.removeAll();
    createEnemies();
    endSound.pause();
    player.revive();
    stateText.visible = false;
}