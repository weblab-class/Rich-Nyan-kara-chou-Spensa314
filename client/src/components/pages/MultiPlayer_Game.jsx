import React, { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { useParams, useNavigate } from "react-router-dom";
import "../../utilities.css";
import "./MultiPlayer_Game.css";
import { get } from "../../utilities";
import { socket } from "../../client-socket.js";

const MultiPlayer_Game = () => {
  // Use outlet context if necessary (currently unused in this code)
  let props = useOutletContext();
  
  const canvasRef = useRef(null);
  const [winner, setWinner] = useState(null);
  const { roomCode } = useParams(); // Get room code from URL parameters
  const [errorMessage, setErrorMessage] = useState(null); // Error message state
  const navigate = useNavigate(); // Function to navigate programmatically
  const [isLoading, setIsLoading] = useState(true); // Loading state for API fetch
  const [players, setPlayers] = useState([]); // Player list state
  const [gameState, setGameState] = useState(null); // Game state
  const [query, setQuery] = useState(""); // Query input state
  const [username, setUsername] = useState(null);
    // const username = props.username;

  // Fetch game status on component mount and roomCode change
  useEffect(() => {
    get("/api/whoami").then((res) => {
        console.log(res.name);
      if (res.name !== null) {
        setUsername(res.name);
      }
    });
    if (username === null) {
      console.error("Username is not defined");
      return;
    }

    const fetchGameStatus = () => {
      if (!isLoading) return;
      get(`/api/game/status/${roomCode}?username=${encodeURIComponent(username)}`)
        .then((res) => {
          const started = res["started"];
          if (started) {
            setIsLoading(false);
            subscribeToRoom(); // Subscribe to real-time updates after game starts
          } else {
            setTimeout(fetchGameStatus, 1000); // Retry until the game starts
          }
        })
        .catch((err) => {
          console.error("Error fetching game status:", err.response || err.message || err);
          if (err.response?.status === 403) {
            alert("You are not part of this game!");
          } else if (err.response?.status === 404) {
            alert("Room not found!");
          } else {
            alert("An error occurred. Please try again.");
          }
          navigate("/home");
        });
    };

    fetchGameStatus();
  }, [roomCode, username, navigate, isLoading]);

  // Subscribe to socket events
  const subscribeToRoom = () => {
    socket.emit("joinRoom", { roomId: roomCode, user: { name: username } });

    socket.on("updatePlayers", (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    socket.on("updateGameState", (state) => {
      setGameState(state);
    });

    socket.on("errorMessage", (message) => {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(null), 500); // Clear error after 0.5 seconds
    });

    return () => {
      socket.emit("leaveRoom", roomCode); // Leave the room on component unmount
      socket.off("updatePlayers");
      socket.off("updateGameState");
      socket.off("errorMessage");
    };
  };

  // Submit player query
  const submitQuery = () => {
    if (query.trim()) {
      socket.emit("submitQuery", { roomId: roomCode, query });
      setQuery(""); // Clear input
    }
  };

  if (isLoading) {
    return <div>Waiting for the game to start...</div>;
  }

  return (
    <div>
      <h1>Game Room: {roomCode}</h1>
      <h2>Welcome, {username}</h2>

      {/* Error Message */}
      {errorMessage && <div className="error-message">{errorMessage}</div>}

      {/* Player List */}
      <div>
        <h3>Players in Room:</h3>
        <ul>
          {players.map((player) => (
            <li key={player.id}>{player.name}</li>
          ))}
        </ul>
      </div>

      {/* Game State */}
      {gameState && (
        <div>
          <h3>Game State:</h3>
          <p>Current Letter: {gameState.curLetter}</p>
          <p>Next Letter: {gameState.nextLetter}</p>
        </div>
      )}

      {/* Query Input */}
      <div>
        <input
          type="text"
          placeholder="Enter your word"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={submitQuery}>Submit</button>
      </div>
    </div>
  );
};
export default MultiPlayer_Game;
