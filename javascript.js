// DOM
const gameArea = document.getElementById("gameArea");
const playerEl = document.getElementById("player");
const enemyEl = document.getElementById("enemy");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");

// Player world position
let px = 0;
let py = 0;
let angle = 0;

const moveSpeed = 4;
const rotationSpeed = 0.08;

// Enemy world position
let ex = 0;
let ey = 0;
let enemySpeed = 1.5;

// Input
const keys = { w: false, a: false, s: false, d: false };
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// Score
let score = 0;
let highScore = 0;

// Spawn enemy far away
function spawnEnemy() {
    const distance = 600 + Math.random() * 300; // 600–900px away
    const ang = Math.random() * Math.PI * 2;

    ex = px + Math.cos(ang) * distance;
    ey = py + Math.sin(ang) * distance;

    enemySpeed = 1.5;
}

// Player movement
function movePlayer() {
    // Rotate left/right
    if (keys.a) angle -= rotationSpeed;
    if (keys.d) angle += rotationSpeed;

    // Move forward/backward
    if (keys.w) {
        px += Math.cos(angle - Math.PI/2) * moveSpeed;
        py += Math.sin(angle - Math.PI/2) * moveSpeed;
    }
    if (keys.s) {
        px -= Math.cos(angle - Math.PI/2) * moveSpeed;
        py -= Math.sin(angle - Math.PI/2) * moveSpeed;
    }
}

// Enemy AI
function moveEnemy() {
    const dx = px - ex;
    const dy = py - ey;
    const dist = Math.hypot(dx, dy);

    ex += (dx / dist) * enemySpeed;
    ey += (dy / dist) * enemySpeed;

    enemySpeed += 0.0005; // slowly gets faster

    // Rotate enemy to face player
    const enemyAngle = Math.atan2(dy, dx) + Math.PI/2;
    enemyEl.style.transform = `rotate(${enemyAngle}rad)`;
}

// Camera system (NO ROTATION)
function updateCamera() {
    const offsetX = 400 - px;
    const offsetY = 300 - py;

    // Player stays centered
    playerEl.style.left = "400px";
    playerEl.style.top = "300px";
    playerEl.style.transform = `rotate(${angle}rad)`;

    // Enemy moves relative to camera
    enemyEl.style.left = (ex + offsetX) + "px";
    enemyEl.style.top = (ey + offsetY) + "px";
}

// Collision detection
function checkCollision() {
    const dx = px - ex;
    const dy = py - ey;

    if (Math.hypot(dx, dy) < 50) {
        gameOver();
    }
}

// Game over
function gameOver() {
    if (score > highScore) {
        highScore = score;
        highScoreEl.textContent = highScore;

        // Send high score to ESP8266 OLED
        fetch(`/oled?text=High:${highScore}`);
    }

    alert("GAME OVER!");
    resetGame();
}

// Reset game
function resetGame() {
    px = 0;
    py = 0;
    angle = 0;

    score = 0;
    scoreEl.textContent = score;

    spawnEnemy();
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

// Start game
spawnEnemy();
loop();
