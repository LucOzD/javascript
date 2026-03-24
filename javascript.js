// DOM
const gameArea = document.getElementById("gameArea");
const playerEl = document.getElementById("player");
const enemyEl = document.getElementById("enemy");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");

// Player world position
let px = 0;
let py = 0;
const speed = 4;

// Enemy world position
let ex = 300;
let ey = 300;
let enemySpeed = 1.5;

// Input
const keys = { w: false, a: false, s: false, d: false };
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// Score
let score = 0;
let highScore = 0;

// Movement
function movePlayer() {
    if (keys.w) py -= speed;
    if (keys.s) py += speed;
    if (keys.a) px -= speed;
    if (keys.d) px += speed;
}

// Enemy AI
function moveEnemy() {
    const dx = px - ex;
    const dy = py - ey;
    const dist = Math.hypot(dx, dy);

    ex += (dx / dist) * enemySpeed;
    ey += (dy / dist) * enemySpeed;

    enemySpeed += 0.0005; // slowly gets faster
}

// Camera system
function updateCamera() {
    const offsetX = 400 - px;
    const offsetY = 300 - py;

    playerEl.style.left = "400px";
    playerEl.style.top = "300px";

    enemyEl.style.left = (ex + offsetX) + "px";
    enemyEl.style.top = (ey + offsetY) + "px";
}

// Collision
function checkCollision() {
    const dx = px - ex;
    const dy = py - ey;
    if (Math.hypot(dx, dy) < 50) gameOver();
}

// Game over
function gameOver() {
    if (score > highScore) {
        highScore = score;
        highScoreEl.textContent = highScore;

        fetch(`/oled?text=High:${highScore}`);
    }

    alert("GAME OVER!");
    resetGame();
}

function resetGame() {
    px = 0;
    py = 0;
    ex = 300;
    ey = 300;
    enemySpeed = 1.5;
    score = 0;
    scoreEl.textContent = score;
}

// Main loop
function loop() {
    movePlayer();
    moveEnemy();
    updateCamera();
    checkCollision();

    score++;
    scoreEl.textContent = score;

    requestAnimationFrame(loop);
}

loop();
