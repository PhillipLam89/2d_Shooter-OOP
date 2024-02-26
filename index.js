

  //canvas setup
  const canvas = document.getElementById('canvas1')
  const ctx = canvas.getContext('2d')

  canvas.width = 500
  canvas.height = 500

  class InputHandler {
      constructor(game) {
        this.game = game;
        window.onkeydown = (e) => {
    
          const specialKeys= 'ArrowUp|ArrowDown|w|s|'
          if ((specialKeys.includes(e.key)) 
              && !this.game.keys.includes(e.key)) {
                   this.game.keys.push(e.key)
          } else if (e.key == ' ') {
            this.game.player.shootTop()
          }
        

        }
        window.onkeyup = (e) => {
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
      this.speed = 1.5
      this.markedForDeletion = false
    }
    update() {
      this.x+= this.speed
      //the below will remove all projectiles once theyre past 80% of the screen, also prevents enemies being killed off screen
      if (this.x >= this.game.width * 0.65) this.markedForDeletion = true
    }
    draw(context) {
      context.fillStyle = 'yellow'
      context.fillRect(this.x,this.y,this.width,this.height)
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
      this.speedY = 0 //since our game is moving horizontally
      this.maxSpeed = 3
      this.projectiles = []
    
    }
    update() {
  
      if (this.game.keys.includes('ArrowUp')||this.game.keys.includes('w')) {
          const isAtTop = this.y <= 0
          this.speedY = isAtTop ? 0 : this.maxSpeed * -1
      }
      else if (this.game.keys.includes('ArrowDown')||this.game.keys.includes('s')) {
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
    }
    draw(context) { //better to pass in our ctx as an argument
      context.fillStyle = 'black'
      context.fillRect(this.x, this.y, this.width, this.height)
      this.projectiles.forEach(projectile => {
        projectile.draw(context)
    })      
    }
    shootTop() {
      if (this.game.ammo > 0)  {
          this.projectiles.push(new Projectile(this.game, this.x , this.y ))
          this.game.ammo--
      }
      
   
    }
  }
  class Enemy {
      constructor(game) {
        this.game = game
        this.x = this.game.width
        this.speedX = Math.random() * -1.5 - 0.5
        this.markedForDeletion = false
        this.lives = 5
        this.score = this.lives
      }
      update() {
        this.x+= this.speedX
        if (this.x + this.width < 0) this.markedForDeletion = true
      }
      draw(context) {
          context.fillStyle = 'red'
          context.fillRect(this.x ,this.y, this.width, this.height)
          context.fillStyle = 'black'
          context.font =  '20px Helvetica'
          context.fillText(this.lives, this.x + (this.width * .4) , this.y  )

      }
  }

class Angler1 extends Enemy { //Angler1 is a child of Enemy, all methods that cannot be find on Angler1 will look at Enemy's props/methods
  constructor(game) { //if constructor is not declared here, all new Angler1's will run Enemy's (aka parent's) constructor instead!
    super(game) // calling super here will make sure the Parent Class aka Enemy's constructor will run FIRST, THEN the Angler1 constructor runs
    this.width = 228 * .2
    this.height = 169 * .2
    this.y = Math.random() * (this.game.height * 0.90 - this.height)
  }
}

  class Layer {

  }
  class Background { //pools Layer classes

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
      context.font = this.fontSize + 'px ' + this.fontFamily

      //display score
      context.fillText('Score: ' + this.game.score, 20, 70)
      //ammo
      // new Array(this.game.ammo).fill('').forEach((ammo,i) => {
      //   context.fillStyle = 'tomato'
      //   context.fillRect(20 + 10 * i,10,3,20)
      // })
      for (let i = 0; i < this.game.ammo   ; i++) {
        context.fillStyle = 'navy'
        context.fillRect(20 + 10 * i,10,3,20)
      }
      context.restore()
    }
  }
  class Game {
    constructor(width,height) { //takes in global canvas width / height
      this.width = width
      this.height = height
      this.player = new Player(this) //a new instance of player will be created EVERY time a game instance is created!
      // passing 'this' will pass the whole Game object, now Player instances will have access to Game object
      this.input = new InputHandler(this)
      this.ui = new UI(this)
      this.keys = []
      this.enemies = []
      this.enemyTimer = 0
      this.enemyInterval = 1000
      this.ammo = 20
      this.maxAmmo = 20      
      this.ammoTimer = 0
      this.score = 0
      this.winningScore = 50
      this.ammoInterval = 500
      this.gameOver = false
    }
    update(deltaTime) {

      this.player.update() //if game object calls update, then player object ALSO calls its update
      if (this.ammoTimer > this.ammoInterval) {
           if (this.ammo < this.maxAmmo) this.ammo++
           this.ammoTimer = 0
      } else {
          this.ammoTimer+= deltaTime
      }
      this.enemies.forEach(enemy => {
        enemy.update()
        if (this.checkCollision(this.player, enemy)) {
            enemy.markedForDeletion = true
        }
        this.player.projectiles.forEach(projectile => {
          if (this.checkCollision(projectile, enemy)) {
              //marking for deletion will make removing easier
              projectile.markedForDeletion = true
              enemy.lives--
              
            
              if (enemy.lives <= 0) {
                enemy.markedForDeletion = true
                this.score+= enemy.score
                if (this.score > this.winningScore) this.gameOver = true
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
      this.player.draw(context) //note game.draw() will just call player.draw() passing in curent canvas we wanan draw on
      this.ui.draw(context)
      this.enemies.forEach(enemy => {
        enemy.draw(context)
      })
    }
    addEnemy() {
      this.enemies.push(new Angler1(this)) //passing 'this' aka game obj since Angler class expects a game argument
    }  
    checkCollision(rect1,rect2) {
      return (
         rect1.x < rect2.x + rect2.width &&
         rect1.x + rect1.width > rect2.x  &&
         rect1.y < rect2.y + rect2.height &&
         rect1.height + rect1.y > rect2.y
      )
    }
  }
  // the code below will instantiate a new game AND player on document load.
  const game = new Game(canvas.width, canvas.height)
  let lastTime = 0
  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime    
    lastTime = timeStamp
    ctx.clearRect(0,0,canvas.width,canvas.height)
    game.update(deltaTime) //note this ALSO calls game.player.draw()
    game.draw(ctx)
    // if (game.player.y + game.player.height >= canvas.height) return
    requestAnimationFrame(animate)
  }
  animate(0)

