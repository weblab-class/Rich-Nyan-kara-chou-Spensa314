import React, { useState } from "react";
import "../../utilities.css";
import NavBar from "../modules/NavBar";
import { useNavigate } from "react-router-dom";

import "./Leaderboard.css";

const Leaderboard = () => {
  const [players, setPlayers] = useState([
    { name: "Player 1", score: "1,000,000,000,000,000,000", place: "1" },
    { name: "Player 2", score: "900,000", place: "2" },
    { name: "Player 3", score: "800,000", place: "3" },
    { name: "Player 4", score: "700,000", place: "4" },
    { name: "Player 5", score: "600,000", place: "5" },
  ]);

  return (
    <>
      <NavBar />
      <div className="leaderboard-page-container">
        <h1 className="leaderboard-title">Leaderboard</h1>
        <div className="leaderboard-list-container">
          {players.map((player) => (
            <div
              key={player}
              className={`leaderboard-player-container ${player.place === "1" ? "top-player-1" : player.place === "2" ? "top-player-2" : player.place === "3" ? "top-player-3" : ""}`}
            >
              <div
                key={player}
                className={`leaderboard-place ${player.place === "1" ? "top-player-1-place" : player.place === "2" ? "top-player-2-place" : player.place === "3" ? "top-player-3-place" : ""}`}
              >
                {player.place}{" "}
              </div>
              <div className="leaderboard-player">
                {player.name}: {player.score}
              </div>
            </div>
          ))}
        </div>
      </div>
      ;
    </>
  );
};

export default Leaderboard;
