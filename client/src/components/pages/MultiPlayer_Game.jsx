import React, { useState, useEffect, useRef } from "react";
import { socket } from "../../client-socket.js";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { get } from "../../utilities";

import "../../utilities.css";
import "./MultiPlayer_Game.css";

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
    timerValue: 30,
    curScore: 0,
    curQuery: "",
    words: [],
  });
  const [query, setQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [roomSettings, setRoomSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state for 3-second delay
  const [randomString, setRandomString] = useState("");
  const [index, setIndex] = useState(0);
  const [username, setUsername] = useState(null);
  const [id, setId] = useState(null);
  const [scores, setScores] = useState([]);
  // Fetch room settings and join room
  useEffect(() => {
    const fetchRoomSettings = async () => {
      if (!roomSettings) {
        try {
          const response = await get(`/api/room/${roomCode}`);
          setRoomSettings(response.room.settings); // Save room settings (e.g., minLetters, hideLetter)
          setRandomString(response.room.randomLetters);
          setGameState(
            (prevState) => ({
              ...prevState,
              prevWord: response.room.firstWord,
              words: [response.room.firstWord],
              timerValue: response.room.settings.type === "regular" ? 30 : 60,
            })
            );
          joinRoom(response.room.settings); // Pass settings to the joinRoom function
        } catch (error) {
          console.error("Error fetching room settings:", error);
          setErrorMessage("Failed to fetch room settings.");
        }
      } else {
        joinRoom(roomSettings);
      }
    };

    const joinRoom = (settings) => {
        get("/api/whoami").then((res) => {
            console.log(res);
          if (res.name !== null) {
            setUsername(res.name);
            setId(res._id);
            socket.emit("joinRoom", { roomId: roomCode, user: res.name, settings });
          }});
      
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
    const loadingTimer = setTimeout(() => setIsLoading(false), 3000);
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
    socket.on("updateGameState", (gameState) => {
      console.log(gameState);
      setGameState((prevState) => ({
        ...prevState,
        score: parseInt(prevState.score) + parseInt(gameState.totalResults),
        prevWord: currentWord,
        curLetter: randomString[index % randomString.length], 
        nextLetter: randomString[(index + 1) % randomString.length],
        curScore: parseInt(gameState.totalResults),
        curQuery: queryText,
      }));
    });
  };
  

  // Timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setGameState((prevState) => {
        const newTimerValue = prevState.timerValue - 1;
        if (newTimerValue <= 0) {
          clearInterval(timer);
          alert(`Game Over! Final Score: ${prevState.score}`);
          return { ...prevState, timerValue: 0 };
        }
        return { ...prevState, timerValue: newTimerValue };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return <div>Loading game settings, please wait...</div>;
  }

  return (
    <>
      <div className="game-container">
        {/* Scoreboard */}
        <div className="score-container">
          <span className="score-label">Score: </span>
          <span className="score-value">{gameState.score}</span>
        </div>

        {/* Results */}
        <div className="result-container">
          <span className="result-count">{gameState.curScore}</span> Results for "
          <span className="result-word">{gameState.curQuery}</span>"
        </div>

        {/* Prev Word */}
        <span className="prevword-container">
          <img src="../../../logo.png" className="logo-prevword" />
          <div className="prevword-text">{gameState.prevWord}</div>
        </span>

        {/* Input */}

        <div className="currword-container">
        {gameState.curLetter}
          <input
            type="text"
            id="searchQuery"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <hr className="currword-line" />

        {/* Next Letter */}
        <div className="random-next-letter">
          <span id="nextLetter">Next Letter: {gameState.nextLetter}</span>
        </div>

        {/* Query History */}
        <div className="results-list-container">
          {gameState.words.map((word, index) => (
            <span key={index}>{word} - </span>
          ))}
        </div>

        <div className="scoreboard-container">
        <h3>Scoreboard</h3>
        <ul>
            {scores.map((player, index) => (
            <li key={index}>
                {player.playerName}: {parseInt(player.score)}
            </li>
            ))}
        </ul>
        </div>

        {/* Timer */}
        <div className="time-container">{gameState.timerValue}s</div>
      </div>
      

    </>
  );
};

export default MultiPlayer_Game;
