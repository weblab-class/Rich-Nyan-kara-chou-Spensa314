import React, { useEffect, useState, useContext } from "react";
import "../../utilities.css";
import NavBar from "../modules/NavBar";
import { useNavigate } from "react-router-dom";
import { get } from "../../utilities";
import { UserContext } from "../App";

import "./Profile.css";

const Profile = () => {
  const { username, profilepicture } = useContext(UserContext);

  return (
    <>
      <NavBar />
      <div className="profile-container">
        <div className="profile-personal-container">
          <img
            src={profilepicture || "/images/default.png"}
            alt="profilepicture"
            className="profile-picture"
          />
          <div className="profile-username">{username || "Guest"}</div>
        </div>

        <div className="profile-statistics-container">
          <div className="profile-statistics-title">Statistics</div>
          <div className="profile-statistics-content-container">
            <div className="profile-statistics-category-container">
              <div className="profile-statistics-category-title">Multiplayer</div>
              <div className="profile-statistics-category-category">Wins</div>
              <div className="profile-statistics-category-spcontent">0</div>{" "}
              {/**change when done */}
              <div className="profile-statistics-category-category">Losses</div>
              <div className="profile-statistics-category-spcontent">7</div>{" "}
              {/**change when done */}
            </div>
            <div className="profile-statistics-category-container">
              <div className="profile-statistics-category-title">Singleplayer</div>
              <div className="profile-statistics-category-category">Average Score</div>
              <div className="profile-statistics-category-mpcontent">10,000</div>{" "}
              {/**change when done */}
              <div className="profile-statistics-category-category">High Score</div>
              <div className="profile-statistics-category-mpcontent">10,000,000,000</div>{" "}
              {/**change when done */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
