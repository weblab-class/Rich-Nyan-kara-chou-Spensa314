import React, { useState, useContext } from "react";
import "../../utilities.css";
import NavBar from "../modules/NavBar";
import { post } from "../../utilities";
import { UserContext } from "../App";
import "./Profile.css";

const Profile = () => {
  const { username, setUsername, profilepicture, userId } = useContext(UserContext);
  const [currentPicture, setCurrentPicture] = useState(profilepicture);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(username);

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

  const wins = 0;
  const losses = 0;
  const high_score = 1000000;
  const average_score = 1000;

  return (
    <>
      <NavBar />
      <div className="profile-container">
        <div className="profile-personal-container">
          {profilepicture ? (
            <img
              src={currentPicture || "/images/default.png"}
              alt={`${username || "Guest"}'s Profile Picture`}
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
                <span onClick={handleEditClick}>{username || "Guest"}</span>
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
                {parseInt(average_score).toLocaleString()}
              </div>
              <div className="profile-statistics-category-category">High Score</div>
              <div className="profile-statistics-category-mpcontent">
                {parseInt(high_score).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
