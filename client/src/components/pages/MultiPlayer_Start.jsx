import React, { useEffect, useState } from "react";
import "../../utilities.css";
import NavBar from "../modules/NavBar";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "./Settings.css";
import "./MultiPlayer_Start.css";
import { post, get } from "../../utilities";
import { socket } from "../../client-socket"; // Import Socket.IO client

const MultiPlayer_Start = () => {
  const location = useLocation();
  const { host } = location.state || {};
  const { roomCode } = useParams(); // Get room code from URL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [minLetters, setMinLetters] = useState(3);
  const [activeTime, setActiveTime] = useState(30);
  const [hideLetter, setHideLetter] = useState(false);
  const [hardMode, setHardMode] = useState(false);
  const [players, setPlayers] = useState([]); // Player list from the server
  const [username, setUsername] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    get("/api/whoami").then((res) => {
        console.log(res.name);
      if (res.name !== null) {
        setUsername(res.name);
        socket.emit("joinRoom", { roomId: roomCode, user: res.name, settings: { hideLetter, hardMode, minWordLength: minLetters} });
      }
    });
    if (!username) {
      console.error("Username is not defined");
      return;
    }

   
    // Listen for updates to the player list
    socket.on("updatePlayers", (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    // Cleanup when the component unmounts
    return () => {
      socket.emit("leaveRoom", roomCode);
      socket.off("updatePlayers");
    };
  }, [roomCode, username]);

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

    // Notify the server to start the game
    post(`/api/startGame/${roomCode}`, gameDetails).then((res) => {
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
      console.log(message); // Debug message
      // Update game state or navigate to the game page
      get("/api/room/${roomCode}").then((res) => {
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



  return (
    <>
      <NavBar />
      <div className="multiplayer-container">
        {host && (
        <div onClick={onSettingsClick} className="mp-settings-button mp-page-button">
          Game Settings
        </div>
        )}
        {host &&<div onClick={onStartClick} className="mp-start-button mp-page-button">
          Start Game
        </div>
        }
        {!host &&<div className="mp-start-button mp-page-button">
          Start Game
        </div>
        }
        <div className="mp-players-title">Players</div>
        <div className="mp-players-list">
          {players.map((player) => (
            <div key={player.id} className="mp-players-item">
              <img src="../../../default.png" alt="default" className="mp-player-logo" />
              <div className="mp-player-name">{player.name}</div>
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
