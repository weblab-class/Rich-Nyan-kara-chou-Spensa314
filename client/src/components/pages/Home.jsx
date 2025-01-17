import React, { useState } from "react";
import "../../utilities.css";
import NavBar from "../modules/NavBar";
import { useNavigate } from "react-router-dom";

import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomCode, setRoomCode] = useState(""); // Define roomCode state

  const onMultiplayerClick = () => {
    setIsModalOpen(true);
  };
  const onSingleplayerClick = () => {
    navigate("/singleplayer-start-page");
  };
  const onExitClick = () => {
    setIsModalOpen(false);
  };

  const onCreateRoomClick = () => {
    navigate("/multiplayer-start-page");
  };

  const onJoinRoomClick = () => {
    /* pass in id and navigate to multiplayer start page with id*/
  };

  return (
    <>
      <NavBar />
      <div className="home-container">
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
      </div>
    </>
  );
};

export default Home;
