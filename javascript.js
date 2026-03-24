// DOM
const gameArea = document.getElementById("gameArea");
const playerEl = document.getElementById("player");
const enemyEl = document.getElementById("enemy");
const pointerEl = document.getElementById("pointer");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");

// === PLAYER PHYSICS ===
let px = 0, py = 0;
let velX = 0, velY = 0;
let angle = 0;

const thrust = 0.25;
const friction = 0.98;
const rotationSpeed = 0.08;

// === ENEMY ===
let ex = 0, ey = 0;
let enemySpeed = 1.5;

// === INPUT ===
const keys = { w: false, a: false, s: false, d: false };
document.addEventListener("keydown", e => {
    const k = e.key.toLowerCase();
    if (k in keys) keys[k] = true;
});
document.addEventListener("keyup", e => {
    const k = e.key.toLowerCase();
    if (k in keys) keys[k] = false;
});

// === SCORE ===
let score = 0;
let highScore = 0;

// === CHUNK SYSTEM ===
// mo.png is 645×646 but we stretch it to 2000×2000
const TILE_SIZE = 2000;
const CHUNK_SIZE = TILE_SIZE * 2; // 4000×4000 per chunk

let chunks = {};

function chunkKey(cx, cy) {
    return `${cx},${cy}`;
}

function createChunk(cx, cy) {
    const key = chunkKey(cx, cy);
    if (chunks[key]) return;

    const chunk = document.createElement("div");
    chunk.className = "chunk";
    chunk.style.width = CHUNK_SIZE + "px";
    chunk.style.height = CHUNK_SIZE + "px";
    chunk.style.position = "absolute";
    chunk.style.zIndex = "0";

    // 2×2 tiles of mo.png stretched to 2000×2000
    for (let tx = 0; tx < 2; tx++) {
        for (let ty = 0; ty < 2; ty++) {
            const tile = document.createElement("img");
            tile.src = "mo.png";
            tile.style.position = "absolute";
            tile.style.left = (tx * TILE_SIZE) + "px";
            tile.style.top = (ty * TILE_SIZE) + "px";
            tile.style.width = TILE_SIZE + "px";
            tile.style.height = TILE_SIZE + "px";
            chunk.appendChild(tile);
        }
    }

    // Put behind player/enemy/pointer
    gameArea.prepend(chunk);

    chunks[key] = { element: chunk, cx, cy };
}

function updateChunks() {
    const playerChunkX = Math.floor(px / CHUNK_SIZE);
    const playerChunkY = Math.floor(py / CHUNK_SIZE);

    const needed = new Set();

    // Load 3×3 chunks around player
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            const cx = playerChunkX + dx;
            const cy = playerChunkY + dy;
            const key = chunkKey(cx, cy);
            needed.add(key);
            createChunk(cx, cy);
        }
    }

    // Remove unused chunks
    for (const key in chunks) {
        if (!needed.has(key)) {
            chunks[key].element.remove();
            delete chunks[key];
        }
    }

    // Position chunks relative to camera
    const offsetX = 400 - px;
    const offsetY = 300 - py;

    for (const key in chunks) {
        const c = chunks[key];
        c.element.style.left = (c.cx * CHUNK_SIZE + offsetX) + "px";
        c.element.style.top  = (c.cy * CHUNK_SIZE + offsetY) + "px";
    }
}

// === ENEMY SPAWN (never on top of player) ===
function spawnEnemy() {
    let distance = 0;

    while (distance < 600) {
        const ang = Math.random() * Math.PI * 2;
        const dist = 600 + Math.random() * 800;

        ex = px + Math.cos(ang) * dist;
        ey = py + Math.sin(ang) * dist;

        distance = Math.hypot(ex - px, ey - py);
    }

    enemySpeed = 1.5;
}

// === PLAYER MOVEMENT (DRIFT) ===
function movePlayer() {
    if (keys.a) angle -= rotationSpeed;
    if (keys.d) angle += rotationSpeed;

    if (keys.w) {
        velX += Math.cos(angle - Math.PI/2) * thrust;
        velY += Math.sin(angle - Math.PI/2) * thrust;
    }
    if (keys.s) {
        velX -= Math.cos(angle - Math.PI/2) * thrust;
        velY -= Math.sin(angle - Math.PI/2) * thrust;
    }

    px += velX;
    py += velY;

    velX *= friction;
    velY *= friction;
}

// === ENEMY AI ===
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

// === CAMERA + POINTER ===
function updateCamera() {
    const offsetX = 400 - px;
    const offsetY = 300 - py;

    // Player centered
    playerEl.style.left = "400px";
    playerEl.style.top = "300px";
    playerEl.style.transform = `rotate(${angle}rad)`;
    playerEl.style.zIndex = "1000";

    // Enemy relative to camera
    enemyEl.style.left = (ex + offsetX) + "px";
    enemyEl.style.top  = (ey + offsetY) + "px";
    enemyEl.style.zIndex = "900";

    updatePointer(offsetX, offsetY);
}

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

    const dx = screenX - 400;
    const dy = screenY - 300;
    const ang = Math.atan2(dy, dx);

    const edgeDist = 250;
    const px2 = 400 + Math.cos(ang) * edgeDist;
    const py2 = 300 + Math.sin(ang) * edgeDist;

    pointerEl.style.left = px2 + "px";
    pointerEl.style.top  = py2 + "px";
    pointerEl.style.transform = `rotate(${ang + Math.PI/2}rad)`;
    pointerEl.style.zIndex = "950";
}

// === COLLISION ===
function checkCollision() {
    const dx = px - ex;
    const dy = py - ey;

    if (Math.hypot(dx, dy) < 50) {
        gameOver();
    }
}

// === GAME OVER ===
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
    velX = 0;
    velY = 0;
    angle = 0;

    score = 0;
    scoreEl.textContent = score;

    spawnEnemy();
}

// === MAIN LOOP ===
function loop() {
    movePlayer();
    moveEnemy();
    updateCamera();
    updateChunks();
    checkCollision();

    score++;
    scoreEl.textContent = score;

    requestAnimationFrame(loop);
}

spawnEnemy();
loop();
