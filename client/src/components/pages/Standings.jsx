import React, { useState } from "react";
import "../../utilities.css";
import NavBar from "../modules/NavBar";
import { useNavigate } from "react-router-dom";
import "./Standings.css";

const Standings = () => {
  const navigate = useNavigate();
  const handleNextClick = () => {
    navigate(`/results/${roomCode}`);
    {
      /**ryan: insert info ab room code */
    }
  };

  const [players, setPlayers] = useState([
    { name: "Player 1", score: "1,000,000,000,000,000,000", place: "1" },
    { name: "Player 2", score: "900,000", place: "2" },
    { name: "Player 3", score: "800,000", place: "3" },
    { name: "Player 4", score: "700,000", place: "4" },
    { name: "Player 5", score: "600,000", place: "5" },
  ]);
  {
    /* dummy variables */
  }

  return (
    <>
      <NavBar />
      <div className="standings-container">
        <h1 className="standings-title">Standings</h1>
        <div className="standings-list-container">
          {players.map((player) => (
            <div
              key={player}
              className={`standings-player-container ${player.place === "1" ? "s-top-player-1" : player.place === "2" ? "s-top-player-2" : player.place === "3" ? "s-top-player-3" : ""}`}
            >
              <div
                key={player}
                className={`standings-place ${player.place === "1" ? "s-top-player-1-place" : player.place === "2" ? "s-top-player-2-place" : player.place === "3" ? "s-top-player-3-place" : ""}`}
              >
                {player.place}{" "}
              </div>
              <div className="standings-player">
                {player.name}: {player.score}
              </div>
            </div>
          ))}
        </div>
        <div onClick={handleNextClick}>
          <img src="/images/next.png" alt="Next" className="mp-go-results" />
        </div>
      </div>
    </>
  );
};

export default Standings;
