import "./board.css";
import { useEffect, useState } from "react";
import Square from "./square";
import WinScreen from "./win-screen";

export type SquareType = {
  color: string;
  mark: number;
  hasQueen: boolean;
  row: number;
  col: number;
  incorrect: boolean;
};

type GameBoard = Array<Array<SquareType>>;

type Position = {
  row: number;
  col: number;
};

const Board = () => {
  const width = 5;
  const height = 5;
  const [gameBoard, setGameBoard] = useState<GameBoard | undefined>(undefined);
  const [hasWon, setHasWon] = useState(false);

  useEffect(() => {
    resetBoard();
  }, []);

  function generateGame(): GameBoard | undefined {
    //generate crown positions
    let positions: Position[] = [];
    let randomOptions = Array.from({ length: height }, (_, i) => i);
    for (let row = 0; row < height; row++) {
      let optionsLeft = [...randomOptions].filter((option) =>
        isValidQueen({ row, col: option }, positions)
      );
      if (optionsLeft.length < 1) {
        return undefined;
      }
      let col = optionsLeft[Math.floor(Math.random() * optionsLeft.length)];
      randomOptions = randomOptions.filter((i) => i != col);
      positions.push({ row, col });
    }
    let randomColors = ["crimson", "purple", "green", "yellow", "blue"];
    let game = Array.from({ length: height }, (_, row) => {
      return Array.from({ length: width }, (_, col) => {
        if (positions.find((pos) => pos.col === col && pos.row === row)) {
          let color =
            randomColors[Math.floor(Math.random() * randomColors.length)];
          randomColors = randomColors.filter((i) => i != color);
          return {
            color: color,
            mark: 0,
            hasQueen: true,
            row,
            col,
            incorrect: false,
          };
        } else {
          return {
            color: "white",
            mark: 0,
            hasQueen: false,
            row,
            col,
            incorrect: false,
          };
        }
      });
    });

    const maxDepth = 4;
    let count = 0;
    while (
      count < maxDepth &&
      game.find((row) => row.find((cell) => cell.color === "white"))
    ) {
      for (let rowIndex = 0; rowIndex < game.length; rowIndex++) {
        for (let colIndex = 0; colIndex < game[rowIndex].length; colIndex++) {
          let cell = game[rowIndex][colIndex];
          if (cell.hasQueen || (count > 0 && cell.color !== "white")) {
            // expand around it
            let surroundingCells = [];
            if (rowIndex > 0) {
              if (colIndex > 0) {
                surroundingCells.push(game[rowIndex - 1][colIndex - 1]);
                surroundingCells.push(game[rowIndex][colIndex - 1]);
              }
              if (colIndex < game[rowIndex].length - 1) {
                surroundingCells.push(game[rowIndex - 1][colIndex + 1]);
                surroundingCells.push(game[rowIndex][colIndex + 1]);
              }
              surroundingCells.push(game[rowIndex - 1][colIndex]);
            }
            if (rowIndex < game.length - 1) {
              if (colIndex > 0) {
                surroundingCells.push(game[rowIndex + 1][colIndex - 1]);
                surroundingCells.push(game[rowIndex][colIndex - 1]);
              }
              if (colIndex < game[rowIndex].length - 1) {
                surroundingCells.push(game[rowIndex + 1][colIndex + 1]);
                surroundingCells.push(game[rowIndex][colIndex + 1]);
              }
              surroundingCells.push(game[rowIndex + 1][colIndex]);
            }
            for (let surroundingCell of surroundingCells) {
              if (surroundingCell.color === "white") {
                surroundingCell.color = cell.color;
              }
            }
          }
        }
      }
      count++;
    }
    return game;
  }

  function generateNGames(n: number): GameBoard[] {
    let games = [];
    let count = 0;
    const max = n + 10;
    while (games.length < n && count < max) {
      let game = generateGame();
      if (game) {
        games.push(game);
      }
      count++;
    }
    return games;
  }

  function createGameBoard(): GameBoard {
    let games = generateNGames(5);
    return games[0];
  }

  function isValidQueen(
    positionToCheck: Position,
    currentPositions: Position[]
  ): boolean {
    for (let position of currentPositions) {
      if (position.col === positionToCheck.col) {
        return false;
      } else if (
        position.col - 1 <= positionToCheck.col &&
        positionToCheck.col <= position.col + 1 &&
        position.row - 1 <= positionToCheck.row &&
        positionToCheck.row <= position.row + 1
      ) {
        return false;
      }
    }
    return true;
  }

  function markSquare(rowIndex: number, colIndex: number) {
    if (gameBoard) {
      let modifiedBoard = structuredClone(gameBoard);
      let existingSquare = modifiedBoard[rowIndex][colIndex];
      let mark = (existingSquare.mark + 1) % 3;

      existingSquare.mark = mark;
      checkMistakes(modifiedBoard);
      let hasWon = checkWin(modifiedBoard);
      if (hasWon) {
        setHasWon(true);
      }

      // setGameBoard([
      //   ...gameBoard.slice(0, rowIndex),
      //   [
      //     ...gameBoard[rowIndex].slice(0, colIndex),
      //     {
      //       ...existingSquare,
      //       mark,
      //     },
      //     ...gameBoard[rowIndex].slice(colIndex + 1),
      //   ],
      //   ...gameBoard.slice(rowIndex + 1),
      // ]);
      setGameBoard(modifiedBoard);
    }
  }

  function checkMistakes(modifiedBoard: GameBoard): GameBoard | undefined {
    if (modifiedBoard) {
      for (let row of modifiedBoard) {
        for (let square of row) {
          let rowError = false;
          let colError = false;
          let colorError = false;
          let surroundError = false;
          //check row
          let queenCount = 0;
          for (let innerSquare of modifiedBoard[square.row]) {
            if (innerSquare.mark === 2) {
              queenCount++;
            }
          }
          if (queenCount > 1) {
            rowError = true;
          }
          // check col
          queenCount = 0;
          for (let rowIndex = 0; rowIndex < modifiedBoard.length; rowIndex++) {
            let innerSquare = modifiedBoard[rowIndex][square.col];
            if (innerSquare.mark === 2) {
              queenCount++;
            }
          }
          if (queenCount > 1) {
            colError = true;
          }
          // check same color
          queenCount = 0;
          for (let rowIndex = 0; rowIndex < modifiedBoard.length; rowIndex++) {
            for (
              let colIndex = 0;
              colIndex < modifiedBoard[0].length;
              colIndex++
            ) {
              let innerSquare = modifiedBoard[rowIndex][colIndex];
              if (
                innerSquare.color === square.color &&
                innerSquare.mark === 2
              ) {
                queenCount++;
              }
            }
          }
          if (queenCount > 1) {
            colorError = true;
          }
          // check if touching
          queenCount = 0;
          for (
            let rowIndex = square.row - 1 >= 0 ? square.row - 1 : 0;
            rowIndex < (square.row + 1 < width ? square.row + 2 : width);
            rowIndex++
          ) {
            for (
              let colIndex = square.col - 1 >= 0 ? square.col - 1 : 0;
              colIndex < (square.col + 1 < height ? square.col + 2 : height);
              colIndex++
            ) {
              let innerSquare = modifiedBoard[rowIndex][colIndex];
              if (innerSquare.mark === 2 && square.mark === 2) {
                queenCount++;
              }
            }
          }
          if (queenCount > 1) {
            surroundError = true;
          }

          square.incorrect =
            rowError || colError || colorError || surroundError;
        }
      }
      return modifiedBoard;
    }
  }

  function checkWin(modifiedBoard: GameBoard): boolean {
    let queenCount = 0;
    let mistakeCount = 0;
    for (let rowIndex = 0; rowIndex < modifiedBoard.length; rowIndex++) {
      for (let colIndex = 0; colIndex < modifiedBoard[0].length; colIndex++) {
        let innerSquare = modifiedBoard[rowIndex][colIndex];
        if (innerSquare.mark === 2) {
          queenCount++;
        }
        if (innerSquare.incorrect) {
          mistakeCount++;
        }
      }
    }
    return queenCount === modifiedBoard.length && mistakeCount < 1;
  }

  function resetBoard() {
    setHasWon(false);
    setGameBoard(createGameBoard);
  }

  function loadingContent() {
    if (gameBoard) {
      return (
        <div className="grid">
          {gameBoard.map((row, rowIndex) => (
            <div className="row" key={rowIndex}>
              {row.map((square, colIndex) => (
                <Square
                  square={square}
                  markSquare={() => markSquare(rowIndex, colIndex)}
                  key={colIndex}
                ></Square>
              ))}
            </div>
          ))}
          <WinScreen showing={hasWon} playAgain={resetBoard}></WinScreen>
        </div>
      );
    } else {
      return <div>loading...</div>;
    }
  }

  return loadingContent();
};

export default Board;
