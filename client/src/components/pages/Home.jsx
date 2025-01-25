import React, { useState, useRef, useEffect } from "react";
import "../../utilities.css";
import NavBar from "../modules/NavBar";
import { useNavigate } from "react-router-dom";
import { get } from "../../utilities";
import "./Info.css";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [roomCode, setRoomCode] = useState(""); // Define roomCode state
  const [isLoggedIn, setLoggedIn] = useState(false);
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
        }
        else{
          setLoggedIn(true);
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
    navigate(`/room/solo`);
  };
  const onExitClick = () => {
    setIsModalOpen(false);
  };

  const onCreateRoomClick = () => {
    const newRoomCode = Math.floor(Math.random() * 10000).toString();
    setRoomCode(newRoomCode);
    console.log(newRoomCode);
    navigate(`/room/${newRoomCode}`, { state: { host: true } });
  };

  const onJoinRoomClick = () => {
    get(`/api/room/${roomCode}`).then((res) => {
      console.log(res);
      if (res.exists === true) {
        console.log(res);
        get(`/api/getRoom/${roomCode}`).then((res) => {
          console.log(res);
          if (res === true) {
            alert("Game already started!");
          } else {
            navigate(`/room/${roomCode}`, { state: { host: false } });
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
    }, 200); // 200ms delay between generating new letters
  };

  {
    /* info animation */
  }

  const [prevWord, setPrevWord] = useState("Chain"); // Set the last word initially
  const [currWord, setCurrWord] = useState("Reaction");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const intervalDuration = 4000; // the interval duration
    setIsAnimating(true);

    const interval = setInterval(() => {
      if (currWord === "Chain") {
        setPrevWord("Chain");
        setCurrWord("Reaction");
      } else {
        setPrevWord("Reaction");
        setCurrWord("Chain");
      }

      // Clean up timeout on the next cycle
    }, intervalDuration);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [prevWord, currWord]); // Only runs when currWord changes

  useEffect(() => {
    if (isInfoModalOpen) {
      setPrevWord("Chain");
      setCurrWord("Reaction");
      setIsAnimating(false);
    }
  }, [isInfoModalOpen]); // Dependency on modal opening

  return (
    isLoggedIn && (
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
                  <span className="info-text-title">Objective: </span> Score the highest points by
                  entering the trendiest search terms.
                </div>
                <div className="info-text">
                  <span className="info-text-title">Game Mechanics: </span> You're given a starting
                  word and the starting letter for the following word in the phrase. You are to fill
                  in the following word. Once you enter your phrase, the word you filled in will now
                  become the starting word. This process is repeated within the given time limit.
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
    )
  );
  
};

export default Home;
