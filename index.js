
window.onload = function() {
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
      this.x = x
      this.y = y
      this.width = 15
      this.height = 3
      this.speed = 3.
      this.markedForDeletion = false
    }
    update() {
      this.x+= this.speed
      //the below will remove all projectiles once theyre past 80% of the screen, also prevents enemies being killed off screen
      if (this.x > this.game.width * 0.8) this.markedForDeletion = true
    }
    draw(context) {
      context.fillStyle = Math.random() > 0.50 ? 'red' : 'blue'  //glowing purple effect
      context.fillRect(this.x + this.game.player.width,this.y,this.width  ,this.height*4)
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
      this.y = 10 //starting x, y positions
      this.speedY = 0 //since our game is moving horizontally
      this.maxSpeed = 3
      this.projectiles = []
    
    }
    update() {
      console.log(this)
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
      this.projectiles.push(new Projectile(this.game, this.x, this.y))
   
    }
  }
  class Enemy {

  }
  class Layer {

  }
  class Background { //pools Layer classes

  }
  class UI {

  }
  class Game {
    constructor(width,height) { //takes in global canvas width / height
      this.width = width
      this.height = height
      this.player = new Player(this) //a new instance of player will be created EVERY time a game instance is created!
      // passing 'this' will pass the whole Game object, now Player instances will have access to Game object
      this.input = new InputHandler(this)
      this.keys = []
    }
    update() {

      this.player.update() //if game object calls update, then player object ALSO calls its update
    }
    draw(context) {

      this.player.draw(context) //note game.draw() will just call player.draw() passing in curent canvas we wanan draw on
    }
  }
  // the code below will instantiate a new game AND player on document load.
  const game = new Game(canvas.width, canvas.height)
  function animate() {
    ctx.clearRect(0,0,canvas.width,canvas.height)
    game.update() //note this ALSO calls game.player.draw()
    game.draw(ctx)
    // if (game.player.y + game.player.height >= canvas.height) return
    requestAnimationFrame(animate)
  }
  animate()
}
