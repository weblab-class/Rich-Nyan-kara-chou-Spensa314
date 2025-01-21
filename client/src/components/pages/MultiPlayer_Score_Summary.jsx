import React, { useState } from "react";
import "../../utilities.css";
import NavBar from "../modules/NavBar";
import { useNavigate } from "react-router-dom";
import { get } from "../../utilities";
import "./MultiPlayer_Score_Summary.css";

const MultiPlayer_Score_Summary = () => {
  const [results, setResults] = useState([
    { term: "Apple Pie", query: "1,000,000,000,000" },
    { term: "Pie Chart", query: "900,000" },
    { term: "Chart Rank", query: "800,000" },
  ]); /**placeholder */

  const total_points = "1,000,000";

  const navigate = useNavigate();

  const handleNextClick = () => {
    navigate(`/room/${roomCode}`);
    {
      /* insert info ab room code: ryan */
    }
  };

  const opponents = ["Ryan", "Neha", "Miranda"];

  const [opponent, setOpponent] = useState(opponents[0]);
  const onOpponentClick = () => {
    const currentIndex = opponents.indexOf(opponent);
    const nextIndex = (currentIndex + 1) % opponents.length; // this will loop back to the first opponent after the last
    setOpponent(opponents[nextIndex]);
  };

  return (
    <>
      <NavBar />
      <div className="multi-score-container">
        <div className="multi-winner-container">Winner: Ryan</div> {/**put actual winner in */}
        <div className="multi-results-container">
          <div className="multi-individual-results-container">
            <div className="multi-personal-title">Personal Score</div>
            <div className="multi-individual-content">
              {results.map((result) => (
                <div key={result} className="mp-score-result-container">
                  <div key={result} className="mp-score-result-term">
                    "{result.term}"
                  </div>
                  :<div className="mp-score-result-query">{result.query}</div>
                </div>
              ))}
            </div>
            <div className="multi-total-points">Total Points: {total_points}</div>
          </div>
          <div className="multi-individual-results-container">
            <div className="multi-opponent-title" onClick={onOpponentClick}>
              {opponent}'s Score
            </div>
            <div className="multi-individual-content">
              {results.map((result) => (
                <div key={result} className="mp-score-result-container">
                  <div key={result} className="mp-score-result-term">
                    "{result.term}"
                  </div>
                  :<div className="mp-score-result-query">{result.query}</div>
                </div>
              ))}
            </div>
            <div className="multi-total-points">Total Points: {total_points}</div>
          </div>
        </div>
        <div onClick={handleNextClick}>
          <img src="/images/next.png" alt="Next" className="mp-return-room" />
        </div>
      </div>
    </>
  );
};

export default MultiPlayer_Score_Summary;
