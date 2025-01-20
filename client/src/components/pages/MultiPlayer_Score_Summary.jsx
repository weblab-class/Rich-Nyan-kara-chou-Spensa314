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

  return (
    <>
      <NavBar />
      <div className="multi-score-container">
        <div className="multi-winner-container">Winner: Ryan</div> {/**put actual winner in */}
        <div className="multi-results-container">
          <div className="multi-individual-results-container">
            <div className="multi-individual-title">Personal Score</div>
            <div className="multi-individual-content">
              {results.map((result) => (
                <div key={result} className="score-result-container">
                  <div key={result} className="score-result-term">
                    "{result.term}"
                  </div>
                  :<div className="score-result-query">{result.query}</div>
                </div>
              ))}
            </div>
            <div className="multi-total-points">Total Points: {total_points}</div>
          </div>
          <div className="multi-individual-results-container">
            <div className="multi-individual-title">Opponent Score</div>
            <div className="multi-individual-content">
              {results.map((result) => (
                <div key={result} className="score-result-container">
                  <div key={result} className="score-result-term">
                    "{result.term}"
                  </div>
                  :<div className="score-result-query">{result.query}</div>
                </div>
              ))}
            </div>
            <div className="multi-total-points">Total Points: {total_points}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MultiPlayer_Score_Summary;
