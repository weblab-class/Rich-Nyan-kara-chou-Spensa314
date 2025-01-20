import React, { useContext } from "react";
import { googleLogout } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../App";
import "./NavBar.css";
import "../../utilities.css";

const NavBar = () => {
  const { userId, handleLogout } = useContext(UserContext);
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
    navigate("/leaderboard");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <div className="navbar-container">
      <div onClick={handleHomeClick} className="navigate-home-container navbar-link">
        <img src="../../../logo.png" alt="Logo" className="logo" />
        <div className="title-text">Chain Reaction</div>
      </div>

      <div className="right-container">
        <div onClick={handleProfileClick} className="navbar-link nav-profile">
          Name {/* put in actual name */}
        </div>

        <div onClick={handleLeaderboardClick} className="navbar-link">
          <img src="../../../crown.png" alt="Crown" className="leaderboard" />
        </div>
        <div onClick={handleLogoutClick} className="navbar-link">
          <img src="../../../logout.png" alt="Logout" className="logout" />
        </div>
      </div>
    </div>
  );
};

export default NavBar;
