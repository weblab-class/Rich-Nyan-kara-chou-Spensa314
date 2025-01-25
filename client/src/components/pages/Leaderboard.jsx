import React, { useEffect, useState } from "react";
import "../../utilities.css";
import NavBar from "../modules/NavBar";
import { useNavigate } from "react-router-dom";
import {get} from "../../utilities";
import "./Leaderboard.css";

const Leaderboard = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    get("/api/whoami").then((res) => {
        if (!res.name) {
            navigate("/");
            return;
        }
        setLoggedIn(true);
      })
  });
  const [players, setPlayers] = useState([
    { name: "Player 1", score: "1000000000000", place: "1" },
    { name: "Player 2", score: "900000", place: "2" },
    { name: "Player 3", score: "800000", place: "3" },
    { name: "Player 4", score: "700000", place: "4" },
    { name: "Player 5", score: "600000", place: "5" },
  ]);

  {
    /**settings adjustments */
  }
  const [minLetters, setMinLetters] = useState(3);
  const onMinLettersClick = () => {
    if (minLetters === 6) {
      setMinLetters(3);
    } else {
      setMinLetters(minLetters + 1);
    }
  };

  const [time, setTime] = useState(30);
  const onTimeClick = () => {
    if (time === 30) {
      setTime(60);
    } else {
      setTime(30);
    }
  };

  const [isHardMode, setIsHardMode] = useState(false);
  const onHardModeClick = () => {
    setIsHardMode(!isHardMode);
  };

  const [isLetterHidden, setIsLetterHidden] = useState(false);
  const onNextLetterClick = () => {
    setIsLetterHidden(!isLetterHidden);
  };

  return (
    isLoggedIn && (
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
              <div className="leaderboard-player-score-container">
                <div className="leaderboard-player">{player.name}</div>
                <div className="leaderboard-player-score">
                  {parseInt(player.score).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="leaderboard-settings-container">
          <div className="leaderboard-dropdown-container" onClick={onMinLettersClick}>
            Min Letters: {minLetters}
          </div>
          <div className="leaderboard-dropdown-container" onClick={onTimeClick}>
            Time: {time}
          </div>
          <div className="leaderboard-dropdown-container" onClick={onHardModeClick}>
            {isHardMode ? "Hard Mode" : "Normal Mode"}
          </div>
          <div className="leaderboard-dropdown-container" onClick={onNextLetterClick}>
            {isLetterHidden ? "Next Letter: Hidden" : "Next Letter: Shown"}
          </div>
        </div>
      </div>
      ;
    </>
    )
  );
};

export default Leaderboard;
