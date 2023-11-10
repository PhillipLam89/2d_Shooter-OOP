
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

    }
  }
}
