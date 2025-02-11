import React, { useEffect, useState } from "react";
import "../../utilities.css";
import NavBar from "../modules/NavBar";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "./Settings.css";
import "./Info.css";
import "./MultiPlayer_Start.css";
import { post, get } from "../../utilities";
import { updateThemeVariables } from "../../utilities";

import { socket } from "../../client-socket"; // Import Socket.IO client

const MultiPlayer_Start = () => {
  const location = useLocation();
  const [host, setHost] = useState("");
  const [isHost, setIsHost] = useState(false);
  const { roomCode } = useParams(); // Get room code from URL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [minLetters, setMinLetters] = useState(3);
  const [activeTime, setActiveTime] = useState(30);
  const [hideLetter, setHideLetter] = useState(false);
  const [hardMode, setHardMode] = useState(false);
  const [players, setPlayers] = useState([]); // Player list from the server
  const [username, setUsername] = useState(null);
  const [id, setId] = useState(null);
  const [started, setStarted] = useState(false);
  const navigate = useNavigate();
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isLoggedIn, setLoggedIn] = useState(false);

  const onInfoButtonClick = () => {
    setIsInfoModalOpen(true);
  };

  const onInfoExitClick = () => {
    setIsInfoModalOpen(false);
  };

  useEffect(() => {
    get(`/api/getRoom/${roomCode}`).then((res) => {
      //console.log(res);
      if (res === true) {
        navigate("/home"); // Redirect to the homepage or another relevant page
        return;
      }
      get("/api/whoami").then((res) => {
        if (!res.name) {
          navigate("/");
          return;
        }

        setLoggedIn(true);
        if (res.name !== null) {
          setUsername(res.name);
          setId(res._id);
          socket.emit("joinRoom", {
            roomId: roomCode,
            user: res,
            settings: { hideLetter, hardMode, minWordLength: minLetters, type: "false" },
          });
        }
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
    if (!username) {
      //   console.error("Username is not defined");
      return;
    }

    // Listen for updates to the player list
    socket.on("updatePlayers", (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    socket.on("updateHost", (updatedHost) => {
      setHost(updatedHost);
      if (updatedHost === id) {
        setIsHost(true);
        setMinLetters(location.state.minLetters);
        setActiveTime(location.state.time);
        setHideLetter(location.state.hideLetter);
        setHardMode(location.state.hardMode);
      }
    });

    const handleBeforeUnload = () => {
      if (!started) {
        socket.emit("leaveRoom", roomCode);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    const handleNavBarClick = (event) => {
      const target = event.target.closest(".navbar-link"); // Check for navbar-link class
      if (target && !started) {
        socket.emit("leaveRoom", roomCode);
      }
    };

    const navBar = document.querySelector(".navbar-container");
    navBar?.addEventListener("click", handleNavBarClick);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      socket.off("updatePlayers");
      socket.off("updateHost");
      navBar?.removeEventListener("click", handleNavBarClick);
    };
  }, [roomCode, username, id, started]);

  const onStartClick = () => {
    const gameDetails = {
      roomCode,
      players: players.map((player) => player.name),
      timeLimit: activeTime,
      hideLetter,
      hardMode,
      minWordLength: minLetters,
      gameState: "waiting",
    };

    const resetScoreFlag = async () => {
      try {
        await post("/api/reset-score-update");
        //console.log("Score update flag reset for new game.");
      } catch (err) {
        console.error("Error resetting score flag:", err);
      }
    };

    resetScoreFlag();

    // Notify the server to start the game
    post(`/api/startGame/${roomCode}/${id}`, gameDetails).then((res) => {
      //console.log(res);
      if (res.error) {
        alert(res.error);
        return;
      }
      navigate(`/game/${roomCode}`, {
        state: {
          roomId: roomCode,
          userId: socket.id,
          userName: username,
          minLetters,
          hideLetter,
          hardMode,
        },
      });
    });
  };

  useEffect(() => {
    socket.on("gameStarted", ({ message, gameState }) => {
      //console.log(message);
      setStarted(true);
      // Debug message
      // Update game state or navigate to the game page
      get("/api/whoami").then((res) => {
        get(`/api/roomer/${roomCode}/${res._id}`).then((res) => {
          navigate(`/game/${roomCode}`, {
            state: {
              roomId: roomCode,
              userId: socket.id,
              userName: username,
              minLetters: res.minWordLength,
              hideLetter: res.hideLetter,
              hardMode: res.hardMode,
            },
          });
        });
      });
    });

    return () => {
      socket.off("gameStarted");
    };
  }, [navigate]);

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

  {
    /* copy room code on click */
  }
  const [copied, setCopied] = useState(false);

  const handleCopyClick = () => {
    navigator.clipboard
      .writeText(roomCode)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((error) => {
        console.error("Failed to copy: ", error);
      });
  };

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
      <div className="multiplayer-container">
        {isHost && (
          <div onClick={onSettingsClick} className="mp-settings-button mp-page-button">
            Game Settings
          </div>
        )}
        <div className="center-players">
          {isHost && (
            <div onClick={onStartClick} className="mp-start-button mp-page-button">
              Start Game
            </div>
          )}
          <div className="mp-players-title">Players</div>
          <div className="mp-players-list">
            {players.map((player) => (
              <div key={player.id} className={`mp-players-item`}>
                <img
                  src={player.photo}
                  alt="default"
                  className="mp-player-logo"
                  onError={(e) => (e.target.src = "/images/default.png")}
                />
                <div
                  className={`mp-player-name ${player.userId === host ? "s-host" : "s-not-host"}`}
                >
                  {player.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mp-room-code" onClick={handleCopyClick}>
          Room Code: {roomCode}
          {copied ? (
            <img src="/images/check.png" alt="Check" className="mp-room-copy" />
          ) : (
            <img src="/images/copy.png" alt="Copy" className="mp-room-copy" />
          )}{" "}
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
                  <span className="info-text-title">Objective: </span> Score as many points as
                  possible by entering the trendiest search terms.
                </div>
                <div className="info-text">
                  <span className="info-text-title">Game Mechanics: </span> You are finding the
                  trendiest 2-word phrase. You are given the first word and the starting letter of
                  the second word. You are to fill in the second word. Once you enter your phrase,
                  the second word becomes the first word and you are provided with a new letter.
                  This process is repeated within the given time limit.
                </div>
                <div className="separator" />
                <div className="info-title">Settings</div>
                <div className="info-text">
                  <span className="info-text-title">Min Letters: </span> Each word must be a minimum
                  of 3 letters long. This can be increased up to a minimum of 6 letters. Only
                  characters found in the English alphabet can be used.
                </div>
                <div className="info-text">
                  <span className="info-text-title">Time: </span> You have 30 seconds to score as
                  many points as possible. This can be increased to 60 seconds.
                </div>
                <div className="info-text">
                  <span className="info-text-title">Hide Next Letter: </span> You are shown the
                  starting letter of the next word in the sequence. You have the option to hide this
                  letter.
                </div>
                <div className="info-text">
                  <span className="info-text-title">Hard Mode: </span> By default, common letters
                  have a higher likelihood of being selected as the starting letter. In Hard Mode,
                  all letters are equally likely to be chosen.
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
                  <input type="checkbox" checked={hideLetter} onChange={onHideLetterClick} />
                  <span className="slider round"></span>
                </label>
              </div>
              <div className="settings-modal-hardMode">
                Hard Mode
                <label className="switch">
                  <input type="checkbox" checked={hardMode} onChange={onHardModeClick} />
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
