import { useEffect, useState } from "react";
import type { SquareType } from "./board";
import "./square.css";
const Square = ({
  square,
  markSquare,
}: {
  square: SquareType;
  markSquare: () => void;
}) => {
  function squareContent() {
    let imageClasses = "icon";
    let src;
    if (square.mark === 2) {
      src = "crown.png";
    } else if (square.mark === 1) {
      src = "cross.png";
      imageClasses += " cross";
    }
    return <img className={imageClasses} src={src}></img>;
  }

  function errorHighlight() {
    if (square.incorrect) {
      return <img className="incorrect" src="incorrect.png"></img>;
    }
  }

  function changeMark() {
    markSquare();
  }

  return (
    <div
      className="square"
      onClick={changeMark}
      style={{ backgroundColor: square.color }}
    >
      {squareContent()}
      {errorHighlight()}
    </div>
  );
};

export default Square;
