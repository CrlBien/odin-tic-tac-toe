function Player(name, sign) {
  return { name, sign };
}

const Board = (() => {
  let boardArray = Array(9).fill("");

  const isCellEmpty = (index) => boardArray[index] === "";
  const getBoard = () => boardArray;
  const markCell = (index, sign) => (boardArray[index] = sign);
  const resetBoard = () => (boardArray = Array(9).fill(""));

  return { isCellEmpty, getBoard, markCell, resetBoard };
})();

const GameLogic = (() => {
  let currPlayer;
  let isGameOver = false;
  let winner = null;
  let moveCount = 0;
  let winningCombo = [];

  const board = Board;
  const player1 = Player("Player 1", "X");
  const player2 = Player("Player 2", "O");

  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const startGame = () => {
    board.resetBoard();
    currPlayer = player1;
    moveCount = 0;
    isGameOver = false;
    winner = null;
    winningCombo = [];
  };

  const switchPlayer = () => {
    currPlayer = currPlayer === player1 ? player2 : player1;
  };

  const checkWinner = () => {
    if (moveCount < 5) return false;

    const b = board.getBoard();
    for (let combo of winPatterns) {
      if (combo.every((i) => b[i] === currPlayer.sign)) {
        winningCombo = combo;
        return true;
      }
    }
    return false;
  };

  const checkTie = () => moveCount === 9 && !winner;

  const playMove = (index) => {
    if (isGameOver || !board.isCellEmpty(index)) return;

    board.markCell(index, currPlayer.sign);
    moveCount++;

    if (checkWinner()) {
      winner = currPlayer;
      isGameOver = true;
      return { result: "win", player: winner, combo: winningCombo };
    }

    if (checkTie()) {
      isGameOver = true;
      return { result: "tie" };
    }

    switchPlayer();
    return { result: "continue" };
  };

  const getCurrentPlayer = () => currPlayer;
  const getBoard = board.getBoard;
  const resetGame = startGame;

  return { playMove, getCurrentPlayer, getBoard, resetGame };
})();

const DisplayLogic = (() => {
  const cells = document.querySelectorAll(".cell");
  const message = document.querySelector(".message");
  const resetBtn = document.querySelector(".reset-btn");

  const icons = {
    X: "assets/cross.svg",
    O: "assets/circle.svg",
  };

  const renderBoard = () => {
    const board = GameLogic.getBoard();
    cells.forEach((cell, i) => {
      cell.innerHTML = "";
      cell.classList.remove("highlight");
      const value = board[i];
      if (value) {
        const img = document.createElement("img");
        img.src = icons[value];
        img.alt = value;
        img.classList.add("mark");
        cell.appendChild(img);
      }
    });
  };

  const showMessage = (text) => {
    message.textContent = text;
  };

  const highlightWinningCells = (combo) => {
    combo.forEach((i) => {
      cells[i].classList.add("highlight");
    });
  };

  const handleCellClick = (e) => {
    const index = e.target.dataset.index;
    const result = GameLogic.playMove(index);
    renderBoard();

    if (!result) return;

    if (result.result === "win") {
      showMessage(`${result.player.name} (${result.player.sign}) wins!`);
      highlightWinningCells(result.combo);
      resetBtn.style.display = "block";
    } else if (result.result === "tie") {
      showMessage("It's a tie!");
      resetBtn.style.display = "block";
    } else {
      const nextPlayer = GameLogic.getCurrentPlayer();
      showMessage(`${nextPlayer.name}'s turn (${nextPlayer.sign})`);
    }
  };

  const restartGame = () => {
    GameLogic.resetGame();
    renderBoard();
    showMessage(
      `${GameLogic.getCurrentPlayer().name}'s turn (${
        GameLogic.getCurrentPlayer().sign
      })`
    );
    resetBtn.style.display = "none";
  };

  cells.forEach((cell) => cell.addEventListener("click", handleCellClick));
  resetBtn.addEventListener("click", restartGame);

  restartGame();
})();
