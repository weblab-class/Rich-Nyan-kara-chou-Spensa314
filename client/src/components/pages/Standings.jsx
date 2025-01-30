import React, { useState, useEffect, useRef } from "react";
import "../../utilities.css";
import NavBar from "../modules/NavBar";
import { socket } from "../../client-socket.js";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { get, post } from "../../utilities";
import "./Standings.css";
import { updateThemeVariables } from "../../utilities";

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
  const [winner, setWinner] = useState([]);
  const [isLoggedIn, setLoggedIn] = useState(false);

  const location = useLocation();
  const { roomCode } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    get("/api/whoami").then((res) => {
      if (!res.name) {
        navigate("/");
        return;
      }
      setLoggedIn(true);
      const savedTheme = localStorage.getItem("selectedTheme");

      if (savedTheme) {
        try {
          const parsedTheme = JSON.parse(savedTheme);
          // Apply the saved theme globally
          updateThemeVariables(parsedTheme.cssVariables);
        } catch (err) {
          console.error("Error parsing saved theme from localStorage:", err);
        }
      }
    });
    if (!location.state) {
      navigate("/home");
      return;
    }
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

      const topScore = location.state.standings?.[0]?.score || 0;
      const topPlayers = location.state.standings?.filter((player) => player.score === topScore);
      setWinner(topPlayers || []);
    }
  }, [location.state]);

  const handleNextClick = () => {
    navigate(`/results/${roomCode}`, {
      state: {
        standings: standings,
        players: players,
        state: roomState,
        queries: queries,
        score: ownScore,
      },
    });
    return;
  };

  // Assign ranks, accounting for ties
  const standingsWithRanks = standings.map((player, index, arr) => {
    if (index === 0 || player.score !== arr[index - 1].score) {
      player.rank = index + 1; // New rank if not tied
    } else {
      player.rank = arr[index - 1].rank; // Same rank as the previous player
    }
    return player;
  });

  return !isLoggedIn ? (
    <div className="intermediate-container"></div>
  ) : (
    <>
      <NavBar />
      <div className="standings-container">
        <h1 className="standings-title">Standings</h1>
        <div className="standings-list-container">
          {standingsWithRanks.map((player, index) => (
            <div
              key={`${player.playerName}-${index}`}
              className={`standings-player-container ${
                player.rank === 1
                  ? "s-top-player-1"
                  : player.rank === 2
                    ? "s-top-player-2"
                    : player.rank === 3
                      ? "s-top-player-3"
                      : ""
              }`}
            >
              <div
                className={`standings-place ${
                  player.rank === 1
                    ? "s-top-player-1-place"
                    : player.rank === 2
                      ? "s-top-player-2-place"
                      : player.rank === 3
                        ? "s-top-player-3-place"
                        : ""
                }`}
              >
                {player.rank}
              </div>
              <div className="standings-player-score-container">
                <div className="standings-player">{player.playerName}</div>
                <div className="standings-player-score">
                  {parseInt(player.score).toLocaleString()}
                </div>
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
