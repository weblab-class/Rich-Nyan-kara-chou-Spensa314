import React, { useState } from "react";
import "../../utilities.css";
import NavBar from "../modules/NavBar";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import {get, post} from "../../utilities.js";
import "./Settings.css";
import "./Info.css";
import "./SinglePlayer_Start.css";

const SinglePlayer_Start = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [minLetters, setMinLetters] = useState(3);
  const [activeTime, setActiveTime] = useState(30);
  const [hideLetter, setHideLetter] = useState(false);
  const [hardMode, setHardMode] = useState(false);
  const [player, setPlayer] = useState(["Player 1"]); //tesp
  const [isLoggedIn, setLoggedIn] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    get("/api/whoami").then((res) => {
        console.log(res);
        if (!res.name) {
            navigate("/");
            return;
        }
        setLoggedIn(true);
      })
  });

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const onInfoButtonClick = () => {
    setIsInfoModalOpen(true);
  };

  const onInfoExitClick = () => {
    setIsInfoModalOpen(false);
  };

  const onStartClick = () => {
    navigate(`/game/solo`, {
      state: {
        minLetters,
        activeTime,
        hideLetter,
        hardMode,
        player,
      },
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
    isLoggedIn && (
    <>
      <NavBar />
      <div className="singleplayer-container">
        <div onClick={onSettingsClick} className="sp-settings-button sp-page-button">
          Game Settings
        </div>
        <div onClick={onStartClick} className="sp-start-button sp-page-button">
          Start Game
        </div>

        <div onClick={onInfoButtonClick} className="info-button">
          ?
        </div>

        {isInfoModalOpen && (
          <div className="room-modal-overlay">
            <div className="info-modal-container">
              <div className="info-text-container">
                <div className="info-title">How to Play</div>
                <div className="info-text">
                  <span className="info-text-title">Objective: </span> Score the highest points by
                  entering the trendiest search terms.
                </div>
                <div className="info-text">
                  <span className="info-text-title">Game Mechanics: </span> You're given a starting
                  word and the starting letter for the following word in the phrase. You are to fill
                  in the following word. Once you enter your phrase, the word you filled in will now
                  become the starting word. This process is repeated within the given time limit.
                </div>
                <div className="info-text">
                  <span className="info-text-title">Example: </span>
                </div>
                <div className="info-text">
                  "Apple P": "Apple P<span className="info-text-color">ie</span>"
                </div>
                <div className="info-text">
                  {" "}
                  "Pie C": "Pie C<span className="info-text-color">hart</span>"
                </div>
              </div>
              <div onClick={onInfoExitClick} className="room-button info-close-button">
                X
              </div>
            </div>
          </div>
        )}

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
    )
  );
};

export default SinglePlayer_Start;
