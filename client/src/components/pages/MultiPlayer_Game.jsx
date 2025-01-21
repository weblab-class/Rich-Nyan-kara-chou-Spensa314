import React, { useState, useEffect, useRef } from "react";
import { socket } from "../../client-socket.js";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { get, post } from "../../utilities";

import "../../utilities.css";
import "./MultiPlayer_Game.css";
import "./Loading.css";

const MultiPlayer_Game = () => {
  const navigate = useNavigate();
  const { roomCode } = useParams();
  const location = useLocation();
  const canvasRef = useRef(null);

  const [gameState, setGameState] = useState({
    curLetter: "",
    nextLetter: "",
    score: 0,
    prevWord: "",
    timerValue: 33,
    curScore: 0,
    curQuery: "",
    words: [],
  });
  const [query, setQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [initialTime, setInitialTime] = useState(30);
  const [roomSettings, setRoomSettings] = useState({
    minLength: 3,
    hideLetter: false,
    type: false,
    initiate: false,
  });
  const [isLoading, setIsLoading] = useState(true); // Loading state for 3-second delay
  const [randomString, setRandomString] = useState("");
  const [index, setIndex] = useState(0);
  const [username, setUsername] = useState(null);
  const [id, setId] = useState(null);
  const [scores, setScores] = useState([]);
  // Fetch room settings and join room
  useEffect(() => {
    const fetchRoomSettings = async () => {
      const r = await get("/api/whoami");
      const userId = r._id;
      console.log(userId);
      post(`/api/startGameLoop/${roomCode}?userId=${userId}`);
      try {
        const response = await get(`/api/getInitiated/${roomCode}?userId=${userId}`);
        if (!response) {
          try {
            const response = await get(`/api/room/${roomCode}`);
            console.log(response);
            setRoomSettings(response.room.settings); // Save room settings (e.g., minLetters, hideLetter)          setHiddenLetter(response.room.settings.hideLetter);
            setRandomString(response.room.randomLetters);
            setGameState((prevState) => ({
              ...prevState,
              prevWord: response.room.firstWord,
              words: [response.room.firstWord],
              timerValue: parseInt(response.room.settings.time) + 5,
            }));
            setInitialTime(response.room.settings.time);
            joinRoom(response.room.settings); // Pass settings to the joinRoom function
            post(`/api/setInitiated/${roomCode}?userId=${userId}`);
          } catch (error) {
            console.error("Error fetching room settings:", error);
            setErrorMessage("Failed to fetch room settings.");
          }
        } else {
          joinRoom(roomSettings);
        }
      } catch (error) {
        console.error("Error fetching initiation status:", error);
        setErrorMessage("Failed to fetch initiation status.");
      }
    };

    const joinRoom = (settings) => {
      get("/api/whoami").then((res) => {
        console.log(res);
        if (res.name !== null) {
          setUsername(res.name);
          setId(res._id);
          socket.emit("joinRoom", { roomId: roomCode, user: res.name, settings });
        }
      });

      socket.on("updateGameState", (gameState) => {
        console.log(gameState);
        if (!gameState.roomState.loading) {
          setIsLoading(false);
        }

        if (gameState.roomState.gameEnded) {
          console.log("Game ended!");
          navigate(`/results/${roomCode}`, {
            standings: gameState.roomScores,
            players: gameState.roomPlayers,
            state: gameState.roomState,
          });
          return;
        }
        console.log(gameState);
        setGameState((prevState) => ({
          ...prevState,
          prevWord: gameState.playerStates.prevWord,
          curQuery: gameState.playerStates.curQuery,
          curScore: parseInt(gameState.playerStates.curScore),
          score: parseInt(gameState.playerStates.score),
          curLetter: gameState.playerStates.curLetter,
          nextLetter: gameState.playerStates.nextLetter,
          timerValue: gameState.roomState.time.toFixed(1),
          words: gameState.playerStates.words,
        }));
        setScores(gameState.roomScores);
      });

      socket.on("updatePlayers", (players) => {
        console.log("Players in room:", players);
      });

      socket.on("errorMessage", (message) => {
        setErrorMessage(message);
        setTimeout(() => setErrorMessage(null), 2000);
      });

      return () => {
        socket.emit("leaveRoom", roomCode);
        socket.off("updateGameState");
        socket.off("updatePlayers");
        socket.off("errorMessage");
        socket.off("updateScores");
      };
    };

    fetchRoomSettings();
  }, [roomCode, roomSettings, location.state]);

  //   // Handle player search
  const handleSearch = () => {
    if (!query || query.length < (roomSettings.minLength - 1 || 2)) {
      setErrorMessage(`Word must be at least ${roomSettings.minLength || 3} letters long.`);
      setTimeout(() => setErrorMessage(null), 2000);
      return;
    }
    setQuery("");
    socket.emit("submitQuery", { roomId: roomCode, query: query });
  };

  const [countdown, setCountdown] = useState(5); // 5 seconds countdown
  useEffect(() => {
    if (isLoading && countdown > 1) {
      // Set an interval to decrease the countdown every second
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);

      // Cleanup the interval once countdown reaches 0 or when component unmounts
      return () => clearInterval(timer);
    }
  }, [countdown]);

  if (isLoading) {
    return (
      <>
        <div className="loading-container">
          <div className="countdown-timer">{countdown}</div>

          <div className="settings-summary-container">
            <div className="settings-title">Room Settings</div>
            Minimum Length: <span className="white">{roomSettings.minLength}</span>
            {roomSettings.hideLetter && (
              <div>
                Hide Letter: <span className="green">True</span>
              </div>
            )}
            {!roomSettings.hideLetter && (
              <div>
                Hide Letter: <span className="red">False</span>
              </div>
            )}
            {!roomSettings.type && (
              <div>
                Mode: <span className="white">Regular</span>
              </div>
            )}
            {roomSettings.type && (
              <div>
                Mode: <span className="red">Hard</span>
              </div>
            )}
            Game Timer: <span className="white">{initialTime}</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mp-game-container">
        <div className="individual-game-container">
          {/* Scoreboard */}
          <div className="mp-score-container">
            <span className="mp-score-label">Score: </span>
            <span className="mp-score-value">{gameState.score}</span>
          </div>

          {/* Results */}
          <div className="mp-result-container">
            <span className="mp-result-count">{gameState.curScore}</span> Results for "
            <span className="mp-result-word">{gameState.curQuery}</span>"
          </div>

          {/* Prev Word */}
          <span className="mp-prevword-container">
            <img src="/images/logo.png" className="mp-logo-prevword" />
            <div className="mp-prevword-text">{gameState.prevWord}</div>
          </span>

          {/* Input */}

          <div className="mp-currword-container">
            {gameState.curLetter}
            <input
              type="text"
              id="searchQuery"
              autoFocus= {true}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <hr className="mp-currword-line" />

          {/* Next Letter */}
          {!roomSettings.hideLetter && (
            <div className="mp-random-next-letter">
              <span id="nextLetter">Next Letter: {gameState.nextLetter}</span>
            </div>
          )}

          {/* Query History */}
          <div className="mp-results-list-container">
            {gameState.words.map((word, index) => (
              <span key={index}>{word} - </span>
            ))}
          </div>

          {/* Timer */}
          <div className="mp-time-container">{gameState.timerValue}</div>
        </div>

        {/* Scoreboard */}
        <div className="scoreboard-container">
          <h1 className="mp-scoreboard-text">Scoreboard</h1>
          <div className="mp-scoreboard-values">
            {scores.map((player, index) => (
              <div key={index}>
                {player.playerName}: {parseInt(player.score)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default MultiPlayer_Game;
