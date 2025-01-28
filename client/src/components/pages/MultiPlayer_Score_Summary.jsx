import React, { useState, useEffect, useRef } from "react";
import "../../utilities.css";
import NavBar from "../modules/NavBar";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { get, post } from "../../utilities";
import { updateThemeVariables } from "../../utilities";

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
  const [winner, setWinner] = useState([]);
  const [isLoggedIn, setLoggedIn] = useState(false);

  const location = useLocation();
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const updatedPlayersRef = useRef(new Set()); // Track players whose scores are updated

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
      })
      if(!location.state) {
        navigate("/home");
        return;
      }
    if (location.state) {
      setStandings(location.state.standings || []);
      setPlayers(location.state.players || []);
      setRoomState(location.state.state || {});
      setQueries(location.state.queries || []);
      setOwnScore(location.state.score || 0);
      console.log(location.state.state);
      // Default opponent setup
      const initialIndex = 0; // Start with the first opponent
      setIndex(initialIndex);
      setOppQueries(location.state.standings?.[index]?.playerState?.queries || []);
      setOppScore(location.state.standings?.[index]?.playerState?.score || 0);
      setOppName(location.state.standings?.[index]?.playerName || "");
      
      const topScore = location.state.standings?.[0]?.score || 0;
      const topPlayers = location.state.standings?.filter(player => player.score === topScore);
      setWinner(topPlayers || []);

      console.log("location.state", location.state);

      // Loop over all players to update their scores
      location.state.players.forEach((playerId) => {
        if (!updatedPlayersRef.current.has(playerId)) {
          updatedPlayersRef.current.add(playerId); // Mark the player as updated

          // Check if the current player is a winner
          const isWinner = location.state.standings.some(
            (player) =>
              player.playerId === playerId && player.score === location.state.standings[0]?.score
          );

          // Parse and transform settings
          const rawSettings = location.state.state.settings;
          const formattedSettings = JSON.stringify({
            minLetters: parseInt(rawSettings.minLength, 10),
            activeTime: parseInt(rawSettings.time, 10),
            hideLetter: rawSettings.hideLetter,
            hardMode: rawSettings.type, // hardMode maps from `type`
          });

          console.log("sending ", playerId, isWinner, formattedSettings);

          post("/api/updateMultiPlayerScore", {
            userId: playerId,
            isWinner: isWinner,
            settings: formattedSettings,
          })
            .then((response) => {
              console.log(`Multiplayer score updated for ${playerId}:`, response);
            })
            .catch((error) => {
              console.error(`Error updating multiplayer score for ${playerId}:`, error);
            });
        }
      });
    }
  }, [location.state]);

  

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
            navigate(`/room/${roomCode}`, {
              state: {
                hideLetter: roomState.settings.hideLetter,
                hardMode: roomState.settings.type,
                minLetters: roomState.settings.minLength,
                time: roomState.settings.time,
              },
            });
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
    !isLoggedIn ? 
    <div className="intermediate-container">
    </div>:(
    <>
      <NavBar />
      <div className="multi-score-container">
        {winner.length > 1 && <div className="multi-winner-container">Winners: {winner.map((player) => player.playerName).join(", ")}</div>}
        {winner.length === 1 && <div className="multi-winner-container">Winner: {winner[0].playerName}</div>}
        <div className="multi-results-container">
          <div className="multi-individual-results-container">
            <div className="multi-personal-title">Personal Score</div>
            <div className="multi-individual-content">
              {queries.map((query, index) => (
                <div key={`${query[0]}-${index}`} className="mp-score-result-container">
                  <div className="mp-score-result-term">{query[0]}</div>
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
              {oppQueries.map((result, index) => (
                <div key={`${result[0]}-${index}`} className="mp-score-result-container">
                  <div className="mp-score-result-term">{result[0]}</div>
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
    )
  );
};

export default MultiPlayer_Score_Summary;
