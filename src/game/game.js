const board = document.getElementById("board-container");
const player = document.getElementById("player-container");
const computer = document.getElementById("computer-container");
const dice1 = document.getElementById("dice-1");
const diceRollBtn = document.getElementById("dice-roll-btn");
const message = document.getElementById("message");

//data for ladder and snake
const ladder = [
  { start: 6, end: 24, color: "#FFB300" },
  { start: 10, end: 12, color: "#43A047" },
  { start: 11, end: 33, color: "#1E88E5" },
  { start: 20, end: 38, color: "#8E24AA" },
  { start: 40, end: 59, color: "#F4511E" },
  { start: 45, end: 54, color: "#3949AB" },
  { start: 64, end: 78, color: "#00ACC1" },
  { start: 72, end: 91, color: "#D81B60" },
  { start: 86, end: 96, color: "#7CB342" },
];

const snake = [
  { start: 98, end: 84, color: "#C62828" },
  { start: 94, end: 88, color: "#AD1457" },
  { start: 87, end: 22, color: "#6D4C41" },
  { start: 83, end: 61, color: "#00838F" },
  { start: 68, end: 49, color: "#F9A825" },
  { start: 57, end: 36, color: "#2E7D32" },
  { start: 48, end: 14, color: "#1565C0" },
  { start: 19, end: 4, color: "#FF7043" },
  { start: 13, end: 7, color: "#8D6E63" },
];

//const for board and each cells
const cellWidth = 90;
const cellHeight = 90;
const boardWidth = 10 * cellWidth;
const boardHeight = 10 * cellHeight;

// Player object to manage position and movement
const playerObj = {
  x: 0,
  y: 0,
  name: "Player",
  width: 90,
  height: 90,
  current_cell: 1,
  isForward: true,
  move: function () {
    player.style.bottom = `${this.y}px`;
    player.style.left = `${this.x}px`;
  },
};

//computer object
const computerObj = {
  x: 0,
  y: 0,
  name: "Computer",
  width: 90,
  height: 90,
  current_cell: 1,
  isForward: true,
  move: function () {
    computer.style.bottom = `${this.y}px`;
    computer.style.left = `${this.x}px`;
  },
};

// set initial styles for player and board
player.style.width = `${playerObj.width}px`;
player.style.height = `${playerObj.height}px`;
player.style.left = `${playerObj.x}px`;
player.style.bottom = `${playerObj.y}px`;

computer.style.width = `${computerObj.width}px`;
computer.style.height = `${computerObj.height}px`;
computer.style.left = `${computerObj.x}px`;
computer.style.bottom = `${computerObj.y}px`;

board.style.width = `${boardWidth}px`;
board.style.height = `${boardHeight}px`;

//funtion to generate random dice rolls
function randomDiceRoll() {
  const roll = Math.floor(Math.random() * 6) + 1;
  dice1.textContent = roll;
  return roll;
}

//funtion to roll dices by user
async function rollDice() {
  const plRoll = randomDiceRoll();
  await objMovement(plRoll, playerObj);
  await checkLadderOrSnakeAndMove(playerObj);
  const comRoll = randomDiceRoll();
  await objMovement(comRoll, computerObj);
  await checkLadderOrSnakeAndMove(computerObj);
}

//funtion to handle movement on board
async function objMovement(steps, obj) {
  message.textContent = `${obj.name} rolled a ${steps}!`;

  if (obj.current_cell + steps > 100) {
    message.textContent = `${obj.name} cannot move, roll exceeds board limit!`
    return Promise.resolve();
  }

  return Promise.all(
    Array.from({ length: steps }, (_, i) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const currentCol = Math.floor((obj.x + obj.width) / cellWidth);
          const currentRow = Math.floor((obj.y + obj.height) / cellHeight);

          obj.isForward = true;
          if (currentRow % 2 === 0) {
            obj.isForward = false;
          }

          if (currentCol > 9 && obj.isForward) {
            obj.y = currentRow === 10 ? obj.y : obj.y + cellHeight;
          } else if (currentCol <= 1 && !obj.isForward) {
            obj.y = currentRow === 10 ? obj.y : obj.y + cellHeight;
          } else {
            obj.x = obj.isForward ? obj.x + cellWidth : obj.x - cellWidth;
          }

          obj.current_cell = getCellFromCoordinates(obj.x, obj.y);
          obj.move();
          resolve();
        }, 400 * (i + 1));
      });
    })
  );
}

function getCellFromCoordinates(x, y) {
  const row = Math.floor(y / cellHeight);
  const col = Math.floor(x / cellWidth);

  const cellRow = row;
  const isEvenRow = cellRow % 2 === 0;

  const cellNumber = isEvenRow
    ? cellRow * 10 + (col + 1)
    : cellRow * 10 + (10 - col);

  return cellNumber;
}

async function checkLadderOrSnakeAndMove(obj) {
  const currentCell = obj.current_cell;
  const ladderMove = ladder.find((l) => l.start === currentCell);
  const snakeMove = snake.find((s) => s.start === currentCell);

  if (ladderMove && !snakeMove) {
    const endCell = ladderMove.end;
    const endRow = 10 - Math.floor(endCell / 10);
    const endCol =
      endCell % 10 === 0
        ? 9
        : endRow % 2 === 0
        ? (endCell % 10) - 1
        : 10 - (endCell % 10);
    obj.x = endCol * cellWidth;
    obj.y = (10 - endRow) * cellHeight;
    obj.current_cell = endCell;
    message.textContent = `${obj.name} found a magic ladder to cell ${endCell}!`
  }

  if (snakeMove && !ladderMove) {
    const endCell = snakeMove.end;
    const endRow = 10 - Math.floor(endCell / 10);
    const endCol =
      endCell % 10 === 0
        ? 9
        : endRow % 2 === 0
        ? (endCell % 10) - 1
        : 10 - (endCell % 10);
    obj.x = endCol * cellWidth;
    obj.y = (10 - endRow) * cellHeight;
    obj.current_cell = endCell;
    message.textContent = `Oh no! ${obj.name} was bitten by a snake and slides down to cell ${endCell}!`
  }

  if (ladderMove || snakeMove) {
    setTimeout(() => {
      obj.move();
    }, 300);
  }
}

function createPlayer() {
  const playerElement = document.createElement("div");
  playerElement.id = "player";
  playerElement.style.width = `${playerObj.width / 3}px`;
  playerElement.style.height = `${playerObj.height / 3}px`;
  playerElement.style.backgroundImage = "url('../assets/svg/player.svg')";
  player.appendChild(playerElement);
}

function createComputer() {
  const computerElement = document.createElement("div");
  computerElement.id = "computer";
  computerElement.style.width = `${computerObj.width / 3}px`;
  computerElement.style.height = `${computerObj.height / 3}px`;
  computerElement.style.backgroundImage = "url('../assets/svg/robot.svg')";
  computer.appendChild(computerElement);
}

function createBoard() {
  for (let i = 0; i <= 9; i++) {
    const count = 100 - i * 10;
    for (let j = 0; j < 10; j++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      const num = i % 2 === 0 ? count - j : count - 9 + j;
      cell.id = `cell-${num}`;
      if (j % 2 === 0 && i % 2 === 0) {
        cell.style.backgroundColor = "#cecece";
      } else if (j % 2 !== 0 && i % 2 !== 0) {
        cell.style.backgroundColor = "#cecece";
      } else {
        cell.style.backgroundColor = "white";
      }
      cell.textContent = num;
      ladder.forEach((l) => {
        if (l.start === num || l.end === num) {
          cell.style.backgroundImage = "url('../assets/svg/ladder.svg')";
          cell.style.backgroundColor = l.color;
          cell.textContent = `${l.start} - ${l.end}`;
        }
      });
      snake.forEach((s) => {
        if (s.start === num || s.end === num) {
          cell.style.backgroundImage = "url('../assets/svg/snake.svg')";
          cell.style.backgroundColor = s.color;
          cell.textContent = `${s.start} - ${s.end}`;
        }
      });
      board.appendChild(cell);
    }
  }
}

function initializeGame() {
  createBoard();
  createPlayer();
  createComputer();
}

diceRollBtn.addEventListener("click", rollDice);

window.onload = initializeGame;
