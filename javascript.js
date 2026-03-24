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
const speed = 4;
const rotationSpeed = 0.08;

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
    // Rotate left/right
    if (keys.a) angle -= rotationSpeed;
    if (keys.d) angle += rotationSpeed;

    // Move forward/backward
    if (keys.w) {
        px += Math.cos(angle - Math.PI/2) * speed;
        py += Math.sin(angle - Math.PI/2) * speed;
    }
    if (keys.s) {
        px -= Math.cos(angle - Math.PI/2) * speed;
        py -= Math.sin(angle - Math.PI/2) * speed;
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

    // Rotate enemy