import React, { useState, useEffect, useRef } from "react";
import "../../utilities.css";
import NavBar from "../modules/NavBar";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { get , post} from "../../utilities";
import "./MultiPlayer_Score_Summary.css";

const MultiPlayer_Score_Summary = () => {
  const [standings, setStandings] = useState([]);
  const [players, setPlayers] = useState([]);
  const [roomState, setRoomState] = useState({});
  const [queries, setQueries] = useState([]);
  const [ownScore, setOwnScore] = useState(0);
  const [index, setIndex] = useState(0);
  const [oppQueries, setOppQueries] = useState([]);
  const [oppScore, setOppScore] = useState(0);
  const [oppName, setOppName] = useState("");
  const [winner, setWinner] = useState("");

  const location = useLocation();
  const { roomCode } = useParams();
  useEffect(() => {
    if (location.state) {
      setStandings(location.state.standings || []);
      setPlayers(location.state.players || []);
      setRoomState(location.state.state || {});
      setQueries(location.state.queries || []);
      setOwnScore(location.state.score || 0);

      // Default opponent setup
      const initialIndex = 0; // Start with the first opponent
      setIndex(initialIndex);
      setOppQueries(location.state.standings?.[index]?.playerState?.queries || []);
      setOppScore(location.state.standings?.[index]?.playerState?.score || 0);
      setOppName(location.state.standings?.[index]?.playerName || "");
      setWinner(location.state.standings?.[0]?.playerName || "Unknown");
    }
  }, [location.state]);

  const navigate = useNavigate();

  const handleNextClick = () => {
    get(`/api/room/${roomCode}`).then((res) => {
      console.log(res);
      if (res.exists === true) {
        console.log(res);
        get(`/api/getRoom/${roomCode}`).then((res) => {
          console.log(res);
          if (res === true) {
            alert("Game already started!");
          } else {
            navigate(`/room/${roomCode}`);
          }
        });
      } else {
        alert("Room does not exist!");
      }
    });
  };
  const onOpponentClick = () => {
    setIndex((index + 1) % standings.length);
    setOppQueries(standings[index].playerState.queries);
    setOppScore(standings[index].playerState.score);
    setOppName(standings[index].playerName);
  };

  return (
    <>
      <NavBar />
      <div className="multi-score-container">
        <div className="multi-winner-container">Winner: {winner}</div>
        <div className="multi-results-container">
          <div className="multi-individual-results-container">
            <div className="multi-personal-title">Personal Score</div>
            <div className="multi-individual-content">
              {queries.map((query) => (
                <div key={query} className="mp-score-result-container">
                  <div key={query} className="mp-score-result-term">
                    "{query[0]}"
                  </div>
                  :
                  <div className="mp-score-result-query">{parseInt(query[1]).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div className="multi-total-points">Total Points: {ownScore.toLocaleString()}</div>
          </div>
          <div className="multi-individual-results-container">
            <div className="multi-opponent-title" onClick={onOpponentClick}>
              {oppName}'s Score
            </div>
            <div className="multi-individual-content">
              {oppQueries.map((result) => (
                <div key={result} className="mp-score-result-container">
                  <div key={result} className="mp-score-result-term">
                    "{result[0]}"
                  </div>
                  :
                  <div className="mp-score-result-query">
                    {parseInt(result[1]).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            <div className="multi-total-points">Total Points: {oppScore.toLocaleString()}</div>
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
