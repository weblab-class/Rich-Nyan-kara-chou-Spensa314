import React, { useState, useEffect, useRef } from "react";
import "../../utilities.css";
import NavBar from "../modules/NavBar";
import { socket } from "../../client-socket.js";
import { useNavigate , useLocation, useParams} from "react-router-dom";
import { get, post } from "../../utilities";
import "./Standings.css";

const Standings = () => {
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
    socket.emit("endGame", roomCode);
    navigate(`/results/${roomCode}`, {state: {
      standings: standings,
      players: players,
      state: roomState,
      queries: queries,
      score: ownScore,
    }});
    return;
  };
  return (
    <>
      <NavBar />
      <div className="standings-container">
        <h1 className="standings-title">Standings</h1>
        <div className="standings-list-container">
          {standings.map((player, index) => (
            <div
              key={`${player.playerName}-${index}`}
              className={`standings-player-container ${(index + 1) === 1 ? "s-top-player-1" : (index + 1) === 2 ? "s-top-player-2" : (index + 1) === 3 ? "s-top-player-3" : ""}`}
            >
              <div
                key={`${player.playerName}-${index}`}
                className={`standings-place ${(index + 1) === 1 ? "s-top-player-1-place" : (index + 1) === 2 ? "s-top-player-2-place" : (index + 1) === 3 ? "s-top-player-3-place" : ""}`}
              >
                {index + 1}{" "}
              </div>
              <div className="standings-player">
                {player.playerName}: {parseInt(player.score).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
        <div onClick={handleNextClick}>
          <img src="/images/next.png" alt="Next" className="mp-go-results" />
        </div>
      </div>
    </>
  );
};

export default Standings;
