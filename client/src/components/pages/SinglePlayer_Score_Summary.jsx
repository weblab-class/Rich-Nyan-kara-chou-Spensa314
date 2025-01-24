import React, { useState, useEffect } from "react";
import "../../utilities.css";
import NavBar from "../modules/NavBar";
import { useNavigate, useLocation } from "react-router-dom";
import "./SinglePlayer_Score_Summary.css";

const SinglePlayer_Score_Summary = () => {
  const [queries, setQueries] = useState([]);
  const [score, setScore] = useState(0);
  const [minLetters, setMinLetters] = useState(0);
  const [activeTime, setActiveTime] = useState(0);
  const [hideLetter, setHideLetter] = useState(false);
  const [hardMode, setHardMode] = useState(false);

  const location = useLocation();
  useEffect(() => {
    if (location.state) {
      setQueries(location.state.queries || []);
      setScore(location.state.score || 0);
      setMinLetters(location.state.minLetters || 0);
      setActiveTime(location.state.activeTime || 0);
      setHideLetter(location.state.hideLetter || false);
      setHardMode(location.state.hardMode || false);
      console.log(location.state);
    }
  }, [location.state]);

  const navigate = useNavigate();

  const handleNextClick = () => {
    navigate("/leaderboard");
  };

  return (
    <>
      <NavBar />
      <div className="soloscore-container">
        <h1 className="score-title">Score</h1>
        <div className="score-list-container">
          {queries.map((q) => (
            <div className="score-result-container">
              <div className="score-result-term">{q[0]}</div>
              <div className="score-result-query">{parseInt(q[1]).toLocaleString()}</div>
            </div>
          ))}
        </div>
        <h2 className="total-points-title">Total Points: {parseInt(score).toLocaleString()}</h2>
        <div onClick={handleNextClick}>
          <img src="/images/next.png" alt="Next" className="next-leaderboard" />
        </div>
      </div>
    </>
  );
};
export default SinglePlayer_Score_Summary;
