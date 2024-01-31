const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
ctx.webkitImageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;

const playerHealthEl = document.querySelector('#player-health .inner-health-bar');
const enemyHealthEl = document.querySelector('#enemy-health .inner-health-bar');

const restartBtn = document.querySelector('#restartBtn');

canvas.width = 1024;
canvas.height = 576;

const gravity = 0.7;

let animationId;
let clicked;

const background = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  imageSrc: 'img/background.png'
});

const shop = new Sprite({
  position: {
    x: 620,
    y: 128,
  },
  imageSrc: 'img/shop.png',
  scale: 2.75,
  framesMax: 6
});

let player = new Fighter({
  position: {
    x: 100,
    y: 0,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  imageSrc: 'img/samuraiMack/Idle.png',
  framesMax: 8,
  scale: 2.5,
  offset: {
    x: 215,
    y: 156
  },
  sprites: {
    idle: {
      imageSrc: 'img/samuraiMack/Idle.png',
      framesMax: 8
    },
    run: {
      imageSrc: 'img/samuraiMack/Run.png',
      framesMax: 8
    },
    jump: {
      imageSrc: 'img/samuraiMack/Jump.png',
      framesMax: 2
    },
    fall: {
      imageSrc: 'img/samuraiMack/Fall.png',
      framesMax: 2
    },
    attack1: {
      imageSrc: 'img/samuraiMack/Attack1.png',
      framesMax: 6
    },
    attack2: {
      imageSrc: 'img/samuraiMack/Attack2.png',
      framesMax: 6
    },
    takeHit: {
      imageSrc: 'img/samuraiMack/Take Hit.png',
      framesMax: 4
    },
    death: {
      imageSrc: 'img/samuraiMack/Death.png',
      framesMax: 6
    }
  },
  attackBox: {
    offfet: {
      x: 90,
      y: 50
    },
    width: 170,
    height: 50,
  }
});

let enemy = new Fighter({
  position: {
    x: canvas.width - 150,
    y: 0,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  color: 'blue',
  imageSrc: 'img/kenji/Idle.png',
  framesMax: 4,
  scale: 2.5,
  offset: {
    x: 215,
    y: 170
  },
  sprites: {
    idle: {
      imageSrc: 'img/kenji/Idle.png',
      framesMax: 4
    },
    run: {
      imageSrc: 'img/kenji/Run.png',
      framesMax: 8
    },
    jump: {
      imageSrc: 'img/kenji/Jump.png',
      framesMax: 2
    },
    fall: {
      imageSrc: 'img/kenji/Fall.png',
      framesMax: 2
    },
    attack1: {
      imageSrc: 'img/kenji/Attack1.png',
      framesMax: 4
    },
    attack2: {
      imageSrc: 'img/kenji/Attack2.png',
      framesMax: 4
    },
    takeHit: {
      imageSrc: 'img/kenji/Take hit.png',
      framesMax: 3
    },
    death: {
      imageSrc: 'img/kenji/Death.png',
      framesMax: 7
    }
  },
  attackBox: {
    offfet: {
      x: -175,
      y: 50
    },
    width: 170,
    height: 50,
  }
});

const keys = {
  KeyA: {
    pressed: false,
  },
  KeyD: {
    pressed: false,
  },
  KeyW: {
    pressed: false,
  },
  ArrowLeft: {
    pressed: false,
  },
  ArrowRight: {
    pressed: false,
  },
  ArrowUp: {
    pressed: false,
  }
};

function animate() {
  animationId = requestAnimationFrame(animate);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  background.update();
  shop.update();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  enemy.update();

  player.velocity.x = 0;
  enemy.velocity.x = 0;

  // player movement
  if (keys.KeyA.pressed || keys.KeyD.pressed) {
    player.switchSprite('run');
  } else if (!keys.KeyA.pressed && !keys.KeyD.pressed) {
    player.switchSprite('idle');
  } 

  if (player.velocity.y < 0) {
    player.switchSprite('jump');
  } else if (player.velocity.y > 0) {
    player.switchSprite('fall');
  }

  if (keys.KeyA.pressed && player.lastKey === 'KeyA') {
    player.velocity.x = -Fighter.speed.x;
  } else if (keys.KeyD.pressed && player.lastKey === 'KeyD') {
    player.velocity.x = Fighter.speed.x;
  }

  if (keys.KeyW.pressed && player.velocity.y === 0) {
    player.velocity.y = -Fighter.speed.y;
  }
    
  // enemy movement
  if (keys.ArrowLeft.pressed || keys.ArrowRight.pressed) {
    enemy.switchSprite('run');
  } else {
    enemy.switchSprite('idle');
  }

  if (enemy.velocity.y < 0) {
    enemy.switchSprite('jump');
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprite('fall');
  }

  if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
    enemy.velocity.x = -Fighter.speed.x;
  } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
    enemy.velocity.x = Fighter.speed.x;
  }

  if (keys.ArrowUp.pressed && enemy.velocity.y === 0) {
    enemy.velocity.y = -Fighter.speed.y;
  }

  // detect for collision & enemy gets hit
  if (rectangularCollision({
    rectangle1: player,
    rectangle2: enemy
  }) && player.framesCurrent === 4) {
    player.isAttacking = false;
    enemy.takeHit(20);
    audio.hit.play();
    gsap.to(enemyHealthEl, {
      width: enemy.health > 0 ? enemy.health * 100 / enemy.initialHealth + '%' : '0%',
      duration: 0.3,
      transformOrigin: 'left'
    });
  }

  // if player misses
  if (player.isAttacking && player.framesCurrent === 4) {
    player.isAttacking = false;
    audio.miss.play();
  }


  // detect for collision & player gets hit
  if (rectangularCollision({
    rectangle1: enemy,
    rectangle2: player
  }) && enemy.framesCurrent === 2) {
    enemy.isAttacking = false;
    player.takeHit(20);
    audio.hit.play();
    gsap.to(playerHealthEl, {
      width: player.health > 0 ? player.health * 100 / player.initialHealth + '%' : '0%',
      duration: 0.3,
      transformOrigin: 'right'
    });
  }

  // if enemy misses
  if (enemy.isAttacking && enemy.framesCurrent === 2) {
    enemy.isAttacking = false;
    audio.miss.play();
  }

  // end game based on health

  if (player.health <= 0) {
    player.switchSprite('death');
  }

  if (enemy.health <= 0) {
    enemy.switchSprite('death');
  }

  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({player, enemy});
  }
}

function start() {
  timer = 60;

  restartBtn.blur();
  gsap.to(resultEl, {
    opacity: 0,
    pointerEvents: 'none',
    duration: 1
  });
  
  decreaseTimer();
}

function init() {
  player = new Fighter({
    position: {
      x: 100,
      y: 0,
    },
    velocity: {
      x: 0,
      y: 0,
    },
    imageSrc: 'img/samuraiMack/Idle.png',
    framesMax: 8,
    scale: 2.5,
    offset: {
      x: 215,
      y: 156
    },
    sprites: {
      idle: {
        imageSrc: 'img/samuraiMack/Idle.png',
        framesMax: 8
      },
      run: {
        imageSrc: 'img/samuraiMack/Run.png',
        framesMax: 8
      },
      jump: {
        imageSrc: 'img/samuraiMack/Jump.png',
        framesMax: 2
      },
      fall: {
        imageSrc: 'img/samuraiMack/Fall.png',
        framesMax: 2
      },
      attack1: {
        imageSrc: 'img/samuraiMack/Attack1.png',
        framesMax: 6
      },
      attack2: {
        imageSrc: 'img/samuraiMack/Attack2.png',
        framesMax: 6
      },
      takeHit: {
        imageSrc: 'img/samuraiMack/Take Hit.png',
        framesMax: 4
      },
      death: {
        imageSrc: 'img/samuraiMack/Death.png',
        framesMax: 6
      }
    },
    attackBox: {
      offfet: {
        x: 90,
        y: 50
      },
      width: 170,
      height: 50,
    }
  });
  gsap.to(playerHealthEl, {
    width: '100%',
    duration: 0,
  });
  
  enemy = new Fighter({
    position: {
      x: canvas.width - 150,
      y: 0,
    },
    velocity: {
      x: 0,
      y: 0,
    },
    color: 'blue',
    imageSrc: 'img/kenji/Idle.png',
    framesMax: 4,
    scale: 2.5,
    offset: {
      x: 215,
      y: 170
    },
    sprites: {
      idle: {
        imageSrc: 'img/kenji/Idle.png',
        framesMax: 4
      },
      run: {
        imageSrc: 'img/kenji/Run.png',
        framesMax: 8
      },
      jump: {
        imageSrc: 'img/kenji/Jump.png',
        framesMax: 2
      },
      fall: {
        imageSrc: 'img/kenji/Fall.png',
        framesMax: 2
      },
      attack1: {
        imageSrc: 'img/kenji/Attack1.png',
        framesMax: 4
      },
      attack2: {
        imageSrc: 'img/kenji/Attack2.png',
        framesMax: 4
      },
      takeHit: {
        imageSrc: 'img/kenji/Take hit.png',
        framesMax: 3
      },
      death: {
        imageSrc: 'img/kenji/Death.png',
        framesMax: 7
      }
    },
    attackBox: {
      offfet: {
        x: -175,
        y: 50
      },
      width: 170,
      height: 50,
    }
  });
  gsap.to(enemyHealthEl, {
    width: '100%',
    duration: 0,
  });

  start();
}

animate();

addEventListener('keydown', ({ code }) => {
  if (!player.dead) {
    switch (code) {
      case 'KeyD':
        keys.KeyD.pressed = true;
        player.lastKey = code;
        break;
      case 'KeyA':
        keys.KeyA.pressed = true;
        player.lastKey = code;
        break;
      case 'KeyW':
        keys.KeyW.pressed = true;
        break;
      case 'Space':
        player.attack();
        break;
    };
  }

  if (!enemy.dead) {
    switch (code) {
      case 'ArrowRight':
        keys.ArrowRight.pressed = true;
        enemy.lastKey = code;
        break;
      case 'ArrowLeft':
        keys.ArrowLeft.pressed = true;
        enemy.lastKey = code;
        break;
      case 'ArrowUp':
        keys.ArrowUp.pressed = true;
        break;
      case 'ArrowDown':
        enemy.attack();
        break;
      default:
        break;
    }
  }
});

addEventListener('keyup', ({ code }) => {
  switch (code) {
    case 'KeyD':
      keys.KeyD.pressed = false;
      break;
    case 'KeyA':
      keys.KeyA.pressed = false;
      break;
    case 'KeyW':
      keys.KeyW.pressed = false;
      break;
    case 'ArrowRight':
      keys.ArrowRight.pressed = false;
      break;
    case 'ArrowLeft':
      keys.ArrowLeft.pressed = false;
      break;
    case 'ArrowUp':
      keys.ArrowUp.pressed = false;
      break;
    default:
      break;
  }
});

restartBtn.addEventListener('click', () => {
  if (!clicked) {
    clicked = true;
    audio.theme.play();
    start();
    restartBtn.textContent = 'Restart';
  } else {
    init();
  }

  audio.click.play();
});
