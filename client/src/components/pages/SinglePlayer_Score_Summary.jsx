import React, { useState } from "react";
import "../../utilities.css";
import NavBar from "../modules/NavBar";
import { useNavigate } from "react-router-dom";

import "./SinglePlayer_Score_Summary.css";

const SinglePlayer_Score_Summary = () => {
  const [results, setResults] = useState([
    { term: "Apple Pie", query: "1,000,000,000,000" },
    { term: "Pie Chart", query: "900,000" },
    { term: "Chart Rank", query: "800,000" },
  ]); /**placeholder */

  const total_points = "100,000,000";

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
          {results.map((result) => (
            <div key={result} className="score-result-container">
              <div key={result} className="score-result-term">
                "{result.term}"
              </div>
              :<div className="score-result-query">{result.query}</div>
            </div>
          ))}
        </div>
        <h2 className="total-points-title">Total Points: {total_points}</h2>

        <div onClick={handleNextClick}>
          <img src="../../../next.png" alt="Next" className="next-leaderboard" />
        </div>
      </div>
    </>
  );
};
export default SinglePlayer_Score_Summary;
