import React, { useState, useEffect } from "react";
import "../../utilities.css";
import NavBar from "../modules/NavBar";
import { useNavigate, useLocation } from "react-router-dom";
import "./SinglePlayer_Score_Summary.css";
import { get } from "../../utilities";
import { post } from "../../utilities";
import { useContext } from "react";
import { UserContext } from "../App";

const SinglePlayer_Score_Summary = () => {
  const [queries, setQueries] = useState([]);
  const { userId } = useContext(UserContext);
  const [score, setScore] = useState(0);
  const [minLetters, setMinLetters] = useState(0);
  const [activeTime, setActiveTime] = useState(0);
  const [hideLetter, setHideLetter] = useState(false);
  const [hardMode, setHardMode] = useState(false);
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [guest, setGuest] = useState(null);
  const [isSaving, setIsSaving] = useState(false); // To track saving state

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    get("/api/whoami").then((res) => {
      if (!res.name) {
        navigate("/");
        return;
      }
      setLoggedIn(true);
      setGuest(res.isGuest);
    });

    if (!location.state) {
      navigate("/home");
      return;
    }

    // Set game state from location immediately
    if (location.state) {
      setQueries(location.state.queries || []);
      setScore(location.state.score || 0);
      setMinLetters(parseInt(location.state.minLetters, 10) || 3);
      setActiveTime(parseInt(location.state.activeTime, 10) || 30);
      setHideLetter(location.state.hideLetter || false);
      setHardMode(location.state.hardMode || false);
    }
  }, [location.state]);

  useEffect(() => {
    if (location.state && isLoggedIn && !isSaving && guest === false) {
      setIsSaving(true);
      saveScore(userId, location.state.score, {
        minLetters: parseInt(location.state.minLetters, 10),
        activeTime: parseInt(location.state.activeTime, 10),
        hideLetter: location.state.hideLetter,
        hardMode: location.state.hardMode,
      });
    }
  }, [location.state, userId, guest, isSaving]);

  const handleNextClick = () => {
    navigate("/leaderboard", {
      state: {
        minLetters,
        activeTime,
        hardMode,
        hideLetter,
      },
    });
  };

  const handleAgainClick = () => {
    navigate("/room/solo", {
      state: {
        minLetters: minLetters,
        activeTime: activeTime,
        hardMode: hardMode,
        hideLetter: hideLetter,
      },
    });
  };

  // Save the score to the backend
  const saveScore = async (userId, score, settings) => {
    console.log("Saving score:", { userId, score, settings });

    try {
      const response = await post("/api/updateSinglePlayerScore", {
        userId,
        score: score,
        settings: JSON.stringify(settings),
        guest: guest,
      });

      if (response.success) {
        console.log("Score updated successfully:", response);
        // Optional: Provide user feedback
      } else {
        console.error("Failed to update score:", response);
        alert("Could not save the score.");
      }
    } catch (error) {
      console.error("Error updating score:", error);
      alert("An error occurred while saving the score.");
    }
  };

  return !isLoggedIn ? (
    <div className="intermediate-container"></div>
  ) : (
    <>
      <NavBar />
      <div className="soloscore-container">
        <h1 className="score-title">Score</h1>
        <div className="score-list-container">
          {queries.map((q, index) => (
            <div key={index} className="score-result-container">
              <div className="score-result-term">{q[0]}</div>
              <div className="score-result-query">{parseInt(q[1]).toLocaleString()}</div>
            </div>
          ))}
        </div>
        <h2 className="total-points-title">Total Points: {parseInt(score).toLocaleString()}</h2>

        {/* Show a loading indicator if saving */}
        {isSaving && <div className="saving-indicator">Saving score...</div>}

        <div onClick={handleNextClick} className="next-leaderboard">
          <img src="/images/crown.png" alt="Next" className="leaderboard-after-sp" />
        </div>

        <div onClick={handleAgainClick}>
          <img src="/images/next.png" alt="Again" className="next-game" />
        </div>
      </div>
    </>
  );
};

export default SinglePlayer_Score_Summary;
