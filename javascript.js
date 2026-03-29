// ===== MENU ELEMENTS =====
const menu = document.getElementById('menu');
const menuMessage = document.getElementById('menuMessage');
const sizeButtons = document.querySelectorAll('.sizeBtn');

// ===== GAME ELEMENTS =====
const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const mineCounterElement = document.getElementById('mineCounter');
const timerElement = document.getElementById('timer');

// ===== LEADERBOARD ELEMENTS =====
const lbSmall = document.getElementById("lb-small");
const lbMedium = document.getElementById("lb-medium");
const lbLarge = document.getElementById("lb-large");

// ===== TIMER STATE =====
let timer = 0;
let timerInterval = null;

// ===== GAME STATE =====
let rows, cols, mines;
let board = [];
let gameOver = false;
let cellsRevealed = 0;
let firstClick = true;
let currentSize = "small";

// ===== PRESET SIZES =====
const sizes = {
  small:  { rows: 10, cols: 10, mines: 15 },
  medium: { rows: 25, cols: 25, mines: 80 },
  large:  { rows: 45, cols: 45, mines: 250 }
};

// ===== LEADERBOARD STORAGE =====
function loadLeaderboards() {
  updateLB("small");
  updateLB("medium");
  updateLB("large");
}

function updateLB(size) {
  const list = JSON.parse(localStorage.getItem("lb-" + size) || "[]");
  const ul = size === "small" ? lbSmall : size === "medium" ? lbMedium : lbLarge;

  ul.innerHTML = "";
  list.forEach(entry => {
    const li = document.createElement("li");
    li.textContent = `${entry.name} - ${entry.time}s`;
    ul.appendChild(li);
  });
}

function saveScore(size, name, time) {
  const key = "lb-" + size;
  const list = JSON.parse(localStorage.getItem(key) || "[]");

  list.push({ name, time });

  // Sort by fastest time
  list.sort((a, b) => a.time - b.time);

  // Keep only top 5
  list.splice(5);

  localStorage.setItem(key, JSON.stringify(list));
  updateLB(size);
}


// ===== MENU CONTROL =====
function showMenu(message = "") {
  menuMessage.textContent = message;
  menu.classList.add("show");
  menu.style.display = "flex";
  loadLeaderboards();
}


sizeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const size = btn.dataset.size;
    startNewGame(size);
  });
});

// ===== GAME SETUP =====
function startNewGame(sizeKey) {
  currentSize = sizeKey;
  const s = sizes[sizeKey];

  rows = s.rows;
  cols = s.cols;
  mines = s.mines;

  gameOver = false;
  firstClick = true;
  cellsRevealed = 0;

  clearInterval(timerInterval);
  timer = 0;
  timerElement.textContent = "Time: 0";
  mineCounterElement.textContent = `Mines: ${mines}`;

  createEmptyBoard();
  buildBoardDOM();

  menu.classList.remove("show");
  menu.style.display = "none";
}

// ===== BOARD CREATION =====
function createEmptyBoard() {
  board = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        row: r,
        col: c,
        mine: false,
        revealed: false,
        flagged: false,
        adjacent: 0,
        element: null
      });
    }
    board.push(row);
  }
}

function buildBoardDOM() {
  boardElement.innerHTML = '';
  boardElement.style.gridTemplateRows = `repeat(${rows}, 30px)`;
  boardElement.style.gridTemplateColumns = `repeat(${cols}, 30px)`;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = board[r][c];
      const div = document.createElement('div');
      div.classList.add('cell');
      div.dataset.row = r;
      div.dataset.col = c;

      div.addEventListener('click', onCellLeftClick);
      div.addEventListener('contextmenu', onCellRightClick);

      cell.element = div;
      boardElement.appendChild(div);
    }
  }
}

// ===== MINE GENERATION AFTER FIRST CLICK =====
function placeMines(firstRow, firstCol) {
  let placed = 0;

  const safeZone = new Set();
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      safeZone.add(`${firstRow + dr},${firstCol + dc}`);
    }
  }

  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);

    if (board[r][c].mine) continue;
    if (safeZone.has(`${r},${c}`)) continue;

    board[r][c].mine = true;
    placed++;
  }
}

// ===== ADJACENT COUNT =====
function inBounds(r, c) {
  return r >= 0 && r < rows && c >= 0 && c < cols;
}

function calculateAdjacents() {
  const dirs = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].mine) continue;

      let count = 0;
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (inBounds(nr, nc) && board[nr][nc].mine) count++;
      }
      board[r][c].adjacent = count;
    }
  }
}

// ===== CELL REVEAL =====
function revealCell(cell) {
  if (cell.revealed || cell.flagged) return;

  cell.revealed = true;
  cellsRevealed++;

  const el = cell.element;
  el.classList.add('revealed');
  el.style.animationDelay = `${Math.random() * 0.05}s`;

  if (cell.mine) {
    el.classList.add('mine');
    el.textContent = '💣';
    return;
  }

  if (cell.adjacent > 0) {
    el.textContent = cell.adjacent;
    el.classList.add(`num-${cell.adjacent}`);
  } else {
    floodReveal(cell.row, cell.col);
  }
}

function floodReveal(r, c) {
  const queue = [[r, c]];
  const dirs = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  while (queue.length > 0) {
    const [cr, cc] = queue.shift();

    for (const [dr, dc] of dirs) {
      const nr = cr + dr;
      const nc = cc + dc;

      if (!inBounds(nr, nc)) continue;

      const neighbor = board[nr][nc];
      if (neighbor.revealed || neighbor.flagged || neighbor.mine) continue;

      neighbor.revealed = true;
      cellsRevealed++;

      const el = neighbor.element;
      el.classList.add('revealed');
      el.style.animationDelay = `${(nr + nc) * 0.01}s`;

      if (neighbor.adjacent > 0) {
        el.textContent = neighbor.adjacent;
        el.classList.add(`num-${neighbor.adjacent}`);
      } else {
        queue.push([nr, nc]);
      }
    }
  }
}

// ===== WIN ANIMATION =====
function playWinAnimation(callback) {
  let delay = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = board[r][c];
      if (cell.mine) continue; // skip mines

      setTimeout(() => {
        cell.element.classList.add("win-ripple");
      }, delay);

      delay += 8;
    }
  }

  setTimeout(callback, delay + 300);
}

// ===== LOSE ANIMATION =====
function playLoseAnimation(callback) {
  let delay = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = board[r][c];
      if (!cell.mine) continue;

      setTimeout(() => {
        cell.element.classList.add("mine-explode");
        cell.element.textContent = "💥";
      }, delay);

      delay += 80;
    }
  }

  setTimeout(callback, delay + 500);
}

// ===== GAME END =====
function checkWin() {
  const totalCells = rows * cols;
  const nonMineCells = totalCells - mines;

  if (cellsRevealed === nonMineCells && !gameOver) {
    gameOver = true;
    clearInterval(timerInterval);

    playWinAnimation(() => {
      const best = JSON.parse(localStorage.getItem("lb-" + currentSize) || "[]");
      const isHighScore = best.length < 5 || timer < best[best.length - 1].time;

      if (isHighScore) {
        const name = prompt("New High Score! Enter your name:");
        if (name) saveScore(currentSize, name, timer);
      }

      showMenu("🎉 You win!");
    });
  }
}

function revealAllMines() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = board[r][c];
      if (cell.mine) {
        cell.element.classList.add('revealed', 'mine');
        cell.element.textContent = '💣';
      }
    }
  }
}

// ===== CLICK HANDLERS =====
function onCellLeftClick(e) {
  if (gameOver) return;

  const r = parseInt(e.currentTarget.dataset.row);
  const c = parseInt(e.currentTarget.dataset.col);
  const cell = board[r][c];

  if (firstClick) {
    placeMines(r, c);
    calculateAdjacents();
    firstClick = false;

    timerInterval = setInterval(() => {
      timer++;
      timerElement.textContent = `Time: ${timer}`;
    }, 1000);
  }

  if (cell.flagged) return;

  revealCell(cell);

  if (cell.mine) {
    gameOver = true;
    clearInterval(timerInterval);

    playLoseAnimation(() => {
      showMenu("💥 You hit a mine! Try again.");
    });

    return;
  }

  checkWin();
}

function onCellRightClick(e) {
  e.preventDefault();
  if (gameOver) return;

  const r = parseInt(e.currentTarget.dataset.row);
  const c = parseInt(e.currentTarget.dataset.col);
  const cell = board[r][c];

  if (cell.revealed) return;

  cell.flagged = !cell.flagged;
  cell.element.textContent = cell.flagged ? '🚩' : '';

  if (cell.flagged) {
    cell.element.classList.add("flagged");
  } else {
    cell.element.classList.remove("flagged");
  }

  const flaggedCount = board.flat().filter(c => c.flagged).length;
  mineCounterElement.textContent = `Mines: ${mines - flaggedCount}`;
}
