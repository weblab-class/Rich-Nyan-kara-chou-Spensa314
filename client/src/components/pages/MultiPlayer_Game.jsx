import React, { useState, useEffect, useRef } from "react";
import { socket } from "../../client-socket.js";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { get , post} from "../../utilities";

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
  const [hiddenLetter, setHiddenLetter] = useState(false);
  // Fetch room settings and join room
  useEffect(() => {
    const fetchRoomSettings = async () => {
        const r = await get('/api/whoami');
        const userId = r._id;
        console.log(userId);
        try {
            const response = await get(`/api/getInitiated/${roomCode}?userId=${userId}`);
            console.log('49' + response);
            if (!response) {
                try {
                const response = await get(`/api/room/${roomCode}`);
                setRoomSettings(response.room.settings); // Save room settings (e.g., minLetters, hideLetter)          setHiddenLetter(response.room.settings.hideLetter);
                setRandomString(response.room.randomLetters);
                console.log(response.room.settings);
                setGameState((prevState) => ({
                    ...prevState,
                    prevWord: response.room.firstWord,
                    words: [response.room.firstWord],
                    timerValue: parseInt(response.room.settings.time) +5,
                }));
                console.log(response.room.settings.type);
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
        setGameState((prevState) => ({
          ...prevState,
          curLetter: randomString[index],
          nextLetter: randomString[index + 1],
        }));
      });

      socket.on("updatePlayers", (players) => {
        console.log("Players in room:", players);
      });

      socket.on("errorMessage", (message) => {
        setErrorMessage(message);
        setTimeout(() => setErrorMessage(null), 2000);
      });

      socket.on("updateScores", ({ scores }) => {
        setScores(scores);
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

    // Add 3-second delay before setting loading to false
    const loadingTimer = setTimeout(() => setIsLoading(false), 5000);
    console.log(gameState);

    return () => clearTimeout(loadingTimer);
  }, [roomCode, roomSettings, location.state]);

  // Handle player search
  const handleSearch = () => {
    if (!query || query.length < (roomSettings.minLength - 1 || 2)) {
      setErrorMessage(`Word must be at least ${roomSettings.minLength || 3} letters long.`);
      setTimeout(() => setErrorMessage(null), 2000);
      return;
    }
    setIndex((prevIndex) => prevIndex + 1);
    console.log(index);
    const currentWord = `${gameState.curLetter}${query}`;
    const queryText = `${gameState.prevWord} ${currentWord}`;

    setQuery("");
    socket.emit("submitQuery", { roomId: roomCode, query: queryText });
    setGameState((prevState) => ({
      ...prevState,
      words: prevState.words.concat(currentWord),
    }));
    socket.on("updateGameState", (getGameState) => {
      setGameState((prevState) => ({
        ...prevState,
        score: parseInt(getGameState.gameState.score),
        prevWord: currentWord,
        curLetter: randomString[index % randomString.length],
        nextLetter: randomString[(index + 1) % randomString.length],
        curScore: parseInt(getGameState.gameState.curScore),
        curQuery: queryText,
      }));
      console.log(gameState);
    });
  };

  // Timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setGameState((prevState) => {
        const newTimerValue = prevState.timerValue - 0.1;
        if (newTimerValue <= 0) {
          clearInterval(timer);
          alert(`Game Over! Final Score: ${prevState.score}`);
          return { ...prevState, timerValue: 0 };
        }
        return { ...prevState, timerValue: newTimerValue };
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  {
    /* loading page */
  }
  if (isLoading) {
    return (
      <>
        <div className="loading-container">
          <div className="settings-summary-container">
            Room Settings: Minimum Length: {roomSettings.minLength}
            {roomSettings.hideLetter && <div>Hide Letter: True</div>}
            {!roomSettings.hideLetter && <div>Hide Letter: False</div>}
            {!roomSettings.type && <div>Regular Mode</div>}
            {!roomSettings.hideLetter && <div>Hard Mode</div>}
            Game Timer: {initialTime}
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
            <img src="../../../logo.png" className="mp-logo-prevword" />
            <div className="mp-prevword-text">{gameState.prevWord}</div>
          </span>

          {/* Input */}

          <div className="mp-currword-container">
            {gameState.curLetter}
            <input
              type="text"
              id="searchQuery"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <hr className="mp-currword-line" />

          {/* Next Letter */}
          {!hiddenLetter && (
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
          <div className="mp-time-container">{Math.max(0, gameState.timerValue.toFixed(1))}</div>
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
