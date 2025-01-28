import React, { useState, useEffect } from "react";
import "../../utilities.css";
import NavBar from "../modules/NavBar";
import { useNavigate, useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { get, post } from "../../utilities.js";
import "./Settings.css";
import "./Info.css";
import "./SinglePlayer_Start.css";
import { updateThemeVariables } from "../../utilities";


const SinglePlayer_Start = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [minLetters, setMinLetters] = useState(location.state?.minLetters || 3);
  const [activeTime, setActiveTime] = useState(location.state?.activeTime || 30);
  const [hideLetter, setHideLetter] = useState(location.state?.hideLetter || false);
  const [hardMode, setHardMode] = useState(location.state?.hardMode || false);
  const [player, setPlayer] = useState(["Player 1"]); //tesp
  const [isLoggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    get("/api/whoami").then((res) => {
      if (!res.name) {
        navigate("/");
        return;
      }
      setLoggedIn(true);
    });

    const savedTheme = localStorage.getItem("selectedTheme");

    if (savedTheme) {
        try {
          const parsedTheme = JSON.parse(savedTheme);
          // Apply the saved theme globally
          updateThemeVariables(parsedTheme.cssVariables);
        } catch (err) {
          console.error("Error parsing saved theme from localStorage:", err);
        }
      }
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

  {
    /* info animation */
  }

  const [prevWord, setPrevWord] = useState("Door"); // Set the last word initially
  const [currWord, setCurrWord] = useState("Handle");
  const [isAnimating, setIsAnimating] = useState(false);
  const words = ["Door", "Handle", "Bar", "Fight", "Back"];

  useEffect(() => {
    const intervalDuration = 4000; // the interval duration
    setIsAnimating(true);

    const interval = setInterval(() => {
      const currentIndex = words.indexOf(currWord);
      const nextIndex = (currentIndex + 1) % 5;
      setPrevWord(currWord);
      setCurrWord(words[nextIndex]);

      // Clean up timeout on the next cycle
    }, intervalDuration);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [prevWord, currWord]); // Only runs when currWord changes

  return !isLoggedIn ? (
    <div className="intermediate-container"></div>
  ) : (
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
                <div className="example-container">
                  <h1 className="prev-word-container">
                    <img src="/images/logo.png" className="info-logo" />
                    <div className="prev-word-text">{prevWord}</div>
                  </h1>
                  <h2 className={`curr-word-text ${isAnimating ? "typing" : ""}`} key={currWord}>
                    <span className={"first-letter"}>{currWord.charAt(0)}</span>
                    {currWord.slice(1)}
                  </h2>
                  <hr className="curr-word-line" />
                </div>
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
  );
};

export default SinglePlayer_Start;
