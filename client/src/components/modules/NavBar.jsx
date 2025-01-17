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

  return (
    <div className="navbar-container">
      <div onClick={handleHomeClick} className="navigate-home-container navbar-link">
        <img src="../../../logo.png" alt="Logo" className="logo" />
        <div className="title-text">Chain Reaction</div>
      </div>

      <div onClick={handleLogoutClick} className="navbar-link">
        <img src="../../../logout.png" alt="Logout" className="logout" />
      </div>
    </div>
  );
};

export default NavBar;
