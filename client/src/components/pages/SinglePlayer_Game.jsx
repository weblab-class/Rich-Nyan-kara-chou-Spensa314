import React, { useState, useEffect, useRef, useContext } from "react";
import { useOutletContext } from "react-router-dom";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "../../utilities.css";
import "./SinglePlayer_Game.css";
import { get, post } from "../../utilities";
import { UserContext } from "../App";
import seedrandom from "seedrandom";
import "./Loading.css";

const SinglePlayer_Game = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useContext(UserContext);
  const { minLetters, activeTime, hideLetter, hardMode, player } = location.state || {};
  const [isWaiting, setIsWaiting] = useState(true); // Flag for waiting state
  const [query, setQuery] = useState(""); // Input query
  const [resultMessage, setResultMessage] = useState(""); // Result feedback
  const [index, setIndex] = useState(0);
  const [isError, setIsError] = useState(false);
  const inputRef = useRef(null);
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [gameState, setGameState] = useState({
    prevWord: "apple",
    score: 0,
    curScore: 0,
    curQuery: "",
    curLetter: "",
    nextLetter: "",
    timerValue: parseInt(activeTime),
    minWordLength: minLetters,
    seed: "",
    queries: [],
    words: ["apple"],
  });

  useEffect(() => {
    get("/api/whoami").then((res) => {
        if (!res.name) {
            navigate("/");
            return;
        }
        setLoggedIn(true);
      })
  });

  // Start the game
  const startGame = () => {
    console.log("Game started!");
    setIsWaiting(false);

    // Generate a random seed once for the game
    const gameSeed = "seed" + Math.floor(Math.random() * 1000000);

    const firstLetter = generateRandomLetter(gameSeed); // Initialize the first letter
    setIndex((prevIndex) => prevIndex + 1);
    setGameState((prevState) => ({
      ...prevState,
      curLetter: firstLetter,
      nextLetter: generateRandomLetter(deriveSeed(gameSeed, index)), // Generate next letter using the same seed
      seed: gameSeed, // Store the seed for the game
    }));

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Generate a random letter using seed
  const generateRandomLetter = (seed) => {
    let alphabet = "abcdefghijklmnopqrstuvwxyz";
    if (!hardMode) {
      alphabet =
        "aaaaaaaabbccccddddeeeeeeeeeeeffggghhhiiiiiiiiijkllllllmmmnnnnnnnnooooooopppqrrrrrrrrssssssssstttttttuuuuvwxyyz";
    }
    const rng = seedrandom(seed); // Seed-based RNG
    const randomIndex = Math.floor(rng() * alphabet.length);
    return alphabet.charAt(randomIndex);
  };
  const deriveSeed = (baseSeed, offset) => {
    return `${baseSeed}-${offset}`;
  };
  // On Enter Key Press
  const onEnterKeyPress = (event) => {
    if (event.key === "Enter") {
        if (
            event.target.value.length < minLetters - 1 || 
            /[^a-zA-Z]/.test(event.target.value) // Check for any non-letter characters
          ) {
            const errorMessage = 
              /[^a-zA-Z]/.test(event.target.value)
                ? 'Word can only contain letters (A-Z, a-z).'
                : `Word must be at least ${minLetters} letters long.`;
          
            console.error(errorMessage);
            setResultMessage(errorMessage);
            setIsError(true);
            setTimeout(() => {
              setIsError(false);
            }, 500); // 0.5 seconds
            return;
          }          
      const q = `${gameState.curLetter}${event.target.value}`;
      const queryText = `${gameState.prevWord} ${q}`;
      console.log("Search Query:", queryText);
      setQuery("");
      get("/api/search", { query: queryText })
        .then((res) => {
          // Update index and state in a controlled manner
          setIndex((prevIndex) => prevIndex + 1);
          setGameState((prevState) => {
            const newLetter = generateRandomLetter(deriveSeed(prevState.seed, index)); // Generate new letter using seed
            return {
              ...prevState,
              prevWord: q, // Update previous word
              curScore: parseInt(res.totalResults, 10) || 0,
              curQuery: queryText,
              score: prevState.score + (parseInt(res.totalResults, 10) || 0), // Safely parse and update score
              curLetter: prevState.nextLetter, // Shift next letter to current
              nextLetter: newLetter, // Generate next letter
              queries: [...prevState.queries, [queryText, res.totalResults]],
              words: [...prevState.words, q],
            };
          });
          console.log(gameState.queries);
          // Clear input field
        })
        .catch((err) => {
          console.error("Error during search:", err.message);
        });
    }
  };

  // Save the score to the backend
  const saveScore = async (userId, score, settings) => {
    console.log("Saving score:", { userId, score, settings });

    try {
      const response = await post("/api/updateSinglePlayerScore", {
        userId,
        score: score,
        settings: JSON.stringify(settings),
      });

      if (response.success) {
        console.log("Score updated successfully:", response);
        // alert("Score saved!");
      } else {
        console.error("Failed to update score:", response);
        alert("Could not save the score.");
      }
    } catch (error) {
      console.error("Error updating score:", error);
      alert("An error occurred while saving the score.");
    }
  };

  useEffect(() => {
    if (isWaiting) return;
    const timer = setInterval(() => {
      setGameState((prevState) => {
        const newTimerValue = prevState.timerValue - 0.1;
        if (newTimerValue <= 0) {
          clearInterval(timer);

          // call saveScore function editing
          saveScore(userId, prevState.score, {
            minLetters: parseInt(minLetters, 10),
            activeTime,
            hideLetter,
            hardMode,
          });
          navigate(`/results/solo`, {
            state: {
              queries: prevState.queries,
              score: prevState.score,
              minLetters: minLetters,
              activeTime: activeTime,
              hardMode: hardMode,
            },
          });
          return { ...prevState, timerValue: 0 }; // Stop timer at 0
        }
        return { ...prevState, timerValue: newTimerValue };
      });
    }, 100); // Update every 10 milliseconds

    return () => clearInterval(timer); // Cleanup timer
  }, [isWaiting]);

  // Trigger the 5-second delay to start the game
  useEffect(() => {
    const timer = setTimeout(() => {
      startGame();
    }, 5000);

    return () => clearTimeout(timer); // Cleanup timer
  }, []);

  const [countdown, setCountdown] = useState(5); // 5 seconds countdown
  useEffect(() => {
    if (isWaiting && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => Math.max(prevCountdown - 1, 0));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isWaiting, countdown]);

  {
    /* scroll bottom bar */
  }

  const resultsContainerRef = useRef(null);

  useEffect(() => {
    if (resultsContainerRef.current) {
      // Scroll to the rightmost part whenever the words change
      resultsContainerRef.current.scrollLeft = resultsContainerRef.current.scrollWidth;
    }
  }, [gameState.words]);

  if (isWaiting) {
    return (
      <>
        <div className="loading-container">
          <div className="countdown-timer">
            <div className="countdown-text">{countdown}</div>
          </div>
          <div className="settings-summary-container">
            <div className="settings-title">Room Settings</div>
            Minimum Length: <span className="white">{minLetters}</span>
            {hideLetter && (
              <div>
                Hide Letter: <span className="green">True</span>
              </div>
            )}
            {!hideLetter && (
              <div>
                Hide Letter: <span className="red">False</span>
              </div>
            )}
            {!hardMode && (
              <div>
                Mode: <span className="white">Regular</span>
              </div>
            )}
            {hardMode && (
              <div>
                Mode: <span className="red">Hard</span>
              </div>
            )}
            Game Timer: <span className="white">{activeTime}</span>
          </div>
        </div>
      </>
    );
  }

  return (
    isLoggedIn && (
    <>
      <div className="game-container">
        {/* Scoreboard */}
        <div className="highscore-container">
          <img src="/images/crown.png" alt="Crown" className="highscore-crown" />
          {parseInt(gameState.highScore).toLocaleString}
        </div>

        <div className="score-container">
          <span className="score-label">Score: </span>
          <span className="score-value">{gameState.score.toLocaleString()}</span>
        </div>

        {/* Results */}
        <div className="result-container">
          <span className="result-count">{gameState.curScore.toLocaleString()}</span> Results for "
          <span className="result-word">{gameState.curQuery}</span>"
        </div>

        {/* Prev Word */}
        <span className="prevword-container">
          <img src="/images/logo.png" className="logo-prevword" />
          <div className="prevword-text">{gameState.prevWord}</div>
        </span>

        {/* Input */}

        <div className="currword-container">
          {gameState.curLetter}
          <input
            type="text"
            id="searchQuery"
            autoFocus={true}
            value={query}
            placeholder=""
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onEnterKeyPress(e)}
            className={`${isError ? "error" : ""}`}
            autoComplete="off"
            style={{
              width: `${query.length + 1}ch`,
            }}
            ref={inputRef}
          />
        </div>
        <hr className="currword-line" />

        {/* Next Letter */}
        {!hideLetter && (
          <div className="random-next-letter">
            <span id="nextLetter">Next Letter: {gameState.nextLetter}</span>
          </div>
        )}

        {/* Query History */}
        <div className="results-list-container" ref={resultsContainerRef}>
          {gameState.words.map((word, index) => (
            <span key={index}>{word} - </span>
          ))}
        </div>

        {/* Timer */}
        <div className="time-container">{Math.max(0, gameState.timerValue.toFixed(1))}</div>
      </div>
    </>
    )
  );
};

export default SinglePlayer_Game;