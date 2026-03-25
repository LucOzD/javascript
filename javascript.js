const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreboard = document.getElementById("scoreboard");
const deathMenu = document.getElementById("deathMenu");
const finalScoreText = document.getElementById("finalScore");

const gridSize = 20;

let snake, dx, dy, food, gameOver, score, highScore;
let directionChanged = false;

highScore = localStorage.getItem("snakeHighScore") || 0;

resetGame();
document.addEventListener("keydown", changeDirection);

function resetGame() {
  snake = [{ x: 200, y: 200 }];
  dx = gridSize;
  dy = 0;
  food = spawnFood();
  gameOver = false;
  score = 0;
  updateScoreboard();
  deathMenu.style.display = "none";
}

function gameLoop() {
  if (gameOver) return;

  directionChanged = false;

  setTimeout(() => {
    clearBoard();
    moveSnake();
    drawFood();
    drawSnake();
    updateScoreboard();
    gameLoop();
  }, 100);
}

function clearBoard() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
  ctx.fillStyle = "#0f0";
  snake.forEach(part => ctx.fillRect(part.x, part.y, gridSize, gridSize));
}

function moveSnake() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  if (
    head.x < 0 || head.x >= canvas.width ||
    head.y < 0 || head.y >= canvas.height
  ) {
    return endGame();
  }

  if (snake.some(part => part.x === head.x && part.y === head.y)) {
    return endGame();
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("snakeHighScore", highScore);
    }
    food = spawnFood();
  } else {
    snake.pop();
  }
}

function drawFood() {
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, gridSize, gridSize);
}

function spawnFood() {
  return {
    x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
    y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
  };
}

function changeDirection(e) {
  if (directionChanged) return;
  directionChanged = true;

  const key = e.key;

  if (key === "ArrowUp" && dy === 0) {
    dx = 0; dy = -gridSize;
  } else if (key === "ArrowDown" && dy === 0) {
    dx = 0; dy = gridSize;
  } else if (key === "ArrowLeft" && dx === 0) {
    dx = -gridSize; dy = 0;
  } else if (key === "ArrowRight" && dx === 0) {
    dx = gridSize; dy = 0;
  }
}

function updateScoreboard() {
  scoreboard.textContent = `Score: ${score} | High Score: ${highScore}`;
}

function endGame() {
  gameOver = true;
  finalScoreText.textContent = `Final Score: ${score}`;
  deathMenu.style.display = "block";
}

function respawn() {
  resetGame();
  gameLoop();
}

gameLoop();
