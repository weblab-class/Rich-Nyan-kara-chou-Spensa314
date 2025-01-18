import React, { useState } from "react";
import "../../utilities.css";
import NavBar from "../modules/NavBar";
import { useNavigate, useParams } from "react-router-dom";
import "./Settings.css";

import "./SinglePlayer_Start.css";

const SinglePlayer_Start = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [minLetters, setMinLetters] = useState(3);
  const [activeTime, setActiveTime] = useState(30);
  const [hideLetter, setHideLetter] = useState(false);
  const [hardMode, setHardMode] = useState(false);
  const [player, setPlayer] = useState(["Player 1"]); //tesp
  const navigate = useNavigate();

  const onStartClick = () => {
    navigate(`/game/solo`);
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
      <div className="singleplayer-container">
        <div onClick={onSettingsClick} className="sp-settings-button sp-page-button">
          Game Settings
        </div>
        <div onClick={onStartClick} className="sp-start-button sp-page-button">
          Start Game
        </div>

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

export default SinglePlayer_Start;
