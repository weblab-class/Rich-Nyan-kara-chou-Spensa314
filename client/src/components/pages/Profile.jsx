import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../utilities.css";
import NavBar from "../modules/NavBar";
import { get, post } from "../../utilities";
import { UserContext } from "../App";
import "./Profile.css";

const Profile = () => {
  const { username, setUsername, profilepicture, userId } = useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(username);
  const [averageScore, setAverageScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [minLetters, setMinLetters] = useState(3);
  const [activeTime, setActiveTime] = useState(30);
  const [hardMode, setHardMode] = useState(false);
  const [hideLetter, setHideLetter] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const [settings, setSettings] = useState(
  //   '{"minLetters":3,"activeTime":30,"hideLetter":false,"hardMode":false}'
  // ); // Default setting
  const navigate = useNavigate();

  get("/api/whoami").then((res) => {
      if (!res.name) {
          navigate("/");
          return;
      }
      setIsLoggedIn(true);
    })

  const handleEditClick = () => setIsEditing(true);

  const handleCancelEdit = () => {
    setNewUsername(username); // Reset to the original username
    setIsEditing(false);
  };

  const handleSaveClick = async () => {
    const trimmedUsername = newUsername.trim();
    if (!trimmedUsername) {
      alert("Username cannot be empty.");
      return;
    }

    try {
      const response = await post("/api/update-username", { userId, newUsername: trimmedUsername });
      if (response.success) {
        // alert("Username updated successfully!");
        setUsername(trimmedUsername);
        setIsEditing(false);
      } else {
        alert("Failed to update username.");
      }
    } catch (err) {
      console.error("Error updating username:", err);
      alert("An error occurred while updating the username.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSaveClick();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  useEffect(() => {
    const fetchHighScore = async () => {
      try {
        const settings = JSON.stringify({
          minLetters: parseInt(minLetters, 10),
          activeTime: parseInt(activeTime, 10),
          hideLetter: hideLetter,
          hardMode: hardMode,
        });
        console.log("Sending: ", userId, settings);
        const response = await get("/api/getScores", { userId, settings });

        if (response.error) {
          console.error("Error in response:", response.error);
          setHighScore(0);
          setAverageScore(0);
        } else {
          setHighScore(response.highScore);
          setAverageScore(response.averageScore);
          setWins(response.wins);
          setLosses(response.losses);
        }
      } catch (error) {
        console.error("Error fetching scores:", error);
      }
    };
    fetchHighScore();
  }, [userId, minLetters, activeTime, hideLetter, hardMode]);

  {
    /* settings */
  }
  const onMinLettersClick = () => {
    if (minLetters === 6) {
      setMinLetters(3);
    } else {
      setMinLetters(minLetters + 1);
    }
  };

  const onTimeClick = () => {
    if (activeTime === 30) {
      setActiveTime(60);
    } else {
      setActiveTime(30);
    }
  };

  const onHardModeClick = () => {
    setHardMode(!hardMode);
  };

  const onNextLetterClick = () => {
    setHideLetter(!hideLetter);
  };

  return (
    !isLoggedIn ? 
    <div className="intermediate-container">
    </div>:(
    <>
      <NavBar />
      <div className="profile-container">
        <div className="profile-personal-container">
          {profilepicture ? (
            <img
              src={profilepicture || "/images/default.png"}
              alt={`${username}'s Profile Picture`}
              className="profile-picture"
            />
          ) : (
            <div className="profile-placeholder">{username ? username[0].toUpperCase() : "G"}</div>
          )}
          <div className="profile-username-container">
            {isEditing ? (
              <div className="profile-username">
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="profile-username-input"
                  onBlur={handleCancelEdit} //we click outside of the textbox
                  onKeyDown={handleKeyDown} //enter vs esc
                  autoFocus //so that we type as soon as we press edit-icon
                  maxLength={20}
                />
              </div>
            ) : (
              <div className="profile-username">
                <span onClick={handleEditClick}>{username}</span>
                <img
                  src="/images/editicon.png"
                  alt="Edit"
                  className="profile-edit-icon"
                  onClick={handleEditClick}
                />
              </div>
            )}
          </div>
        </div>

        <div className="profile-statistics-container">
          <div className="profile-statistics-title">Statistics</div>
          <div className="profile-statistics-content-container">
            <div className="profile-statistics-category-container">
              <div className="profile-statistics-category-title">Multiplayer</div>
              <div className="profile-statistics-category-category">Wins</div>
              <div className="profile-statistics-category-spcontent">
                {parseInt(wins).toLocaleString()}
              </div>
              <div className="profile-statistics-category-category">Losses</div>
              <div className="profile-statistics-category-spcontent">
                {parseInt(losses).toLocaleString()}
              </div>
            </div>
            <div className="profile-statistics-category-container">
              <div className="profile-statistics-category-title">Singleplayer</div>
              <div className="profile-statistics-category-category">Average Score</div>
              <div className="profile-statistics-category-mpcontent">
                {parseInt(averageScore).toLocaleString()}
              </div>
              <div className="profile-statistics-category-category">High Score</div>
              <div className="profile-statistics-category-mpcontent">
                {parseInt(highScore).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="p-leaderboard-settings-container">
            <div className="p-leaderboard-dropdown-container" onClick={onMinLettersClick}>
              Min Letters: {minLetters}
            </div>
            <div className="p-leaderboard-dropdown-container" onClick={onTimeClick}>
              Time: {activeTime}
            </div>
            <div className="p-leaderboard-dropdown-container" onClick={onHardModeClick}>
              {hardMode ? "Hard Mode" : "Normal Mode"}
            </div>
            <div className="p-leaderboard-dropdown-container" onClick={onNextLetterClick}>
              {hideLetter ? "Next Letter: Hidden" : "Next Letter: Shown"}
            </div>
          </div>
        </div>
      </div>
    </>
    )
  );
};

export default Profile;
