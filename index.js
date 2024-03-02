

  //canvas setup
  const canvas = document.getElementById('canvas1')
  const ctx = canvas.getContext('2d')

  canvas.width = 800
  canvas.height = 500

  class InputHandler {
      constructor(game) {
        this.game = game;
        window.onkeydown = (e) => {
    
          const specialKeys= 'ArrowUp|ArrowDown|w|s|WS'
          if ((specialKeys.includes(e.key)) 
              && !this.game.keys.includes(e.key)) {
                   this.game.keys.push(e.key)
          } else if (e.key == ' ') {
            this.game.player.isShootingBullets = true
            this.game.player.shootTop()
          } else if (e.key == 'z' || e.key == 'Z') {
            this.game.debug = !this.game.debug
          }
        

        }
        window.onkeyup = (e) => {
          if (e.key == ' ')this.game.player.isShootingBullets = false
          const keyFound = this.game.keys.indexOf(e.key) > -1
          keyFound && this.game.keys.splice(this.game.keys.indexOf(e.key),1)

     
        }
      }
  }
  class Projectile {
    constructor(game,x,y) {
      this.game = game
      this.x = x + this.game.player.width //so our projectile shoots from right side of player
      this.y = y
      this.width = 10
      this.height = 13
      this.speed = 3
      this.markedForDeletion = false
    }
    update() {
      this.x+= this.speed
      //the below will remove all projectiles once theyre past 80% of the screen, also prevents enemies being killed off screen
      if (this.x >= this.game.width - (228*0.2)) this.markedForDeletion = true
    }
    draw(context) {
      context.fillStyle = 'cyan'
      context.fillRect(this.x,this.y + 30,this.width,this.height)
    }
  }
  class Particle {

  }
  class Player {
    constructor(game) {
      this.game = game //passes in whole game obj
      this.width = 120
      this.height = 190 //use exact width/height dimensions on our player img
      this.x = 10
      this.y = 150 //starting x, y positions
      this.frameX = 0 //these frames help us to render only portions of the sprite sheet per requestAnimationFrame in order to simulate fluid movement
      this.frameY = 0
      this.maxFrame = 37 //this is how many animations in our sprite
      this.speedY = 0 //since our game is moving horizontally
      this.maxSpeed = 3
      this.projectiles = []
      this.image = document.getElementById('player')
      this.isPoweredUp = false
      this.powerUpTimer = 0
      this.powerUpLimit = 4399
      this.bgIsNormalSpeed = true
      this.isShootingBullets = false
    
    }
    update(deltaTime) {
  
      if (this.game.keys.includes('ArrowUp')||this.game.keys.includes('w') ||this.game.keys.includes('W')) {
          const isAtTop = this.y <= 0
          this.speedY = isAtTop ? 0 : this.maxSpeed * -1
      }
      else if (this.game.keys.includes('ArrowDown')||this.game.keys.includes('s') ||this.game.keys.includes('S')) {
                const isAtBottom = this.height + this.y >= canvas.height  //returns true if player bottom touches game floor, then we do not allow further downward movement        
                this.speedY = isAtBottom ? 0 : this.maxSpeed
      }
      else this.speedY = 0

      this.y+= this.speedY
      //handle projectiles here
      this.projectiles.forEach(projectile => {
          projectile.update()
      })

      this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion)
      // handle sprite animation


      if (this.frameX < this.maxFrame) this.frameX++
      else this.frameX = 0

      //handle power up

      if (this.isPoweredUp) {
        if(this.powerUpTimer >= this.powerUpLimit) {
          this.powerUpTimer = 0
          this.isPoweredUp = false
          this.game.backGround.layers.forEach(layer => layer.speedMod = layer.speedMod / 5)
          document.getElementById('player').src = './player.png'
          this.frameY = 0
          this.bgIsNormalSpeed = true
        } else {
          this.powerUpTimer+= deltaTime
          this.frameY = 1
          this.game.ammo+= 0.1 //extra ammo recharge speed during powerUp mode :D
        }
      } 
    }
      

    draw(context) { //better to pass in our ctx as an argument
      if (this.game.debug) {
        context.lineWidth = 2
        context.strokeRect(this.x, this.y, this.width, this.height)  
      }  
      this.projectiles.forEach(projectile => {
        projectile.draw(context)
    }) 

    if (this.isPoweredUp) {
        if (this.isShootingBullets) {       
          this.width = 175
          this.height = 213
          this.maxFrame = 5
          document.getElementById('player').src = './empoweredPlayer 2.png'
          context.drawImage(document.getElementById('player'), this.frameX * this.width, 0, this.width,this.height, this.x,this.y, this.width,this.height)
        } else {
          this.width =  117
          this.height = 213
          this.maxFrame = 7
          document.getElementById('player').src = './walkingSprite.png'
          context.drawImage(document.getElementById('player'), this.frameX * this.width, 0, this.width,this.height, this.x,this.y, this.width,this.height)
        }
    }else {
      this.width = 120
      this.height = 190  
      this.maxFrame = 37   
      context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x,this.y, this.width,this.height)
    }
      
    }
    shootTop() {
      if (this.game.ammo > 0 && !this.isPoweredUp)  {
          this.projectiles.push(new Projectile(this.game, this.x , this.y ))
          this.game.ammo--
      } else if (this.isPoweredUp) {
        this.projectiles.push(new Projectile(this.game, this.x , this.y + this.height * 0.3))
        this.shootBottom()
      }
      
   
    }
    shootBottom() {
      if (this.game.ammo > 0)  {
        this.projectiles.push(new Projectile(this.game, this.x , this.y + this.height * 0.5))
     
    }      
    }
    enterPowerUp() {
      if (this.bgIsNormalSpeed) {
        this.game.backGround.layers.forEach(layer => layer.speedMod = layer.speedMod * 5)
        this.bgIsNormalSpeed = false
      }
      this.powerUpTimer = 0
      this.isPoweredUp = true
      this.game.ammo = ~~(this.game.maxAmmo * 0.85)
    }
  }
  class Enemy {
      constructor(game) {
        this.game = game
        this.x = this.game.width
        this.speedX = Math.random() * - 0.34
        this.markedForDeletion = false

        this.frameX = 0
        this.frameY = 0
        this.maxFrame = 37

      }
      update() {
        this.x+= this.speedX - this.game.speed
        if (this.x + this.width < 0) {
          this.markedForDeletion = true
          this.game.score-=3
        }
        //sprite animation

      }
      draw(context) {
          if (this.game.debug) {
            context.strokeStyle = 'red'
            context.strokeRect(this.x ,this.y, this.width, this.height)
            context.font =  '20px Helvetica'
            context.fillStyle = 'goldenrod'
            context.fillText(this.lives, this.x + (this.width * .4) , this.y - 5)
          }
          if (this.frameX < this.maxFrame) {
            this.frameX++
          }else this.frameX = 0      
          context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width,this.height, this.x,this.y,this.width,this.height)


      }
  }

class Angler1 extends Enemy { //Angler1 is a child of Enemy, all methods that cannot be find on Angler1 will look at Enemy's props/methods
  constructor(game) { //if constructor is not declared here, all new Angler1's will run Enemy's (aka parent's) constructor instead!
    super(game) // calling super here will make sure the Parent Class aka Enemy's constructor will run FIRST, THEN the Angler1 constructor runs
    this.width = 228 
    this.height = 169 
    this.lives = 4
    this.score = this.lives
    this.y = Math.random() * (this.game.height  - this.game.player.height)
    this.image = document.getElementById('angler1')
    this.frameY = ~~(Math.random() * 3)
  }
}
class Angler2 extends Enemy { 
  constructor(game) { 
    super(game) 
    this.width = 213
    this.height = 165 
    this.lives = 7
    this.score = this.lives
    this.y = Math.random() * (this.game.height  - this.game.player.height)
    this.image = document.getElementById('angler2')
    this.frameY = ~~(Math.random() * 2)
  }
}
class LuckyFish extends Enemy {
  constructor(game) { 
    super(game) 
    this.width = 99
    this.height = 95 
    this.lives = 2
    this.score = this.lives * 5
    this.type = 'lucky'
    this.y = Math.random() * (this.game.height  - this.game.player.height)
    this.image = document.getElementById('lucky')
    this.frameY = ~~(Math.random() * 2)
  } 
}
class Layer { //sets up all 4 layer images 
  constructor(game, img, speedMod) {
    this.game = game
    this.image = img
    this.speedMod = speedMod
    this.width = 1765
    this.height = 500
    this.x = 0
    this.y = 0
  }

  update() {
    if (this.x <= this.width* -1 ) this.x = 0 
    this.x-= this.game.speed * this.speedMod
  }
  draw(context) {
    context.drawImage(this.image, this.x,this.y)
    context.drawImage(this.image, this.x + this.width,this.y)
  }

  }
class Background { //pools the 4 Layer imgs together
  constructor(game) {
    this.game = game
    this.images = [...document.querySelectorAll('.bgLayer')] //must convert to array so we can use map method below
    this.layers = this.images.map((img) => new Layer(this.game,img, .66))
    this.lastLayer = new Layer(this.game, document.querySelector('.bgLayer4'), .35)
    // this.image1 = document.querySelector('#layer1')
    // this.image2 = document.querySelector('#layer2')
    // this.image3 = document.querySelector('#layer3')
    // this.image4 = document.querySelector('#layer4')

    // this.layer1 = new Layer(this.game, this.image1, 2)
    // this.layer2 = new Layer(this.game, this.image2, 2)
    // this.layer3 = new Layer(this.game, this.image3, 2)
    // this.layer4 = new Layer(this.game, this.image4, 2)

    // this.layers = [this.layer1,this.layer2,this.layer3,this.layer4]
  }
  update() {
    this.layers.forEach(layer => layer.update())
  }
  draw(context) {
    this.layers.forEach(layer => layer.draw(context))
  }
  updateLastLayer() { //so the layer 4 appears IN-FRONT of our player but our player  appears IN FRONT of all other layers
    this.lastLayer.update()
  }
  drawLastLayer(ctx) {
    this.lastLayer.draw(ctx)
  }
}
class UI {
  constructor(game) {
    this.game = game
    this.fontSize = 25
    this.fontFamily = 'Helvetica'
    this.color = 'white'
  }
  draw(context) {
    context.save()
    context.fillStyle = this.color
    context.ShadowOffsetX = 2
    context.ShadowOffsetY = 2
    context.shadowColor = 'black'
    context.font = this.fontSize + 'px ' + this.fontFamily

    //display score
    context.fillStyle = this.game.score >= 0 ? 'chartreuse' : 'red'
    context.fillText('Score: ' + this.game.score, 20, 70)
    context.fillStyle = this.color
    //timer
    const formattedTime = ~~(this.game.gameTime * 0.001)
    context.fillText('Timer: ' + formattedTime + 's', 20, 100)
    // game over msgs 
    if (this.game.gameOver) {
      context.textAlign = 'center'
      let msg1
      let msg2
      if (this.game.score > 0 && this.game.score < 100) {
        msg1 = 'You win... but can do better'
        msg2 = 'keep practing'
      } else if (this.game.score >= 100 && this.game.score < 350) {
        msg1 = 'Damn youre actually pretty good!'
        msg2 = 'well done'
      } else if (this.game.score >= 350) {
        msg1 = 'HOLY CRAP'
        msg2 = 'nerd...'        
      }
      else {
        msg1 = 'You Lose!'
        msg2 = 'You Suck, Try Again!'
      }
      context.font = '50px ' + this.fontFamily
      context.fillText(msg1, this.game.width / 2, this.game.height * .5)
      context.font = '25px ' + this.fontFamily
      context.fillText(msg2, this.game.width / 2, this.game.height * .5 - 50)
    }
      //ammo

      for (let i = 0; i < this.game.ammo; i++) {
        context.fillStyle = 'aqua'
        context.fillRect(20 + 10 * i,10,3,20)
      }
    context.restore()
  }
}
class Game {
  constructor(width,height) { //takes in global canvas width / height
    this.width = width
    this.height = height
    this.backGround = new Background(this)
    this.player = new Player(this) //a new instance of player will be created EVERY time a game instance is created!
    // passing 'this' will pass the whole Game object, now Player instances will have access to Game object
    this.input = new InputHandler(this)
    this.ui = new UI(this)
    this.keys = []
    this.enemies = []
    this.enemyTimer = 0
    this.enemyInterval = 500
    this.ammo = 20
    this.maxAmmo = 30     
    this.ammoTimer = 0
    this.score = 0
    this.winningScore = 500
    this.ammoInterval = 410
    this.gameOver = false
    this.gameTime = 0
    this.timeLimit = 1000 * 60  //5s to test
    this.speed = 3.2
    this.debug = false
  }
  update(deltaTime) {
    if (!this.gameOver) this.gameTime+= deltaTime
    if (this.gameTime >= this.timeLimit) this.gameOver = true

    this.backGround.update()
    this.player.update(deltaTime) 
    this.backGround.updateLastLayer()
    //if game object calls update, then player object ALSO calls its update
    if (this.ammoTimer > this.ammoInterval) {
          if (this.ammo < this.maxAmmo) this.ammo++
          this.ammoTimer = 0
    } else {
        this.ammoTimer+= deltaTime
    }
    this.enemies.forEach(enemy => {
      enemy.update(deltaTime)
      if (this.checkCollision(this.player, enemy)) {
          enemy.markedForDeletion = true
          if (enemy.type == 'lucky') {
            
         
            this.score = this.score + 30
            this.player.enterPowerUp()
            const playerDiv = document.getElementById('player')
            playerDiv.src = './walkingSprite.png'


          }
          else this.score-=  enemy.lives*4
      }
      this.player.projectiles.forEach(projectile => {
        if (this.checkCollision(projectile, enemy)) {
            //marking for deletion will make removing easier
            projectile.markedForDeletion = true
            enemy.lives--
            
            if (enemy.type == 'lucky') this.score = this.score - 20
          
            if (enemy.lives <= 0) {
              enemy.markedForDeletion = true
              if(!this.gameOver)this.score+= enemy.score
              if (this.score >= this.winningScore) this.gameOver = true
            }
        }
      })       
    })  

  
    if (this.enemyTimer > this.enemyInterval && !this.gameOver) {
        this.addEnemy()
        this.enemyTimer = 0
    } else {
        this.enemyTimer += deltaTime
    }
    this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion) //removes ALL marked-for-delete enemies if they pass the collision check
  }
  draw(context) {
    this.backGround.draw(context) //background must be drawn first so it is in the BACK of the player
    this.player.draw(context) //note game.draw() will just call player.draw() passing in curent canvas we wanan draw on
    this.backGround.drawLastLayer(context)
    this.ui.draw(context)
    this.enemies.forEach(enemy => {
      enemy.draw(context)
    })
  }
  addEnemy() {
    const youGotLucky = Math.random() > .92
    const randomize = Math.random()

    this.enemies.push(
      youGotLucky ? new LuckyFish(this) : 
      randomize > 0.5 ? new Angler1(this) : new Angler2(this)
      // randomize < 0.3 ?
      //  new Angler1(this) : randomize < 0.8 ?
      //  new Angler2(this) : randomize  > 0.6 ? 
      //  new LuckyFish(this) :
      //  new Angler1(this )
       )
  }  
  checkCollision(rect1,rect2) {
    return ( //basic rectangle collision formula 
      rect1.x < rect2.x + rect2.width &&
      rect2.x < rect1.x + rect1.width &&
      rect1.y < rect2.y + rect2.height &&
      rect2.y < rect1.y + rect1.height
    )
  }
}
  // the code below will instantiate a new game AND player on document load.
  const game = new Game(canvas.width, canvas.height)
  let lastTime = 0

  let msPrev = window.performance.now()
  let fps = 60
  let msPerFrame = 1000 / fps


  function animate(timeStamp) {

    // if (game.player.y + game.player.height >= canvas.height) return
    window.requestAnimationFrame(animate)


// this code block below will force 60FPS (for slower computers)

    const msNow = window.performance.now()
    const msPassed = msNow - msPrev       


  
    if (msPassed < msPerFrame) return //this return statement will prevent requestAnimation from running more than 60FPS
  
    const excessTime = msPassed % msPerFrame
    msPrev = msNow - excessTime
 //---------------end of 60FPS enforcement------------------
    const deltaTime = timeStamp - lastTime  
    lastTime = timeStamp
    ctx.clearRect(0,0,canvas.width,canvas.height)
    game.update(deltaTime) //note this ALSO calls game.player.draw(), spawns projectiles on space-bar press, checks for collision between players/enemies and ALSO projectiles against all current enemies
    game.draw(ctx)

  }
  animate(0)

