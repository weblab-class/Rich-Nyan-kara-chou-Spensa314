import React, { useState, useRef, useEffect } from "react";
import "../../utilities.css";
import NavBar from "../modules/NavBar";
import { useNavigate } from "react-router-dom";
import { get } from "../../utilities";
import { updateThemeVariables } from "../../utilities";
import "./Info.css";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [roomCode, setRoomCode] = useState(""); // Define roomCode state
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [theme, setTheme] = useState("");
  useEffect(() => {
    const fetchUserWithRetries = async (retries = 3) => {
      try {
        const res = await get("/api/whoami");
        if (!res.name) {
          if (retries > 0) {
            setTimeout(() => fetchUserWithRetries(retries - 1), 100); // Retry after delay
          } else {
            navigate("/");
          }
        } else {
          setLoggedIn(true);
          if (!res.isGuest && localStorage.getItem("token") === null) {
            navigate("/");
          }
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
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
        navigate("/"); // Navigate to home if fetch fails
      }
    };

    fetchUserWithRetries();
  }, [navigate]);
  const onMultiplayerClick = () => {
    setIsModalOpen(true);
  };
  const onSingleplayerClick = () => {
    navigate(`/room/solo`, {
      state: {
        minLetters: 3,
        activeTime: 30,
        hardMode: false,
        hideLetter: false,
      },
    });
  };
  const onExitClick = () => {
    setIsModalOpen(false);
  };

  const onCreateRoomClick = async () => {
    let genRoom = null;
    let anotherRoom = true;

    while (anotherRoom) {
      const newRoomCode = Math.floor(Math.random() * 10000).toString();

      try {
        const res = await get(`/api/activeRooms/${newRoomCode}`);

        if (res === false) {
          anotherRoom = false;
          genRoom = newRoomCode;
        }
      } catch (err) {
        console.error("Error checking room code:", err);
        return; // Exit early if there's an error
      }
    }

    // Set the room code and navigate once a valid code is generated
    setRoomCode(genRoom);
    console.log("Generated room code:", genRoom);
    navigate(`/room/${genRoom}`, {
      state: {
        hideLetter: false,
        hardMode: false,
        minLetters: 3,
        time: 30,
      },
    });
  };

  const onJoinRoomClick = () => {
    get(`/api/room/${roomCode}`).then((res) => {
      if (res.exists === true) {
        get(`/api/getRoom/${roomCode}`).then((res) => {
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

  const onInfoButtonClick = () => {
    setIsInfoModalOpen(true);
  };

  const onInfoExitClick = () => {
    setIsInfoModalOpen(false);
  };

  {
    /* autofocus */
  }
  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => {
        document.getElementById("roomCode")?.focus();
      }, 250); // Adjust delay if necessary
    }
  }, [isModalOpen]);

  {
    /* falling letters */
  }

  const [letters, setLetters] = useState([]);
  const isGenerating = useRef(false);

  const handleMouseMove = (e) => {
    if (isGenerating.current) return;

    isGenerating.current = true;
    const randomLetter = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const letter = randomLetter.charAt(Math.floor(Math.random() * randomLetter.length));
    const randomSize = Math.floor(Math.random() * 15) + 15; // Random size between 10px and 30px
    const fallDuration = Math.random() * 10 + 5; // Random fall duration between 2s and 10s
    const randomRotation = Math.random() * 720 - 360; // Value between -180 and 180 degrees

    const newLetter = {
      letter,
      x: e.pageX,
      y: e.pageY,
      size: randomSize,
      fallDuration,
      tilt: randomRotation,

      id: Date.now() + Math.random(),
    };

    setLetters((prevLetters) => [...prevLetters, newLetter]);

    // Remove letter after animation
    setTimeout(() => {
      setLetters((prevLetters) => prevLetters.filter((item) => item.id !== newLetter.id));
    }, fallDuration * 1000);
    setTimeout(() => {
      isGenerating.current = false;
    }, 300); // 200ms delay between generating new letters
  };

  {
    /* info animation */
  }

  const [prevWord, setPrevWord] = useState("Door"); // Set the last word initially
  const [currWord, setCurrWord] = useState("Handle");
  const [isAnimating, setIsAnimating] = useState(false);
  const words = ["Door", "Handle", "Bar", "Fight", "Back"];

  useEffect(() => {
    const intervalDuration = 4000; // the interval duration
    setIsAnimating(true);

    const interval = setInterval(() => {
      const currentIndex = words.indexOf(currWord);
      const nextIndex = (currentIndex + 1) % 5;
      setPrevWord(currWord);
      setCurrWord(words[nextIndex]);

      // Clean up timeout on the next cycle
    }, intervalDuration);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [prevWord, currWord]); // Only runs when currWord changes

  return !isLoggedIn ? (
    <div className="intermediate-container"></div>
  ) : (
    <>
      <NavBar />
      <div className="home-container" onMouseMove={handleMouseMove}>
        {letters.map((item) => (
          <div
            key={item.id}
            className="letter"
            style={{
              left: item.x,
              top: item.y,
              fontSize: `${item.size}px`,
              "--tiltamount": `${item.tilt}deg`, // Apply random tilt
              animationDuration: `${item.fallDuration}s`, // Set random fall speed
              animationTimingFunction: "linear", // Smooth fall
              animationName: "fall", // Apply falling animation
            }}
          >
            {item.letter}
          </div>
        ))}
        <div onClick={onInfoButtonClick} className="how-to-play-button">
          How to Play
        </div>
        <div className="center-container">
          <div onClick={onMultiplayerClick} className="player-button">
            Multiplayer
          </div>
          <div onClick={onSingleplayerClick} className="player-button">
            Singleplayer
          </div>
        </div>

        {isModalOpen && (
          <div className="room-modal-overlay">
            <div className="room-modal-container">
              <div onClick={onExitClick} className="room-button close-button">
                X
              </div>

              <div className="join-room-container">
                <input
                  type="text"
                  id="roomCode"
                  className="room-code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  placeholder="Room Code"
                  autoComplete="off"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onJoinRoomClick(); // Trigger the join room click when Enter is pressed
                    }
                  }}
                />

                <div onClick={onJoinRoomClick} className="room-button join-room-button">
                  Join
                </div>
              </div>
              <div onClick={onCreateRoomClick} className="room-button create-room-button">
                Create Room
              </div>
            </div>
          </div>
        )}

        {isInfoModalOpen && (
          <div className="room-modal-overlay">
            <div className="info-modal-container">
              <div className="info-text-container">
                <div className="info-title">How to Play</div>
                <div className="example-container">
                  <h1 className="prev-word-container">
                    <img src="/images/logo.png" className="info-logo" />
                    <div className="prev-word-text">{prevWord}</div>
                  </h1>
                  <h2 className={`curr-word-text ${isAnimating ? "typing" : ""}`} key={currWord}>
                    <span className={"first-letter"}>{currWord.charAt(0)}</span>
                    {currWord.slice(1)}
                  </h2>
                  <hr className="curr-word-line" />
                </div>
                <div className="info-text">
                  <span className="info-text-title">Objective: </span> Score as many points as
                  possible by entering the trendiest search terms.
                </div>
                <div className="info-text">
                  <span className="info-text-title">Game Mechanics: </span> You are finding the
                  trendiest 2-word phrase. You are given the first word and the starting letter of
                  the second word. You are to fill in the second word. Once you enter your phrase,
                  the second word becomes the first word and you are provided with a new letter.
                  This process is repeated within the given time limit.
                </div>
                <div className="separator" />
                <div className="info-title">Settings</div>
                <div className="info-text">
                  <span className="info-text-title">Min Letters: </span> Each word must be a minimum
                  of 3 letters long. This can be increased up to a minimum of 6 letters. Only
                  characters found in the English alphabet can be used.
                </div>
                <div className="info-text">
                  <span className="info-text-title">Time: </span> You have 30 seconds to score as
                  many points as possible. This can be increased to 60 seconds.
                </div>
                <div className="info-text">
                  <span className="info-text-title">Hide Next Letter: </span> You are shown the
                  starting letter of the next word in the sequence. You have the option to hide this
                  letter.
                </div>
                <div className="info-text">
                  <span className="info-text-title">Hard Mode: </span> By default, common letters
                  have a higher likelihood of being selected as the starting letter. In Hard Mode,
                  all letters are equally likely to be chosen.
                </div>
              </div>
              <div onClick={onInfoExitClick} className="room-button info-close-button">
                X
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
