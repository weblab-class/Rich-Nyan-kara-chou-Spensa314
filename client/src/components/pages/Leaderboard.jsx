import React, { useState, useContext, useEffect } from "react";
import "../../utilities.css";
import NavBar from "../modules/NavBar";
import { useNavigate, useLocation } from "react-router-dom";
import { get } from "../../utilities";
import { UserContext } from "../App";

import "./Leaderboard.css";

const Leaderboard = () => {
  const { username, profilepicture, userId } = useContext(UserContext);
  const [clickedPlayerId, setClickedPlayerId] = useState(null); // Track clicked player

  const [topPlayers, setTopPlayers] = useState([]);
  const location = useLocation();
  const [minLetters, setMinLetters] = useState(location.state?.minLetters || 3);
  const [activeTime, setActiveTime] = useState(location.state?.activeTime || 30);
  const [hideLetter, setHideLetter] = useState(location.state?.hideLetter || false);
  const [hardMode, setHardMode] = useState(location.state?.hardMode || false);

  const navigate = useNavigate();
  const [isLoggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    //todo neha: use usercontext later for this
    get("/api/whoami").then((res) => {
      if (!res.name) {
        navigate("/");
        return;
      }
      setLoggedIn(true);
    });
  });

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const settings = JSON.stringify({
          minLetters: parseInt(minLetters, 10), //10 is the base that's so cool
          activeTime: parseInt(activeTime, 10),
          hideLetter: hideLetter,
          hardMode: hardMode,
        });
        console.log("Sending: ", userId, settings);
        const response = await get("/api/leaderboard", { userId, settings });

        if (response.error) {
          console.error("Error in response:", response.error);
        } else {
          setTopPlayers(response.topPlayers || []);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    };
    fetchLeaderboardData();
  }, [userId, minLetters, activeTime, hideLetter, hardMode]);

  const handlePlayerClick = (playerId) => {
    // Toggle visibility of queries for the clicked player
    setClickedPlayerId(clickedPlayerId === playerId ? null : playerId);
  };

  {
    /**settings adjustments */
  }
  const onMinLettersClick = () => {
    if (parseInt(minLetters, 10) === 6) {
      setMinLetters(3);
    } else {
      setMinLetters(parseInt(minLetters, 10) + 1);
    }
  };

  const onTimeClick = () => {
    if (parseInt(activeTime, 10) === 30) {
      setActiveTime(60);
    } else {
      setActiveTime(30);
    }
  };

  const onHardModeClick = () => {
    setHardMode(!hardMode);
  };

  const onNextLetterClick = () => {
    setHideLetter(!hideLetter);
  };

  return !isLoggedIn ? (
    <div className="intermediate-container"></div>
  ) : (
    <>
      <NavBar />
      <div className="leaderboard-page-container">
        <h1 className="leaderboard-title">Leaderboard</h1>
        <div className="leaderboard-list-container">
          {topPlayers.map((player, index) => (
            <div
              key={player.playerId}
              className={`leaderboard-player-container ${
                index === 0
                  ? "top-player-1"
                  : index === 1
                    ? "top-player-2"
                    : index === 2
                      ? "top-player-3"
                      : ""
              } ${player.playerId === userId ? "glowy" : ""}`}
              onClick={() => handlePlayerClick(player.playerId)} // Add click event handler
            >
              <div
                className={`leaderboard-place ${
                  index === 0
                    ? "top-player-1-place"
                    : index === 1
                      ? "top-player-2-place"
                      : index === 2
                        ? "top-player-3-place"
                        : ""
                }`}
              >
                {index + 1}
              </div>
              <div className="leaderboard-player-score-container">
                {clickedPlayerId === player.playerId ? (
                  // When clicked, show the query list
                  <div className="query-list-container show">
                    {player.queries ? player.queries.join(" - ") : "No queries available"}
                  </div>
                ) : (
                  // When not clicked, show the rank, username, and score
                  <>
                    <div className="leaderboard-player">
                      {player.playerId === userId ? `${player.name} (you)` : player.name}
                    </div>
                    <div className="leaderboard-player-score">
                      {parseInt(player.highScore).toLocaleString()}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="leaderboard-settings-container">
          <div className="leaderboard-dropdown-container" onClick={onMinLettersClick}>
            Min Letters: {minLetters}
          </div>
          <div className="leaderboard-dropdown-container" onClick={onTimeClick}>
            Time: {activeTime}
          </div>
          <div className="leaderboard-dropdown-container" onClick={onHardModeClick}>
            {hardMode ? "Hard Mode" : "Normal Mode"}
          </div>
          <div className="leaderboard-dropdown-container" onClick={onNextLetterClick}>
            {hideLetter ? "Next Letter: Hidden" : "Next Letter: Shown"}
          </div>
        </div>
      </div>
      ;
    </>
  );
};

export default Leaderboard;
