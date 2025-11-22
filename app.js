/* ===============================
   General Constants
================================ */
const ROWS = 6;
const COLS = 7;

let board = [];
let currentPlayer = 1;
let gameEnded = false;
let scores = { 1: 0, 2: 0 };

/* ===============================
   Elements Of The Game
================================ */
const gridEl = document.getElementById("grid");
const colBtnsEl = document.getElementById("colBtns");
const turnNameEl = document.getElementById("turnName");
const turnDotEl = document.getElementById("turnDot");

const name1El = document.getElementById("name1");
const name2El = document.getElementById("name2");
const label1El = document.getElementById("label1");
const label2El = document.getElementById("label2");
const score1El = document.getElementById("score1");
const score2El = document.getElementById("score2");
const p2modeEl = document.getElementById("p2mode");
const sw1 = document.getElementById("sw1");
const sw2 = document.getElementById("sw2");

const color1 = getCSS("--player1");
const color2 = getCSS("--player2");

function getCSS(varName) {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

/* ===============================
   Initialize Game
================================ */
function startGame() {
  createEmptyBoard();
  gameEnded = false;
  currentPlayer = 1;

  renderBoardStructure();
  refreshBoardUI();
  updateTurnDisplay();
  updateLabels();

  sw1.style.background = color1;
  sw2.style.background = color2;
}

function createEmptyBoard() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

/* ===============================
   Board Rendering
================================ */
function renderBoardStructure() {
  gridEl.innerHTML = "";
  colBtnsEl.innerHTML = "";
  createColumnButtons();
  createCells();
}

function createColumnButtons() {
  for (let c = 0; c < COLS; c++) {
    const btn = document.createElement("button");
    btn.className = "col-button";
    btn.textContent = c + 1;
    btn.onclick = () => dropPiece(c);
    colBtnsEl.appendChild(btn);
  }
}

function createCells() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";

      const disc = document.createElement("div");
      disc.className = "disc empty";
      disc.dataset.r = r;
      disc.dataset.c = c;

      cell.appendChild(disc);
      gridEl.appendChild(cell);
    }
  }
}

function refreshBoardUI() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const disc = getDisc(r, c);
      const value = board[r][c];

      disc.className = "disc";
      if (value === 0) disc.classList.add("empty");
      if (value === 1) disc.classList.add("p1");
      if (value === 2) disc.classList.add("p2");

      disc.style.transform = "translateY(0)";
    }
  }
}

function getDisc(r, c) {
  return gridEl.querySelector(`.disc[data-r="${r}"][data-c="${c}"]`);
}

/* ===============================
   Game Logic
================================ */
function dropPiece(col, fromAI = false) {
  if (gameEnded) return;
  if (currentPlayer === 2 && p2modeEl.value === "ai" && !fromAI) return;

  const row = findAvailableRow(col);
  if (row === null) {
    showFloatingMessage("Column full");
    return;
  }

  board[row][col] = currentPlayer;
  animateDrop(row, col);

  setTimeout(() => {
    refreshBoardUI();

    if (checkWinner(row, col, currentPlayer)) {
      handleWin(currentPlayer);
    } else if (isBoardFull()) {
      handleDraw();
    } else {
      switchPlayer();
      updateTurnDisplay();

      if (currentPlayer === 2 && p2modeEl.value === "ai") {
        setTimeout(aiMove, 400);
      }
    }
  }, 260);
}

function findAvailableRow(col) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) return r;
  }
  return null;
}

function animateDrop(r, c) {
  const disc = getDisc(r, c);
  disc.classList.remove("empty");
  disc.classList.add(currentPlayer === 1 ? "p1" : "p2");

  disc.style.transform = "translateY(-150px)";
  disc.offsetWidth; // fuerza repaint
  disc.style.transform = "translateY(0)";
}

function switchPlayer() {
  currentPlayer = currentPlayer === 1 ? 2 : 1;
}

function updateTurnDisplay() {
  turnDotEl.style.background = currentPlayer === 1 ? color1 : color2;
  updateLabels();
}

function updateLabels() {
  label1El.textContent = name1El.value || "Player 1";
  label2El.textContent = name2El.value || "Player 2";
  turnNameEl.textContent = currentPlayer === 1 ? name1El.value || "Player 1" : name2El.value || "Player 2";
}

/* ===============================
   Message
================================ */
function showFloatingMessage(msg) {
  const div = document.createElement("div");
  div.className = "floating-message";
  div.textContent = msg;
  document.body.appendChild(div);

  requestAnimationFrame(() => {
    div.style.top = "20px";
  });

  setTimeout(() => {
    div.style.top = "-60px";
    setTimeout(() => div.remove(), 500);
  }, 2500);
}

/* ===============================
   Winner Checking
================================ */
function checkWinner(r, c, p) {
  const directions = [
    [0, 1], [1, 0], [1, 1], [1, -1]
  ];
  return directions.some(dir => countDirection(r, c, p, dir) >= 4);
}

function countDirection(r, c, p, [dr, dc]) {
  return countOneSide(r, c, p, dr, dc) + countOneSide(r, c, p, -dr, -dc) + 1;
}

function countOneSide(r, c, p, dr, dc) {
  let count = 0;
  let rr = r + dr;
  let cc = c + dc;

  while (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS && board[rr][cc] === p) {
    count++;
    rr += dr;
    cc += dc;
  }
  return count;
}

function isBoardFull() {
  return board.every(row => row.every(cell => cell !== 0));
}

/* ===============================
   End of Game Handling
================================ */
function handleWin(player) {
  gameEnded = true;
  scores[player]++;
  updateScoreboard();

  const winnerName = player === 1 ? name1El.value || "Player 1" : name2El.value || "Player 2";
  showFloatingMessage(`${winnerName} wins!`);
}

function handleDraw() {
  gameEnded = true;
  showFloatingMessage("Draw");
}

function updateScoreboard() {
  score1El.textContent = scores[1];
  score2El.textContent = scores[2];
}

/* ===============================
   IA (SIMPLE)
================================ */
function aiMove() {
  if (gameEnded) return;
  const valid = getValidColumns();

  const winMove = findWinningMove(2, valid);
  if (winMove !== null) return dropPiece(winMove, true);

  const blockMove = findWinningMove(1, valid);
  if (blockMove !== null) return dropPiece(blockMove, true);

  if (valid.includes(3)) return dropPiece(3, true);

  const randomCol = valid[Math.floor(Math.random() * valid.length)];
  dropPiece(randomCol, true);
}

function getValidColumns() {
  const result = [];
  for (let c = 0; c < COLS; c++) if (board[0][c] === 0) result.push(c);
  return result;
}

function findWinningMove(player, cols) {
  for (const c of cols) {
    const r = findAvailableRow(c);
    if (r === null) continue;

    board[r][c] = player;
    const isWin = checkWinner(r, c, player);
    board[r][c] = 0;
    if (isWin) return c;
  }
  return null;
}

/* ===============================
    Event Listeners
================================ */
document.getElementById("newGame").onclick = startGame;
document.getElementById("resetScore").onclick = () => {
  scores = { 1: 0, 2: 0 };
  updateScoreboard();
};

gridEl.onclick = (e) => {
  const cell = e.target.closest(".cell");
  if (!cell) return;

  // Usar el atributo data-c de la celda
  const col = parseInt(cell.querySelector(".disc").dataset.c);
  dropPiece(col);
};


window.onkeydown = (e) => {
  if (e.key >= "1" && e.key <= "7") dropPiece(parseInt(e.key) - 1);
};

/* ===============================
   Initialize Game On Load
================================ */
startGame();
