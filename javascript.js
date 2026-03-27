const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const rowsInput = document.getElementById('rows');
const colsInput = document.getElementById('cols');
const minesInput = document.getElementById('mines');
const newGameButton = document.getElementById('newGame');
const menu = document.getElementById('menu');
const startGameButton = document.getElementById('startGame');
const menuMessage = document.getElementById('menuMessage');


let rows, cols, mines;
let board = [];
let gameOver = false;
let cellsRevealed = 0;

startGameButton.addEventListener('click', startNewGame);


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

function placeMines(firstClickRow, firstClickCol) {
  let placed = 0;

  // All 8 neighbors + the clicked cell
  const safeZone = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      safeZone.push(`${firstClickRow + dr},${firstClickCol + dc}`);
    }
  }

  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);

    // Skip if already a mine
    if (board[r][c].mine) continue;

    // Skip if inside the 3×3 safe zone
    if (safeZone.includes(`${r},${c}`)) continue;

    board[r][c].mine = true;
    placed++;
  }
}


function inBounds(r, c) {
  return r >= 0 && r < rows && c >= 0 && c < cols;
}

function calculateAdjacents() {
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].mine) {
        board[r][c].adjacent = -1;
        continue;
      }
      let count = 0;
      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;
        if (inBounds(nr, nc) && board[nr][nc].mine) count++;
      }
      board[r][c].adjacent = count;
    }
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

function startNewGame() {
  rows = parseInt(rowsInput.value, 10);
  cols = parseInt(colsInput.value, 10);
  mines = parseInt(minesInput.value, 10);

  const maxMines = rows * cols - 9; // allow 3x3 safe zone
  if (mines > maxMines) mines = maxMines;
  minesInput.value = mines;

  gameOver = false;
  cellsRevealed = 0;
  statusElement.textContent = '';

  createEmptyBoard();
  buildBoardDOM();

  // Hide menu
  menu.style.display = "none";
}

function showMenu(message = "") {
  menuMessage.textContent = message;
  menu.style.display = "flex";
}


function revealCell(cell) {
  if (cell.revealed || cell.flagged) return;
  cell.revealed = true;
  cellsRevealed++;

  const el = cell.element;
  el.classList.add('revealed');
  el.classList.remove('flagged');
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
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  while (queue.length > 0) {
    const [cr, cc] = queue.shift();
    for (const [dr, dc] of directions) {
      const nr = cr + dr;
      const nc = cc + dc;
      if (!inBounds(nr, nc)) continue;
      const neighbor = board[nr][nc];
      if (neighbor.revealed || neighbor.flagged || neighbor.mine) continue;

      neighbor.revealed = true;
      cellsRevealed++;
      const el = neighbor.element;
      el.classList.add('revealed');
      el.classList.remove('flagged');
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

function onCellLeftClick(e) {
  if (gameOver) return;

  const r = parseInt(e.currentTarget.dataset.row, 10);
  const c = parseInt(e.currentTarget.dataset.col, 10);
  const cell = board[r][c];

  const isFirstClick = board.every(row => row.every(c => !c.revealed && !c.mine));
  if (isFirstClick) {
    placeMines(r, c);
    calculateAdjacents();
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

  const r = parseInt(e.currentTarget.dataset.row, 10);
  const c = parseInt(e.currentTarget.dataset.col, 10);
  const cell = board[r][c];

  if (cell.revealed) return;

  cell.flagged = !cell.flagged;
  cell.element.classList.toggle('flagged', cell.flagged);
  cell.element.textContent = cell.flagged ? '🚩' : '';
}

newGameButton.addEventListener('click', startNewGame);

startNewGame();
