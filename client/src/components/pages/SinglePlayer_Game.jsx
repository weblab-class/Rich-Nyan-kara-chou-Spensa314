import React, { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { useParams, useNavigate } from "react-router-dom";
import "../../utilities.css";
import "./SinglePlayer_Game.css";
import { get } from "../../utilities";

const SinglePlayer_Game = () => {
  const canvasRef = useRef(null); // Reference to the game canvas
  const [score, setScore] = useState(null); // Track the winner of the game
  const [isWaiting, setIsWaiting] = useState(true); // Flag to track if the game is waiting for the start
    const startGame = () => {
      console.log("Game started!");
      setIsWaiting(false); // Transition to the game screen
    };
  
    // Trigger a 3-second timer on component mount
    useEffect(() => {
      const timer = setTimeout(() => {
        startGame();
      }, 3000);
  
      return () => {
        clearTimeout(timer);
      };
    }, []);
  
    if (isWaiting) {
      return (
        <div>Waiting for the game to start...</div>
      );
    }
  
    return (
      <div>
        <h1>Single Player Game</h1>
        <div>

        </div>
      </div>
    );
  };
  
  export default SinglePlayer_Game;
  
