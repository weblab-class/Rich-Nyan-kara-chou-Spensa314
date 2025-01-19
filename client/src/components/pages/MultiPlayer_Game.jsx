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
    highScore: 0,
    prevWord: "",
    timerValue: 60,
  });
  const [query, setQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [roomSettings, setRoomSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true); // Loading state for 3-second delay
  const [randomString, setRandomString] = useState("");
  const [index, setIndex] = useState(0);

  // Fetch room settings and join room
  useEffect(() => {
    const fetchRoomSettings = async () => {
      if (!roomSettings) {
        try {
          const response = await get(`/api/room/${roomCode}`);
          console.log(response.room.settings);
          setRoomSettings(response.room.settings); // Save room settings (e.g., minLetters, hideLetter)
          setRandomString(response.room.randomLetters);
          console.log(roomSettings);
          joinRoom(roomSettings); // Pass settings to the joinRoom function
        } catch (error) {
          console.error("Error fetching room settings:", error);
          setErrorMessage("Failed to fetch room settings.");
        }
      } else {
        joinRoom(roomSettings);
      }
    };

    const joinRoom = (settings) => {
      socket.emit("joinRoom", { roomId: roomCode, user: { name: location.state?.userName, _id: location.state?.userId }, settings });

      socket.on("updateGameState", (gameState) => {
        setGameState((prevState) => ({
          ...prevState,
          curLetter: randomString[index],
          nextLetter: randomString[index + 1],
        }));
        setIndex((prevIndex) => prevIndex + 1);
      });
      
      console.log(gameState);
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
      };
    };

    fetchRoomSettings();

    // Add 3-second delay before setting loading to false
    const loadingTimer = setTimeout(() => setIsLoading(false), 3000);

    return () => clearTimeout(loadingTimer);
  }, [roomCode, roomSettings, location.state]);

  // Handle player search
  const handleSearch = () => {
    if (!query || query.length < (roomSettings.minLetters || 3)) {
      setErrorMessage(`Word must be at least ${roomSettings.minLetters || 3} letters long.`);
      setTimeout(() => setErrorMessage(null), 2000);
      return;
    }
  
    setIndex((prevIndex) => prevIndex + 1);
    socket.emit("submitQuery", { roomId: roomCode, query });
  
    setGameState((prevState) => ({
      ...prevState,
      curLetter: randomString[index + 1], // Move to the next letter
      nextLetter: randomString[index + 2],
    }));
    socket.on("updateGameState", handleGameStateUpdate);
    socket.on("updatePlayers", handlePlayersUpdate);
    socket.on("errorMessage", handleErrorMessage)
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
      <div>
        {/* Score and High Score */}
        <div className="scoreboard">
          <div>Score: {gameState.score}</div>
        </div>

        {/* Previous Word */}
        <div className="prev-word">Previous Word: {gameState.prevWord}</div>

        {/* Current Letter and Input */}
        <div className="current-letter">
          {gameState.curLetter}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>

        {/* Next Letter */}
        <div className="next-letter">Next Letter: {gameState.nextLetter}</div>

        {/* Error Message */}
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        {/* Timer */}
        <div className="timer">Time Remaining: {gameState.timerValue}s</div>
      </div>
    </>
  );
};

export default MultiPlayer_Game;
