const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const gridSize = 20;
let snake = [{ x: 200, y: 200 }];
let dx = gridSize;
let dy = 0;
let food = spawnFood();
let gameOver = false;

let score = 0;
let highScore = localStorage.getItem("snakeHighScore") || 0;

let directionChanged = false;

document.addEventListener("keydown", changeDirection);

function gameLoop() {
  if (gameOver) return;

  directionChanged = false; // allow one direction change per frame

  setTimeout(() => {
    clearBoard();
    moveSnake();
    drawFood();
    drawSnake();
    drawScore();
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

  // Wall collision
  if (
    head.x < 0 || head.x >= canvas.width ||
    head.y < 0 || head.y >= canvas.height
  ) {
    return endGame();
  }

  // Self collision
  if (snake.some(part => part.x === head.x && part.y === head.y)) {
    return endGame();
  }

  snake.unshift(head);

  // Food collision
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
  if (directionChanged) return; // prevent double input in same frame
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

function drawScore() {
  ctx.fillStyle = "#0f0";
  ctx.font = "18px Arial";
  ctx.fillText("Score: " + score, 10, 20);
  ctx.fillText("High Score: " + highScore, 10, 40);
}

function endGame() {
  gameOver = true;
  alert("Game Over! Your score: " + score);
}

gameLoop();
