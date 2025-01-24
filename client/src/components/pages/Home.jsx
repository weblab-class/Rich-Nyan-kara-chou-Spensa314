import React, { useState, useRef } from "react";
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
    /* falling letters */
  }

  const [letters, setLetters] = useState([]);
  const isGenerating = useRef(false);

  const handleMouseMove = (e) => {
    if (isGenerating.current) return; // Prevent generating letters too often

    // Set the flag to true so letters can't generate until the timeout finishes
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
      tilt: randomRotation, // Store the random rotation in the letter object

      id: Date.now() + Math.random(), // Unique ID for each letter
    };

    setLetters((prevLetters) => [...prevLetters, newLetter]);

    // Remove letter after animation
    setTimeout(() => {
      setLetters((prevLetters) => prevLetters.filter((item) => item.id !== newLetter.id));
    }, fallDuration * 1000); // Same as the animation duration
    setTimeout(() => {
      isGenerating.current = false;
    }, 200); // 200ms delay between generating new letters
  };

  return (
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

        <div className="center-container">
          <div onClick={onMultiplayerClick} className="player-button">
            Multiplayer
          </div>
          <div onClick={onSingleplayerClick} className="player-button">
            Singleplayer
          </div>
        </div>
        <div onClick={onInfoButtonClick} className="info-button">
          ?
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
                <div className="info-text">
                  <span className="info-text-title">Example: </span>
                </div>
                <div className="info-text">
                  "Apple P": "Apple P<span className="info-text-color">ie</span>"
                </div>
                <div className="info-text">
                  {" "}
                  "Pie C": "Pie C<span className="info-text-color">hart</span>"
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
