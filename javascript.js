// DOM elements
const gameArea = document.getElementById("gameArea");
const player = document.getElementById("player");
const scoreDisplay = document.getElementById("score");
const highScoreDisplay = document.getElementById("highScore");

// Player physics
let posX = 400;
let posY = 300;
let angle = 0;
let velX = 0;
let velY = 0;

const thrust = 0.2;
const friction = 0.99;
const rotationSpeed = 0.05;
const thrustOffset = -Math.PI / 2;

// Input tracking
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false
};

document.addEventListener("keydown", e => {
    if (e.key in keys) keys[e.key] = true;
});
document.addEventListener("keyup", e => {
    if (e.key in keys) keys[e.key] = false;
});

// Walls
let walls = [];
let score = 0;
let highScore = 0;

// Spawn a wall every 1.5 seconds
setInterval(() => {
    spawnWall();
}, 1500);

function spawnWall() {
    const wall = document.createElement("div");
    wall.classList.add("wall");

    const height = Math.random() * 200 + 50;
    const y = Math.random() * (600 - height);

    wall.style.width = "40px";
    wall.style.height = height + "px";
    wall.style.left = "800px";
    wall.style.top = y + "px";

    walls.push({ element: wall, x: 800, y, height });
    gameArea.appendChild(wall);
}

function movePlayer() {
    // Rotation
    if (keys.ArrowLeft) angle -= rotationSpeed;
    if (keys.ArrowRight) angle += rotationSpeed;

    // Thrust
    if (keys.ArrowUp) {
        velX += Math.cos(angle + thrustOffset) * thrust;
        velY += Math.sin(angle + thrustOffset) * thrust;
    }

    // Reverse thrust
    if (keys.ArrowDown) {
        velX -= Math.cos(angle + thrustOffset) * thrust;
        velY -= Math.sin(angle + thrustOffset) * thrust;
    }

    // Update position
    posX += velX;
    posY += velY;

    // Friction
    velX *= friction;
    velY *= friction;

    // Keep inside game area
    posX = Math.max(0, Math.min(740, posX));
    posY = Math.max(0, Math.min(540, posY));

    // Apply to DOM
    player.style.left = posX + "px";
    player.style.top = posY + "px";
    player.style.transform = `rotate(${angle}rad)`;
}

function moveWalls() {
    for (let i = walls.length - 1; i >= 0; i--) {
        const w = walls[i];
        w.x -= 4;
        w.element.style.left = w.x + "px";

        // Remove off-screen walls
        if (w.x < -50) {
            w.element.remove();
            walls.splice(i, 1);
        }
    }
}

function checkCollision() {
    for (const w of walls) {
        const px = posX + 30;
        const py = posY + 30;

        if (
            px > w.x &&
            px < w.x + 40 &&
            py > w.y &&
            py < w.y + w.height
        ) {
            gameOver();
        }
    }
}

function gameOver() {
    if (score > highScore) {
        highScore = score;
        highScoreDisplay.textContent = highScore;

        // Send high score to ESP8266 OLED
        fetch(`/oled?text=High:${highScore}`);
    }

    alert("GAME OVER!");
    resetGame();
}

function resetGame() {
    posX = 400;
    posY = 300;
    velX = 0;
    velY = 0;
    angle = 0;

    score = 0;
    scoreDisplay.textContent = score;

    walls.forEach(w => w.element.remove());
    walls = [];
}

function gameLoop() {
    movePlayer();
    moveWalls();
    checkCollision();

    score++;
    scoreDisplay.textContent = score;

    requestAnimationFrame(gameLoop);
}

gameLoop();
