import React, { useState, useContext, useEffect } from "react";
import "../../utilities.css";
import NavBar from "../modules/NavBar";
import { useNavigate, useLocation } from "react-router-dom";
import { get } from "../../utilities";
import { UserContext } from "../App";
import "./Leaderboard.css";

const Leaderboard = () => {
  const { username, profilepicture, userId } = useContext(UserContext);
  const [clickedPlayer, setClickedPlayer] = useState(null); // Store clicked player data
  const [topPlayers, setTopPlayers] = useState([]);
  const location = useLocation();
  const [minLetters, setMinLetters] = useState(location.state?.minLetters || 3);
  const [activeTime, setActiveTime] = useState(location.state?.activeTime || 30);
  const [hideLetter, setHideLetter] = useState(location.state?.hideLetter || false);
  const [hardMode, setHardMode] = useState(location.state?.hardMode || false);

  const navigate = useNavigate();
  const [isLoggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    get("/api/whoami").then((res) => {
      if (!res.name) {
        navigate("/");
        return;
      }
      setLoggedIn(true);
    });
  }, [navigate]);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const settings = JSON.stringify({
          minLetters: parseInt(minLetters, 10),
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

  const handlePlayerClick = (player) => {
    // Show modal with the clicked player's queries
    setClickedPlayer(player);
  };

  const closeModal = () => {
    setClickedPlayer(null);
  };

  const onMinLettersClick = () => {
    setMinLetters((prev) => (prev === 6 ? 3 : prev + 1));
  };

  const onTimeClick = () => {
    setActiveTime((prev) => (prev === 30 ? 60 : 30));
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
              onClick={() => handlePlayerClick(player)}
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
                <div className="leaderboard-player">
                  {player.playerId === userId ? `${player.name} (you)` : player.name}
                </div>
                <div className="leaderboard-player-score">
                  {parseInt(player.highScore).toLocaleString()}
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

      {/* Modal */}
      {clickedPlayer && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content-container" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{clickedPlayer.name}'s Queries</h2>
            <div className="modal-list-container">
              {clickedPlayer.queries && clickedPlayer.queries.length > 0 ? (
                // Parse the queries and display them
                <div>
                  {JSON.parse(clickedPlayer.queries).map(([query, value], idx) => (
                    <div key={idx} className="modal-result-container">
                      <div className="modal-result-term">{query}</div>
                      <div className="modal-result-query">{parseInt(value).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-queries">No queries available</p>
              )}
            </div>
            <div className="close-modal-button" onClick={closeModal}>
              X
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Leaderboard;
