/*
 *
 * "board" is a matrix that holds data about the
 * game board, in a form of BoardSquare objects
 *
 * openedSquares holds the position of the opened squares
 *
 * flaggedSquares holds the position of the flagged squares
 *
 */
let board = [];
let openedSquares = [];
let flaggedSquares = [];
let bombCount = 0;
let squaresLeft = 0;
/*
 *
 * the probability of a bomb in each square
 *
 */
let bombProbability = 3;
let maxProbability = 15;
let difficulty = "Easy";
let rowCount = 9;
let colCount = 9;

const tableComponent = document.getElementById("table-container");
const dropdownButton = document.querySelector(".btn.dropdown-toggle");
const dropdownItems = document.querySelectorAll(".dropdown-item");
const selectedMaxProbability = document.getElementById("max");
const selectedBombProbability = document.getElementById("bomb");
const gameOverPopup = document.getElementById("modal");

function flagCell(event) {
  event.preventDefault();
  let flagIcon;
  if (event.currentTarget.classList.contains("elem-safe")) {
    flagIcon = event.currentTarget.getElementsByTagName("img")[0];
  } else {
    flagIcon = event.currentTarget.getElementsByTagName("img")[1];
  }

  if (flagIcon) {
    event.currentTarget.removeChild(flagIcon);
  } else {
    const flagImage = document.createElement("img");
    flagImage.src = "./utils/images/red-flag.png";
    flagImage.classList.add("flag-icon");
    flagImage.id = "flag-icon";

    event.currentTarget.appendChild(flagImage);
  }
}

function isAlreadyRevealed(i, j) {
  return openedSquares.some((square) => square.row === i && square.col === j);
}

function setMultipleRevealCells(boardMetadata) {
  for (
    let i = Number(boardMetadata.row) - 1;
    i <= Number(boardMetadata.row) + 1;
    i++
  ) {
    for (
      let j = Number(boardMetadata.col) - 1;
      j <= Number(boardMetadata.col) + 1;
      j++
    ) {
      if (
        i >= 0 &&
        i < rowCount &&
        j >= 0 &&
        j < colCount &&
        board[i][j].bombsAround === 0 &&
        !isAlreadyRevealed(i, j)
      ) {
        openedSquares.push({
          row: i,
          col: j,
        });
        setMultipleRevealCells({ row: i, col: j });
      } else if (
        i >= 0 &&
        i < rowCount &&
        j >= 0 &&
        j < colCount &&
        !board[i][j].hasBomb &&
        !isAlreadyRevealed(i, j)
      ) {
        openedSquares.push({
          row: i,
          col: j,
        });
      }
    }
  }
}

function displayCells(cells) {
  cells.forEach((cell) => {
    const elem = document.querySelector(
      `[data-row="${cell.row}"][data-col="${cell.col}"]`
    );
    if (elem) {
      // Remove the flag icon if it exists
      let flagIcon = elem.getElementsByTagName("img")[0];
      if (flagIcon) {
        elem.removeChild(flagIcon);
      }

      elem.classList.add("elem-revealed");
      elem.firstChild?.classList.add("elem-revealed");
    }
  });
}

function endGame() {
  const modal = document.getElementById("modal");
  modal.style.display = "block";
}

function checkWinGame() {
  let countRemainedCells = 0;
  for (let i = 0; i < rowCount; i++) {
    for (let j = 0; j < colCount; j++) {
      if (!isAlreadyRevealed(i, j) && !board[i][j].hasBomb) {
        countRemainedCells++;
      }
    }
  }

  if (countRemainedCells === 0) {
    const modal = document.getElementById("modal-win");
    modal.style.display = "block";
  }
}

function revealCell(event) {
  event.preventDefault();

  const elem = event.currentTarget;

  //remove flag icon if exists
  let flagIcon;
  if (event.currentTarget.classList.contains("elem-safe")) {
    flagIcon = event.currentTarget.getElementsByTagName("img")[0];
  } else {
    flagIcon = event.currentTarget.getElementsByTagName("img")[1];
  }

  if (flagIcon) {
    event.currentTarget.removeChild(flagIcon);
  }

  if (elem.classList.contains("elem-safe")) {
    if (board[elem.dataset.row][elem.dataset.col].bombsAround == 0) {
      setMultipleRevealCells(elem.dataset);
      displayCells(openedSquares);
    } else {
      if (!isAlreadyRevealed(elem.dataset.row, elem.dataset.col)) {
        openedSquares.push({
          row: Number(elem.dataset.row),
          col: Number(elem.dataset.col),
        });
      }
      elem.classList.add("elem-revealed");
      elem.firstChild?.classList.add("elem-revealed");
    }

    checkWinGame();
  } else if (elem.classList.contains("elem-bomb")) {
    elem.classList.add("elem-bomb-revealed");
    elem.firstChild.classList.add("elem-bomb-revealed");
    endGame();
  }
}

dropdownItems.forEach((item) => {
  item.addEventListener("click", function (event) {
    event.preventDefault();
    dropdownButton.textContent = event.target.textContent;

    difficulty = event.target.textContent;
    if (difficulty === "Easy") {
      rowCount = 9;
      colCount = 9;
      bombProbability = 3;
      selectedBombProbability.value = bombProbability;
    } else if (difficulty === "Medium") {
      rowCount = 12;
      colCount = 12;
      bombProbability = 5;
      selectedBombProbability.value = bombProbability;
    } else {
      rowCount = 15;
      colCount = 18;
      bombProbability = 7;
      selectedBombProbability.value = bombProbability;
    }
    generateBoard({
      rowCount: rowCount,
      colCount: colCount,
    });
  });
});

selectedMaxProbability.addEventListener("change", () => {
  maxProbability = selectedMaxProbability.value;
  generateBoard({
    rowCount: rowCount,
    colCount: colCount,
  });
});

selectedBombProbability.addEventListener("change", () => {
  bombProbability = selectedBombProbability.value;
  generateBoard({
    rowCount: rowCount,
    colCount: colCount,
  });
});

function generateBoard(boardMetadata) {
  squaresLeft = boardMetadata.colCount * boardMetadata.rowCount;

  /*
   *
   * "generate" an empty matrix
   *
   */
  for (let i = 0; i < boardMetadata.rowCount; i++) {
    board[i] = new Array(boardMetadata.colCount);
  }

  /*
   *
   * TODO fill the matrix with "BoardSquare" objects, that are in a pre-initialized state
   *
   */
  for (let i = 0; i < boardMetadata.rowCount; i++) {
    for (let j = 0; j < boardMetadata.colCount; j++) {
      board[i][j] = new BoardSquare(false, 0);
    }
  }

  /*
   *
   * "place" bombs according to the probabilities declared at the top of the file
   * those could be read from a config file or env variable, but for the
   * simplicity of the solution, I will not do that
   *
   */
  for (let i = 0; i < boardMetadata.rowCount; i++) {
    for (let j = 0; j < boardMetadata.colCount; j++) {
      // TODO place the bomb, you can use the following formula: Math.random() * maxProbability < bombProbability
      if (Math.random() * maxProbability < bombProbability) {
        bombCount++;
        board[i][j].hasBomb = true;
      }
    }
  }

  /*
   *
   * TODO set the state of the board, with all the squares closed
   * and no flagged squares
   *
   */

  //BELOW THERE ARE SHOWCASED TWO WAYS OF COUNTING THE VICINITY BOMBS

  /*
   *
   * TODO count the bombs around each square
   *
   */

  for (let i = 0; i < boardMetadata.rowCount; i++) {
    for (let j = 0; j < boardMetadata.colCount; j++) {
      if (!board[i][j].hasBomb) {
        countNumberOfBombs(i, j, boardMetadata);
      }
    }
  }

  /*
   *
   * print the board to the console to see the result
   *
   */
  tableComponent.innerHTML = "";
  showGameTable(board, boardMetadata);
}

function countNumberOfBombs(rowPos, colPos, boardMetadata) {
  let countTotalBombs = 0;

  for (let i = rowPos - 1; i <= rowPos + 1; i++) {
    for (let j = colPos - 1; j <= colPos + 1; j++) {
      if (
        i >= 0 &&
        i < boardMetadata.rowCount &&
        j >= 0 &&
        j < boardMetadata.colCount &&
        board[i][j].hasBomb
      ) {
        countTotalBombs++;
      }
    }
  }

  board[rowPos][colPos].bombsAround = countTotalBombs;
}

function showGameTable(board, boardMetadata) {
  for (let i = 0; i < boardMetadata.rowCount; i++) {
    const newRow = document.createElement("div");
    newRow.classList.add("row");

    for (let j = 0; j < boardMetadata.colCount; j++) {
      const newCol = document.createElement("div");
      newCol.classList.add("col");
      newCol.dataset.row = i;
      newCol.dataset.col = j;
      newCol.addEventListener("contextmenu", flagCell);
      newCol.addEventListener("click", revealCell);

      if (board[i][j].hasBomb) {
        // newCol.classList.add("bg-danger");
        newCol.classList.add("elem-bomb");

        const bombImage = document.createElement("img");
        bombImage.src = "./utils/images/bomb.png";
        bombImage.classList.add("bomb-icon");

        newCol.appendChild(bombImage);
      } else {
        newCol.classList.add("elem-safe");

        if (board[i][j].bombsAround !== 0) {
          const textMessage = document.createElement("p");
          textMessage.classList.add("bombs-around");

          textMessage.textContent = board[i][j].bombsAround;
          newCol.appendChild(textMessage);
        }
      }

      newRow.appendChild(newCol);
    }
    tableComponent.appendChild(newRow);
  }
}

/*
 *
 * simple object to keep the data for each square
 * of the board
 *
 */
class BoardSquare {
  constructor(hasBomb, bombsAround) {
    this.hasBomb = hasBomb;
    this.bombsAround = bombsAround;
  }
}

class Pair {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

/*
 * call the function that "handles the game"
 * called at the end of the file, because if called at the start,
 * all the global variables will appear as undefined / out of scope
 *
 */
generateBoard({
  rowCount: rowCount,
  colCount: colCount,
});

// TODO create the other required functions such as 'discovering' a tile, and so on (also make sure to handle the win/loss cases)
