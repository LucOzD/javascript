// DOM
const PLAYER_SIZE = 60;
const gameArea = document.getElementById("gameArea");
const playerEl = document.getElementById("player");
const enemyEl = document.getElementById("enemy");
const pointerEl = document.getElementById("pointer");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");

let currentWall = null;

// === PLAYER PHYSICS ===
let px = 0, py = 0;
let velX = 0, velY = 0;
let angle = 0;

const thrust = 1;
const friction = 0.98;
const rotationSpeed = 0.08;

// === ENEMY ===
let ex = 0, ey = 0;
let enemySpeed = 10;

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
const TILE_SIZE = 2000;
const CHUNK_SIZE = TILE_SIZE * 2;

let chunks = {};

function chunkKey(cx, cy) {
    return `${cx},${cy}`;
}

// === DETERMINISTIC HASH ===
function hash2D(x, y) {
    let n = x * 374761393 + y * 668265263;
    n = (n ^ (n >> 13)) * 1274126177;
    return ((n ^ (n >> 16)) >>> 0) / 4294967295;
}

// === WALL DENSITY ===
function getWallDensity(cx, cy) {
    const base = hash2D(cx, cy);

    const n1 = hash2D(cx - 1, cy);
    const n2 = hash2D(cx + 1, cy);
    const n3 = hash2D(cx, cy - 1);
    const n4 = hash2D(cx, cy + 1);

    const neighborAvg = (n1 + n2 + n3 + n4) / 4;
    const wobble = hash2D(cx * 3, cy * 5) * 0.4;

    return neighborAvg * 0.55 + base * 0.25 + wobble * 0.2;
}

function getWallCount(cx, cy) {
    const density = getWallDensity(cx, cy);
    return Math.floor(150 + density * 600); // 150–750 walls
}

// === WALL GENERATION ===
function generateWalls(chunk, cx, cy) {
    const count = getWallCount(cx, cy);
    const seed = cx * 928371 + cy * 123133;

    for (let i = 0; i < count; i++) {
        const r1 = hash2D(seed + i * 17, i * 3);
        const r2 = hash2D(seed + i * 31, i * 3 + 1);
        const r3 = hash2D(seed, i * 3 + 2);

        const w = 60 + r3 * 120;
        const h = 20 + r2 * 60;

        const x = r1 * (CHUNK_SIZE - w);
        const y = r2 * (CHUNK_SIZE - h);

        const wall = document.createElement("div");
        wall.className = "wall";
        wall.style.left = x + "px";
        wall.style.top = y + "px";
        wall.style.width = w + "px";
        wall.style.height = h + "px";

        // ALL WALLS MOVE
        wall.dataset.dynamic = "1";

        chunk.appendChild(wall);
    }
}

// === DYNAMIC WALL DRIFT ===
function updateDynamicWalls() {
    for (const key in chunks) {
        const chunk = chunks[key];
        const walls = chunk.element.querySelectorAll(".wall");

        walls.forEach(wall => {
            let x = parseFloat(wall.style.left);
            let y = parseFloat(wall.style.top);

            x += (Math.random() - 0.5) * 0.4;
            y += (Math.random() - 0.5) * 0.4;

            wall.style.left = x + "px";
            wall.style.top = y + "px";
        });
    }
}

// === BLACK HOLES ===
const blackHoles = [];

function trySpawnBlackHole(cx, cy, chunkElement) {
    const chance = hash2D(cx * 99, cy * 77);

    if (chance < 0.6) return; // ~1 hole per 2.5 chunks

    const r1 = hash2D(cx * 13, cy * 17);
    const r2 = hash2D(cx * 19, cy * 23);

    const x = r1 * CHUNK_SIZE;
    const y = r2 * CHUNK_SIZE;

    const radius = 450;
    const core = 120;
    const strength = 0.03;

    const el = document.createElement("div");
    el.className = "blackHole";
    el.style.position = "absolute";
    el.style.width = "160px";
    el.style.height = "160px";
    el.style.borderRadius = "50%";
    el.style.backgroundImage = 'url("jelly.webp")';
    el.style.backgroundSize = "cover";
    el.style.backgroundPosition = "center";
    el.style.zIndex = "900";

    chunkElement.appendChild(el);

    blackHoles.push({
        x: cx * CHUNK_SIZE + x,
        y: cy * CHUNK_SIZE + y,
        radius,
        core,
        strength,
        el
    });
}

function applyBlackHoles() {
    for (const bh of blackHoles) {
        const dx = bh.x - px;
        const dy = bh.y - py;
        const dist = Math.hypot(dx, dy);

        if (dist < bh.radius && dist > 1) {
            const pull = bh.strength * (1 - dist / bh.radius);
            velX += (dx / dist) * pull;
            velY += (dy / dist) * pull;
        }

        if (dist < bh.core && dist > 1) {
            velX = -(dx / dist) * 25;
            velY = -(dy / dist) * 25;
        }
    }
}

// === CREATE CHUNK ===
function createChunk(cx, cy) {
    const key = chunkKey(cx, cy);
    if (chunks[key]) return;

    const chunk = document.createElement("div");
    chunk.className = "chunk";
    chunk.style.width = CHUNK_SIZE + "px";
    chunk.style.height = CHUNK_SIZE + "px";

    // Background tiles
    for (let tx = 0; tx < 2; tx++) {
        for (let ty = 0; ty < 2; ty++) {
            const tile = document.createElement("img");
            tile.src = "mo.webp";
            tile.style.position = "absolute";
            tile.style.left = (tx * TILE_SIZE) + "px";
            tile.style.top = (ty * TILE_SIZE) + "px";
            tile.style.width = TILE_SIZE + "px";
            tile.style.height = TILE_SIZE + "px";
            chunk.appendChild(tile);
        }
    }

    generateWalls(chunk, cx, cy);
    trySpawnBlackHole(cx, cy, chunk);

    const firstElement = [...gameArea.childNodes].find(n => n.nodeType === 1);
    if (firstElement) gameArea.insertBefore(chunk, firstElement);
    else gameArea.appendChild(chunk);

    chunk.style.zIndex = "-10";

    chunks[key] = { element: chunk, cx, cy };
}

// === UPDATE CHUNKS ===
function updateChunks() {
    const playerChunkX = Math.floor(px / CHUNK_SIZE);
    const playerChunkY = Math.floor(py / CHUNK_SIZE);

    const needed = new Set();

    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            const cx = playerChunkX + dx;
            const cy = playerChunkY + dy;
            const key = chunkKey(cx, cy);
            needed.add(key);
            createChunk(cx, cy);
        }
    }

    for (const key in chunks) {
        if (!needed.has(key)) {
            chunks[key].element.remove();
            delete chunks[key];
        }
    }

    const offsetX = 400 - px;
    const offsetY = 300 - py;

    for (const key in chunks) {
        const c = chunks[key];
        c.element.style.left = (c.cx * CHUNK_SIZE + offsetX) + "px";
        c.element.style.top  = (c.cy * CHUNK_SIZE + offsetY) + "px";
    }

    for (const bh of blackHoles) {
        const sx = bh.x + offsetX;
        const sy = bh.y + offsetY;
        bh.el.style.left = sx + "px";
        bh.el.style.top  = sy + "px";
    }
}

// === ENEMY SPAWN ===
function spawnEnemy() {
    let distance = 0;
    let tries = 0;

    while (distance < 600 && tries < 50) {
        tries++;
        const ang = Math.random() * Math.PI * 2;
        const dist = 600 + Math.random() * 800;

        ex = px + Math.cos(ang) * dist;
        ey = py + Math.sin(ang) * dist;

        distance = Math.hypot(ex - px, ey - py);
    }

    enemySpeed = 20;
}

// === PLAYER MOVEMENT ===
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

    applyBlackHoles();

    px += velX;
    py += velY;

    velX *= friction;
    velY *= friction;

    handleWallCollision();
}

// === WALL COLLISION ===
function handleWallCollision() {
    const half = PLAYER_SIZE / 2;

    for (const key in chunks) {
        const chunk = chunks[key];
        const walls = chunk.element.querySelectorAll(".wall");

        const baseX = chunk.cx * CHUNK_SIZE;
        const baseY = chunk.cy * CHUNK_SIZE;

        walls.forEach(wall => {
            const wx = baseX + parseFloat(wall.style.left);
            const wy = baseY + parseFloat(wall.style.top);
            const ww = parseFloat(wall.style.width);
            const wh = parseFloat(wall.style.height);

            if (
                px + half > wx &&
                px - half < wx + ww &&
                py + half > wy &&
                py - half < wy + wh
            ) {
                currentWall = wall;
                resolveCollision(wx, wy, ww, wh, half);
            }
        });
    }
}

function resolveCollision(wx, wy, ww, wh, half) {
    const left   = (px + half) - wx;
    const right  = (wx + ww) - (px - half);
    const top    = (py + half) - wy;
    const bottom = (wy + wh) - (py - half);

    const minPen = Math.min(left, right, top, bottom);

    if (minPen === left) {
        px = wx - half;
    } else if (minPen === right) {
        px = wx + ww + half;
    } else if (minPen === top) {
        py = wy - half;
    } else if (minPen === bottom) {
        py = wy + wh + half;
    }

    // Push dynamic wall
    if (currentWall) {
        const pushX = (px - (wx + ww / 2)) * 0.3;
        const pushY = (py - (wy + wh / 2)) * 0.3;

        currentWall.style.left =
            (parseFloat(currentWall.style.left) + pushX) + "px";
        currentWall.style.top =
            (parseFloat(currentWall.style.top) + pushY) + "px";
    }

    velX = 0;
    velY = 0;
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

// === POINTER ===
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
}

// === COLLISION WITH ENEMY ===
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
    updateChunks();
    updatePointer(400 - px, 300 - py);
    updateDynamicWalls();
    checkCollision();

    score++;
    scoreEl.textContent = score;

    requestAnimationFrame(loop);
}

spawnEnemy();
loop();
