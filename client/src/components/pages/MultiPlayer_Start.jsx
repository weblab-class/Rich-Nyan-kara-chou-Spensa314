import React, { useState } from "react";
import "../../utilities.css";
import NavBar from "../modules/NavBar";
import { useNavigate, useParams } from "react-router-dom";
import "./Settings.css";
import "./MultiPlayer_Start.css";
import { post } from "../../utilities";

const MultiPlayer_Start = () => {
  const { roomCode } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [minLetters, setMinLetters] = useState(3);
  const [activeTime, setActiveTime] = useState(30);
  const [hideLetter, setHideLetter] = useState(false);
  const [hardMode, setHardMode] = useState(false);
  const [players, setPlayers] = useState(["Player 1", "Player 2", "Player 3", "Player 4"]); //temp
  const navigate = useNavigate();

  const onStartClick = () => {
    const gameDetails = {
      roomCode,
      players: players,
      timeLimit: activeTime,
      hideLetter,
      hardMode,
      minWordLength: minLetters,
      gameState: "waiting",
    };
    post("/api/startGame", gameDetails).then((res) => {
      console.log(res);
      navigate(`/game/${roomCode}`);
    });
  };

  const onSettingsClick = () => {
    setIsModalOpen(true);
  };
  const onExitClick = () => {
    setIsModalOpen(false);
  };

  const on30Click = () => {
    setActiveTime(30);
  };
  const on60Click = () => {
    setActiveTime(60);
  };
  const onHideLetterClick = () => {
    setHideLetter(!hideLetter);
  };
  const onHardModeClick = () => {
    setHardMode(!hardMode);
  };
  const onSliderChange = (event) => {
    setMinLetters(event.target.value);
  };
  // Replace with player's actual logo
  return (
    <>
      <NavBar />
      <div className="multiplayer-container">
        <div onClick={onSettingsClick} className="mp-settings-button mp-page-button">
          Game Settings
        </div>
        <div onClick={onStartClick} className="mp-start-button mp-page-button">
          Start Game
        </div>
        <div className="mp-players-title">Players</div>
        <div className="mp-players-list">
          {players.map((player) => (
            <div key={player} className="mp-players-item">
              <img src="../../../default.png" alt="default" className="mp-player-logo" />
              <div className="mp-player-name">{player}</div>
            </div>
          ))}
        </div>

        <div className="mp-room-code">Room Code: {roomCode}</div>

        {isModalOpen && (
          <div className="settings-modal">
            <div className="settings-modal-content">
              <div className="settings-modal-close" onClick={onExitClick}>
                Close Settings
              </div>
              <div className="settings-modal-minLetters">
                <div className="settings-modal-minLetters-title">Min Letters</div>
                <input
                  className="settings-modal-minLetters-slider"
                  type="range"
                  id="minLetters"
                  min="3"
                  max="6"
                  value={minLetters}
                  onChange={onSliderChange}
                />
                <div className="settings-modal-minLetters-value">{minLetters}</div>
              </div>
              <div className="settings-modal-time">
                <div className="settings-modal-time-title">Time (seconds)</div>
                <div className="settings-modal-time-buttons">
                  <div onClick={on30Click} className={activeTime === 30 ? "active" : ""}>
                    30
                  </div>
                  <div onClick={on60Click} className={activeTime === 60 ? "active" : ""}>
                    60
                  </div>
                </div>
              </div>
              <div className="settings-modal-hideLetter">
                Hide Next Letter
                <label className="switch">
                  <input type="checkbox" onClick={onHideLetterClick} />
                  <span className="slider round"></span>
                </label>
              </div>
              <div className="settings-modal-hardMode">
                Hard Mode
                <label className="switch">
                  <input type="checkbox" onClick={onHardModeClick} />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MultiPlayer_Start;
