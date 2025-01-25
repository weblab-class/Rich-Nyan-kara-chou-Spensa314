import React, { useEffect, useState } from "react";
import "../../utilities.css";
import NavBar from "../modules/NavBar";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "./Settings.css";
import "./Info.css";
import "./MultiPlayer_Start.css";
import { post, get } from "../../utilities";
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
        console.log("Score update flag reset for new game.");
      } catch (err) {
        console.error("Error resetting score flag:", err);
      }
    };

    resetScoreFlag();

    // Notify the server to start the game
    post(`/api/startGame/${roomCode}/${id}`, gameDetails).then((res) => {
      console.log(res);
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
      console.log(message);
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

  const [prevWord, setPrevWord] = useState("Chain"); // Set the last word initially
  const [currWord, setCurrWord] = useState("Reaction");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const intervalDuration = 4000; // the interval duration
    setIsAnimating(true);

    const interval = setInterval(() => {
      if (currWord === "Chain") {
        setPrevWord("Chain");
        setCurrWord("Reaction");
      } else {
        setPrevWord("Reaction");
        setCurrWord("Chain");
      }

      // Clean up timeout on the next cycle
    }, intervalDuration);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [prevWord, currWord]); // Only runs when currWord changes

  useEffect(() => {
    if (isInfoModalOpen) {
      setPrevWord("Chain");
      setCurrWord("Reaction");
      setIsAnimating(false);
    }
  }, [isInfoModalOpen]); // Dependency on modal opening

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
          {copied && <div className="copy-notif">Copied!</div>}
          Room Code: {roomCode}
          <img src="/images/copy.png" alt="Copy" className="mp-room-copy" />
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

export default MultiPlayer_Start;
