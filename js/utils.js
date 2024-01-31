const timerEl = document.querySelector('#timer');
const resultEl = document.querySelector('#result');

let timer = 60;
let timerId;

function rectangularCollision({
  rectangle1, rectangle2
}) {
  return (rectangle1.attackBox.position.x + rectangle1.attackBox.width >= rectangle2.position.x && rectangle1.attackBox.position.x <= rectangle2.position.x + rectangle2.width && rectangle1.attackBox.position.y + rectangle1.attackBox.height >= rectangle2.position.y && rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height && rectangle1.isAttacking);
}

function determineWinner({player, enemy}) {
  clearTimeout(timerId);

  const span = resultEl.querySelector('span');

  if (player.health <= 0 && enemy.health <= 0) {
    span.textContent = 'Double kill!';
  } else if (player.health === enemy.health) {
    span.textContent = 'Tie!';
  } else if (player.health > enemy.health) {
    span.textContent = 'Player 1 Wins!';
  } else if (player.health < enemy.health) {
    span.textContent = 'Player 2 Wins!';
  }

  gsap.to(resultEl, {
    opacity: 1,
    pointerEvents: 'initial'
  });
}

function decreaseTimer() {
  if (timer > 0) {
    timerId = setTimeout(decreaseTimer, 1000);
    timerEl.textContent = timer;
    timer--;
  } else {
    determineWinner({ player, enemy });
  }
}