// DOM
const gameArea = document.getElementById("gameArea");
const playerEl = document.getElementById("player");
const enemyEl = document.getElementById("enemy");
const pointerEl = document.getElementById("pointer");
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
    const distance = 600 + Math.random() * 300;
    const ang = Math.random() * Math.PI * 2;

    ex = px + Math.cos(ang) * distance;
    ey = py + Math.sin(ang) * distance;

    enemySpeed = 1.5;
}

// Player movement
function movePlayer() {
    if (keys.a) angle -= rotationSpeed;
    if (keys.d) angle += rotationSpeed;

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

    enemySpeed += 0.0005;

    const enemyAngle = Math.atan2(dy, dx) + Math.PI/2;
    enemyEl.style.transform = `rotate(${enemyAngle}rad)`;
}

// Camera system
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

    // Background scroll (infinite tiling)
    const bgX = -px % 2000;
    const bgY = -py % 2000;

    background.style.left = (bgX - 1000) + "px";
    background.style.top = (bgY - 1000) + "px";

    // Pointer update
    updatePointer(offsetX, offsetY);
}


// Pointer logic
function updatePointer(offsetX, offsetY) {
    const screenX = ex + offsetX;
    const screenY = ey + offsetY;

    const onScreen =
        screenX > 0 && screenX < 800 &&
        screenY > 0 && screenY < 600;

    if (onScreen) {
        pointerEl.style.display = "none";
        return;
    }

    pointerEl.style.display = "block";

    // Angle from player to enemy
    const dx = screenX - 400;
    const dy = screenY - 300;
    const ang = Math.atan2(dy, dx);

    // Position pointer on screen edge
    const edgeDist = 250; // distance from center
    const px2 = 400 + Math.cos(ang) * edgeDist;
    const py2 = 300 + Math.sin(ang) * edgeDist;

    pointerEl.style.left = px2 + "px";
    pointerEl.style.top = py2 + "px";
    pointerEl.style.transform = `rotate(${ang + Math.PI/2}rad)`;
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
