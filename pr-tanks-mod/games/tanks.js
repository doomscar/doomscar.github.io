
CreateBrick = function (index, BrickInfo){
    this.BrickInfo = BrickInfo;
    this.health = 3;
    this.alive = true;
    var brickX = (c*(this.BrickInfo.width+this.BrickInfo.padding))+this.BrickInfo.offset.left;
    var brickY = (r*(this.BrickInfo.height+this.BrickInfo.padding))+this.BrickInfo.offset.top;
    this.newBrick = game.add.sprite(brickX, brickY, 'brick');
    this.newBrick.name = index.toString();
    game.physics.enable(this.newBrick, Phaser.Physics.ARCADE);
    this.newBrick.body.immovable = true;
    this.newBrick.anchor.set(0.5);
}

CreateBrick.prototype.damage = function() { // поврежения врага

    this.health -= 1;

    if (this.health <= 0)
    {
        this.alive = false;
        return true;
    }

    return false;

}

EnemyTank = function (index, game, player, bullets) {

    var x = game.world.randomX;
    var y = -900;

    this.game = game;
    this.health = 3;
    this.player = player;
    this.bullets = bullets;
    this.fireRate = 1000;
    this.nextFire = 0;
    this.alive = true;

    this.shadow = game.add.sprite(x, y, 'enemy', 'shadow');
    this.tank = game.add.sprite(x, y, 'enemy', 'tank1');
    this.turret = game.add.sprite(x, y, 'enemy', 'turret');

    this.shadow.anchor.set(0.5);
    this.tank.anchor.set(0.5);
    this.turret.anchor.set(0.3, 0.5);

    this.tank.name = index.toString();
    game.physics.enable(this.tank, Phaser.Physics.ARCADE);
    this.tank.body.immovable = false;
    this.tank.body.collideWorldBounds = true;
    this.tank.body.bounce.setTo(1, 1);

    this.tank.angle = game.rnd.angle();

    game.physics.arcade.velocityFromRotation(this.tank.rotation, 100, this.tank.body.velocity);

};

EnemyTank.prototype.damage = function() { // поврежения врага

    this.health -= 1;

    if (this.health <= 0)
    {
        this.alive = false;

        this.shadow.kill();
        this.tank.kill();
        this.turret.kill();

        return true;
    }

    return false;

}

EnemyTank.prototype.update = function() {

    this.shadow.x = this.tank.x;
    this.shadow.y = this.tank.y;
    this.shadow.rotation = this.tank.rotation;

    this.turret.x = this.tank.x;
    this.turret.y = this.tank.y;
    this.turret.rotation = this.game.physics.arcade.angleBetween(this.tank, this.player); // поворот вражеской турели в сторону игрока
    //this.tank.rotation = this.game.physics.arcade.angleBetween(this.tank, this.player);

    if (this.game.physics.arcade.distanceBetween(this.tank, this.player) < 300)
    {
        if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0)
        {
            this.nextFire = this.game.time.now + this.fireRate;

            var bullet = this.bullets.getFirstDead();

            bullet.reset(this.turret.x, this.turret.y);

            bullet.rotation = this.game.physics.arcade.moveToObject(bullet, this.player, 500); // поворот снаряда в сторону игрока
        }
    }

};

var game = new Phaser.Game(900, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload () {

    game.load.atlas('tank', 'assets/games/tanks/tanks.png', 'assets/games/tanks/tanks.json');
    game.load.atlas('enemy', 'assets/games/tanks/enemy-tanks.png', 'assets/games/tanks/tanks.json');
    game.load.image('logo', 'assets/games/tanks/logo.png');
    game.load.image('bullet', 'assets/games/tanks/bullet.png');
    game.load.image('earth', 'assets/games/tanks/scorched_earth.png');
    game.load.image('brick', 'assets/games/tanks/brick.png');
    game.load.spritesheet('kaboom', 'assets/games/tanks/explosion.png', 64, 64, 23);
    
}

var land;


var lives = 10;
var shadow;
var tank;
var turret;

var leftGo = false;
var rightGo = false;
var upGo = false;
var downGo = false;

var enemies;
var enemyBullets;
var enemiesTotal = 0;
var enemiesAlive = 0;
var explosions;

var logo;

var currentSpeed = 0;
var cursors;

var leftKey;
var rightKey;
var upKey;
var downKey;

var bullets;
var fireRate = 150;
var nextFire = 0;

var bricks;
var newBrick;
var brickInfo;

function create () {

    //  Resize our game world to be a 2000 x 2000 square
    //game.world.setBounds(0, 0, 900, 600);

    //  Our tiled scrolling background
    land = game.add.tileSprite(0, 0, 900, 700, 'earth');
    land.fixedToCamera = true;

    initBricks();

    //  The base of our tank
    tank = game.add.sprite(700, 550, 'tank', 'tank1');
    tank.anchor.setTo(0.5, 0.5);
    tank.animations.add('move', ['tank1', 'tank2', 'tank3', 'tank4', 'tank5', 'tank6'], 20, true);

    //  This will force it to decelerate and limit its speed
    game.physics.enable(tank, Phaser.Physics.ARCADE);
    tank.body.drag.set(0.2);
    tank.body.maxVelocity.setTo(400, 400);
    tank.body.collideWorldBounds = true;

    //  Finally the turret that we place on-top of the tank body
    turret = game.add.sprite(0, 0, 'tank', 'turret');
    turret.anchor.setTo(0.3, 0.5);

    //  The enemies bullet group
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(100, 'bullet');
    
    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 0.5);
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);

    //  Create some baddies to waste :)
    enemies = [];

    enemiesTotal = 20;
    enemiesAlive = 20;

    for (var i = 0; i < enemiesTotal; i++)
    {
        enemies.push(new EnemyTank(i, game, tank, enemyBullets));
    }

    //  A shadow below our tank
    shadow = game.add.sprite(0, 0, 'tank', 'shadow');
    shadow.anchor.setTo(0.5, 0.5);

    //  Our bullet group
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet', 0, false);
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    //  Explosion pool
    explosions = game.add.group();

    for (var i = 0; i < 10; i++)
    {
        var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
        explosionAnimation.anchor.setTo(0.5, 0.5);
        explosionAnimation.animations.add('kaboom');
    }

    tank.bringToTop();
    turret.bringToTop();

    logo = game.add.sprite(50, 200, 'logo');
    logo.fixedToCamera = true;

    game.input.onDown.add(removeLogo, this);

    game.camera.follow(tank);
    game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
    game.camera.focusOnXY(0, 0);

    //cursors = game.input.keyboard.createCursorKeys();
    leftKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
	rightKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
    upKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
    downKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
    spaceb = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    //cursors = game.input.keyboard.keys;

    //tank.events.onOutOfBounds.add(LeaveScreen, this);

    /**************************************************************** pause menu */

    game.input.keyboard.removeKeyCapture(Phaser.Keyboard.A);
    game.input.keyboard.removeKeyCapture(Phaser.Keyboard.D);
    game.input.keyboard.removeKeyCapture(Phaser.Keyboard.S);
    game.input.keyboard.removeKeyCapture(Phaser.Keyboard.W);
    game.input.keyboard.removeKeyCapture(Phaser.Keyboard.SPACEBAR);


    pause_label = game.add.text(810, 20, "Pause", { font: '24px Arial', fill: '#fff' });
    pause_label.inputEnabled = true;
    pause_label.events.onInputUp.add(function () {
        // When the paus button is pressed, we pause the game
        pause_label.setText("Start");
        game.paused = true;
    });

    // Add a input listener that can help us return from being paused
    game.input.onDown.add(unpause, self);

    // And finally the method that handels the pause menu
    function unpause(event){
        // Only act if paused
        if(game.paused){
                 game.paused = false;
                 pause_label.setText("Pause");
        }
    };

    /**************************************************************************** */

}

function removeLogo () {

    game.input.onDown.remove(removeLogo, this);
    logo.kill();

}

function update () {

    game.physics.arcade.overlap(enemyBullets, tank, bulletHitPlayer, null, this);

    enemiesAlive = 0;

    for (var i = 0; i < enemies.length; i++)
    {
        if (enemies[i].alive)
        {
            enemiesAlive++;
            game.physics.arcade.collide(tank, enemies[i].tank);
            for (var j = 0; j < bricks.length; j++){
                if (bricks[j].alive)
                {
                    game.physics.arcade.collide(bricks[j].newBrick, enemies[i].tank);
                }
            }
            //game.physics.arcade.collide(bricks[i], enemies[i].tank);
            //game.physics.arcade.collide(enemyBullets, bricks, enemyBulHitBrick); BulletHitBrick
            game.physics.arcade.overlap(bullets, enemies[i].tank, bulletHitEnemy, null, this);
            enemies[i].update();
        }
    }

    if(enemiesAlive == 0){
        setTimeout(() => {alert("You win!"); location.reload();}, 3000);
    }

    for (var i = 0; i < bricks.length; i++){
        if (bricks[i].alive)
        {
            //game.physics.arcade.collide(enemyBullets, bricks[i]);
            game.physics.arcade.overlap(bullets, bricks[i].newBrick, BulletHitBrick, null, this);
            game.physics.arcade.overlap(enemyBullets, bricks[i].newBrick, BulletHitBrick, null, this);
        }
        game.physics.arcade.collide(bricks[i].newBrick, tank);
    }

    //game.physics.arcade.overlap(enemyBullets, this.player, LeaveScreen, null, this);
    //game.physics.arcade.collide(bricks[i], tank);
    //game.physics.arcade.collide(bullets, bricks, enemyBulHitBrick);
    game.physics.arcade.collide(bullets, bricks);
    if (leftKey.isDown || leftGo)
    {
        tank.angle = 180;
        currentSpeed = 300;
    }

    else if (rightKey.isDown || rightGo)
    {
        tank.angle = 0;
        currentSpeed = 300;
    }

    else if (upKey.isDown || upGo)
    {
        //  The speed we'll travel at
        tank.angle = 270;
        currentSpeed = 300;
    }
    
    else if (downKey.isDown || downGo)
    {
        //  The speed we'll travel at
        tank.angle = 90;
        currentSpeed = 300;
    }

    else
    {
        if (currentSpeed > 0)
        {
            currentSpeed = 1;
        }
    }

    if (currentSpeed > 0)
    {
        game.physics.arcade.velocityFromRotation(tank.rotation, currentSpeed, tank.body.velocity);
    }

    land.tilePosition.x = -game.camera.x;
    land.tilePosition.y = -game.camera.y;

    //  Position all the parts and align rotations
    shadow.x = tank.x;
    shadow.y = tank.y;
    shadow.rotation = tank.rotation;

    turret.x = tank.x;
    turret.y = tank.y;

    //turret.rotation = game.physics.arcade.angleToPointer(turret);
    turret.angle = tank.angle;

    if (spaceb.isDown)
    {
        //  Boom!
        if(lives > 0){
            fire();
        }
    }

}

function bulletHitPlayer (tank, bullet) {

    bullet.kill();
    lives--;
    if(lives <= 0) {
        let explosionAnimation = explosions.getFirstExists(false);
        explosionAnimation.reset(tank.x, tank.y);
        explosionAnimation.play('kaboom', 30, false, true);
        shadow.kill();
        tank.kill();
        turret.kill();
        setTimeout(ReloadLocAlert, 3000);
    }

}

function ReloadLocAlert () {
    alert('You lost, game over!');
    location.reload();
}

function bulletHitEnemy (tank, bullet) {

    bullet.kill();

    var destroyed = enemies[tank.name].damage();

    if (destroyed)
    {
        var explosionAnimation = explosions.getFirstExists(false);
        explosionAnimation.reset(tank.x, tank.y);
        explosionAnimation.play('kaboom', 30, false, true);
    }

}

function fire () {

    if (game.time.now > nextFire && bullets.countDead() > 0)
    {
        nextFire = game.time.now + fireRate;

        var bullet = bullets.getFirstExists(false);

        bullet.reset(turret.x, turret.y);

        //bullet.rotation = game.physics.arcade.moveToPointer(bullet, 1000, game.input.activePointer, 500);
        if (game.input.activePointer){
            //bullet.rotation = game.physics.arcade.moveToXY(bullet, 0, 0, 1000, 500);
            bullet.angle = turret.angle;
            if (bullet.angle == -180)
            {
                bullet.body.velocity.set(-1000, 0);
            }

            if (bullet.angle == 0)
            {
                bullet.body.velocity.set(1000, 0);
            }

            if (bullet.angle == 90)
            {
                bullet.body.velocity.set(0, 1000);
            }
            
            if (bullet.angle == -90)
            {
                bullet.body.velocity.set(0, -1000);
            }
        }
    }

}

function render () {

    // game.debug.text('Active Bullets: ' + bullets.countLiving() + ' / ' + bullets.length, 32, 32);
    game.debug.text('Enemies: ' + enemiesAlive + ' / ' + enemiesTotal + '; ' + 'Lives: ' + lives, 32, 32);

}

function initBricks() {
    brickInfo = {
        width: 64,
        height: 64,
        count: {
            row: 3,
            col: 14
        },
        offset: {
            top: 200,
            left: 35
        },
        padding: 0
    };
    var s = 0;
    //bricks = game.add.group();
    bricks = [];
    for(c=0; c<brickInfo.count.col; c++) {
        for(r=0; r<brickInfo.count.row; r++) {
            bricks.push(new CreateBrick(s, brickInfo));
            s++;
        }
    }
  }

  function BulletHitBrick(brick, bullet) {
    //brick.kill();
    bullet.kill();
    var destro = bricks[brick.name].damage();

    if (destro)
    {
        var killTween = game.add.tween(bricks[brick.name].newBrick.scale);
        killTween.to({x:0,y:0}, 200, Phaser.Easing.Linear.None);
        killTween.onComplete.addOnce(function(){
            bricks[brick.name].newBrick.kill();
        }, this);
        killTween.start();
        //game.add.tween(bricks[brick.name].newBrick.scale).to({x:2,y:2}, 500, Phaser.Easing.Elastic.Out, true, 100);       
    }
  }