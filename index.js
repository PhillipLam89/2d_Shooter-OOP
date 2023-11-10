
window.onload = function() {
  //canvas setup
  const canvas = document.getElementById('canvas1')
  const ctx = canvas.getContext('2d')
  canvas.width = 500
  canvas.height = 500

  class InputHandler {

  }
  class Projectile {

  }
  class Particle {

  }
  class Player {
    constructor(game) {
      this.game = game //passes in whole game obj
      this.width = 120
      this.height = 190 //use exact width/height dimensions on our player img
      this.x = 20
      this.y = 100 //starting x, y positions
      this.speedY = 0 //since our game is moving horizontally
    }
    update() {
      this.y+= this.speedY

    }
    draw(context) { //better to pass in our ctx as an argument
      context.fillRect(this.x, this.y, this.width, this.height)

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
    }
    update() {
      this.player.update() //if game object calls update, then player object ALSO calls its update
    }
    draw(context) {
      this.player.draw(context) //note game.draw() will just acll player.draw() passing in curent canvas we wanan draw on
    }
  }
  const game = new Game(canvas.width, canvas.height)
  function animate() {
    ctx.clearRect(0,0,canvas.width,canvas.height)
    game.update() //note this ALSO calls game.player.draw()
    game.draw(ctx)
    requestAnimationFrame(animate)
  }
  animate()
}
