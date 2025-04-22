import "./win-screen.css";

const WinScreen = ({
  showing,
  playAgain,
}: {
  showing: boolean;
  playAgain: () => void;
}) => {
  return (
    <div className={`screen ${!showing ? "hidden" : ""}`}>
      <div>Congrats, you win!</div>
      <button onClick={() => playAgain()}>Play again</button>
    </div>
  );
};

export default WinScreen;
