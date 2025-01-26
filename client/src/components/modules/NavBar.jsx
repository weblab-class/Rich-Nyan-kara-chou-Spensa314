import React, { useContext } from "react";
import { googleLogout } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../App";
import "./NavBar.css";
import "../../utilities.css";
import { useEffect, useState } from "react";
import { get } from "../../utilities";

const NavBar = () => {
  const { userId, username, profilepicture, handleLogout } = useContext(UserContext);
  const [currentPicture, setCurrentPicture] = useState(profilepicture);

  const navigate = useNavigate();

  const handleLogoutClick = () => {
    googleLogout();
    handleLogout();
    navigate("/");
  };

  const handleHomeClick = () => {
    navigate("/home");
  };

  const handleLeaderboardClick = () => {
    navigate("/leaderboard", {
      state: {
        minLetters: 3,
        activeTime: 30,
        hardMode: false,
        hideLetter: false,
      },
    });
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleThemesClick = () => {
    navigate("/themes");
  };

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const handleLogoutButtonClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleLogoutCancel = () => {
    setIsLogoutModalOpen(false);
  };

  return (
    <div className="navbar-container">
      <div onClick={handleHomeClick} className="navigate-home-container navbar-link">
        <img src="/images/logo.png" alt="Logo" className="logo" />
        <div className="title-text">Chain Reaction</div>
      </div>

      <div className="right-container">
        <div onClick={handleProfileClick} className="navbar-link nav-profile">
          {profilepicture ? (
            <img
              src={profilepicture}
              alt="User Profile Picture"
              className="nav-profile-picture"
              onError={(e) => {
                e.target.src = "/images/default.png"; // Fallback image
              }}
            />
          ) : (
            <div></div>
            // <div>{username ? username[0].toUpperCase() : "G"}</div>
          )}
          {username || "Guest"} {/* put in actual name */}
        </div>
        <div onClick={handleThemesClick} className="navbar-link">
          <img src="/images/themes.png" alt="Themes" className="themes" />
        </div>
        <div onClick={handleLeaderboardClick} className="navbar-link">
          <img src="/images/crown.png" alt="Crown" className="leaderboard" />
        </div>
        <div onClick={handleLogoutButtonClick} className="navbar-link">
          <img src="/images/logout.png" alt="Logout" className="logout" />
        </div>
      </div>

      {isLogoutModalOpen && (
        <div className="logout-modal-overlay">
          <div className="logout-container">
            <p className="logout-question">Are you sure you want to logout?</p>
            <div className="logout-button-container">
              <div className="logout-yes logout-button" onClick={handleLogoutClick}>
                Yes
              </div>
              <div className="logout-no logout-button" onClick={handleLogoutCancel}>
                No
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavBar;
