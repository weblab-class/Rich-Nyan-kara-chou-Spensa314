import React, { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { useParams, useNavigate } from "react-router-dom";
import "../../utilities.css";
import "./MultiPlayer_Game.css";
import { get } from "../../utilities";

const MultiPlayer_Game = () => {
  // Use outlet context if necessary (currently unused in this code)
  let props = useOutletContext();
  
  const canvasRef = useRef(null);
  const [winner, setWinner] = useState(null);
  const { roomCode } = useParams(); // Get room code from URL parameters
  const navigate = useNavigate(); // Function to navigate programmatically
  const [isLoading, setIsLoading] = useState(true); // Loading state for API fetch
    // const username = props.username;
    const username = 'Player 1';
  // Fetch game status on component mount and roomCode change
  useEffect(() => {
    const fetchGameStatus = () => {
        if (!isLoading) return;
      get(`/api/game/status/${roomCode}?username=${encodeURIComponent(username)}`)
        .then((res) => {
          const started = res['started'];
          if (started === true) {
            // Game has started, stop loading
            setIsLoading(false);
          } else if (started === false) {
            // Retry after a delay until the game starts
            setTimeout(fetchGameStatus, 1000);
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
  }, [roomCode, username, navigate]);

  if (isLoading) {
    return <div>Waiting for the game to start...</div>;
  }

  return <div>The game has started!</div>;
};

export default MultiPlayer_Game;
