class Sprite {
  constructor({
    position,
    imageSrc,
    scale = 1,
    framesMax = 1,
    framesHold = 10,
    offset = {
      x: 0,
      y: 0
    }
  }) {
    this.position = position;
    this.image = new Image();
    this.image.src = imageSrc;
    this.scale = scale;
    this.framesMax = framesMax;
    this.framesCurrent = 0;
    this.framesElapsed = 0;
    this.framesHold = framesHold;
    this.offset = offset;
  }

  draw() {
    ctx.drawImage(
      this.image,
      this.image.width / this.framesMax * this.framesCurrent,
      0,
      this.image.width / this.framesMax,
      this.image.height,
      this.position.x - this.offset.x,
      this.position.y - this.offset.y,
      this.image.width / this.framesMax * this.scale,
      this.image.height * this.scale
    );
  }

  animateFrames() {
    this.framesElapsed++;

    if (this.framesElapsed % this.framesHold === 0) {
      if (this.framesCurrent < this.framesMax - 1) {
        this.framesCurrent++;
      } else {
        this.framesCurrent = 0;
      }
    }
  }

  update() {
    this.animateFrames();
    this.draw();
  }
}

class Fighter extends Sprite {
  static speed = {
    x: 5,
    y: 20
  }

  constructor({
    position,
    velocity,
    attackBox = {
      offfet: {}, width: undefined, height: undefined
    },
    imageSrc,
    scale = 1,
    framesMax = 1,
    framesHold,
    offset,
    sprites
  }) {
    super({
      position,
      imageSrc,
      scale,
      framesMax,
      framesHold,
      offset
    });

    this.velocity = velocity;
    this.framesCurrent = 0;
    this.framesElapsed = 0;
    this.sprites = sprites;
    this.width = 50;
    this.height = 150;
    this.lastKey;
    this.attackBox = {
      position: {
        x: this.position.x,
        y: this.position.y
      },
      offset: attackBox.offfet,
      width: attackBox.width,
      height: attackBox.height,
    }
    this.isAttacking = false;
    this.initialHealth = 200;
    this.health = this.initialHealth;
    this.dead = false;

    for (const sprite in this.sprites) {
      this.sprites[sprite].image = new Image();
      this.sprites[sprite].image.src = this.sprites[sprite].imageSrc;
    }
  }

  update() {
    this.draw();
    if (!this.dead) this.animateFrames();

    this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
    this.attackBox.position.y = this.position.y + this.attackBox.offset.y;

    if (this.position.x + this.velocity.x <= 0 || this.position.x + this.width + this.velocity.x >= canvas.width) {
      this.velocity.x = 0;
    }

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.position.y + this.height + this.velocity.y >= canvas.height - 96) {
      this.velocity.y = 0;
      this.position.y = 330; 
    } else {
      this.velocity.y += gravity;
    }
  }

  attack() {
    if (Math.random() > 0.5) {
      this.switchSprite('attack1');
    } else {
      this.switchSprite('attack2');
    }

    this.isAttacking = true;
  }

  takeHit(damage) {
    this.health -= damage;
    this.switchSprite('takeHit');
  }

  switchSprite(sprite) {
    // overriding with death animation
    if (this.image === this.sprites.death.image) {
      if (this.framesCurrent === this.sprites.death.framesMax - 1) this.dead = true;
      return;
    }

    // overriding with attack animations
    if (
      (this.image === this.sprites.attack1.image && this.framesCurrent < this.sprites.attack1.framesMax - 1) ||
      (this.image === this.sprites.attack2.image && this.framesCurrent < this.sprites.attack2.framesMax - 1)
    ) return;

    // overriding with hit animation
    if (this.image === this.sprites.takeHit.image && this.framesCurrent < this.sprites.takeHit.framesMax - 1) return;

    if (this.image !== this.sprites[sprite].image) {
      this.image = this.sprites[sprite].image;
      this.framesMax = this.sprites[sprite].framesMax;
      this.framesCurrent = 0;
    }
  }
}
