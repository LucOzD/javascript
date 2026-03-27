// ===== MENU ELEMENTS =====
const menu = document.getElementById('menu');
const menuMessage = document.getElementById('menuMessage');
const sizeButtons = document.querySelectorAll('.sizeBtn');

// ===== GAME ELEMENTS =====
const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');

// ===== GAME STATE =====
let rows, cols, mines;
let board = [];
let gameOver = false;
let cellsRevealed = 0;
let firstClick = true;

// ===== PRESET SIZES =====
const sizes = {
  small:  { rows: 10, cols: 15, mines: 25 },
  medium: { rows: 20, cols: 30, mines: 50 },
  large:  { rows: 25, cols: 50, mines: 200 }
};

// ===== MENU CONTROL =====
function showMenu(message = "") {
  menuMessage.textContent = message;
  menu.style.display = "flex";
}

sizeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const size = btn.dataset.size;
    startNewGame(size);
  });
});

// ===== GAME SETUP =====
function startNewGame(sizeKey) {
  const s = sizes[sizeKey];

  rows = s.rows;
  cols = s.cols;
  mines = s.mines;

  gameOver = false;
  firstClick = true;
  cellsRevealed = 0;
  statusElement.textContent = '';

  createEmptyBoard();
  buildBoardDOM();

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

  // Build 3×3 safe zone
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
  el.textContent = '';

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
      el.textContent = '';

      if (neighbor.adjacent > 0) {
        el.textContent = neighbor.adjacent;
        el.classList.add(`num-${neighbor.adjacent}`);
      } else {
        queue.push([nr, nc]);
      }
    }
  }
}

// ===== GAME END =====
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

function checkWin() {
  const totalCells = rows * cols;
  const nonMineCells = totalCells - mines;

  if (cellsRevealed === nonMineCells && !gameOver) {
    gameOver = true;
    showMenu("🎉 You win!");
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
  }

  if (cell.flagged) return;

  revealCell(cell);

  if (cell.mine) {
    gameOver = true;
    revealAllMines();
    showMenu("💥 You hit a mine! Try again.");
  } else {
    checkWin();
  }
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
}
