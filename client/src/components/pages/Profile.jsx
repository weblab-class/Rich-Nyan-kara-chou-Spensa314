import React, { useEffect, useState, useContext } from "react";
import "../../utilities.css";
import NavBar from "../modules/NavBar";
import { useNavigate } from "react-router-dom";
import { get } from "../../utilities";
import { UserContext } from "../App";

import "./Profile.css";

const Profile = () => {
  const { username } = useContext(UserContext);
  const wins = 0;
  const losses = 0;
  const high_score = 1000000;
  const average_score = 1000;

  return (
    <>
      <NavBar />
      <div className="profile-container">
        <div className="profile-personal-container">
          <img src="/images/default.png" alt="profilepicture" className="profile-picture" />
          <div className="profile-username">{username || "Guest"}</div>
        </div>

        <div className="profile-statistics-container">
          <div className="profile-statistics-title">Statistics</div>
          <div className="profile-statistics-content-container">
            <div className="profile-statistics-category-container">
              <div className="profile-statistics-category-title">Multiplayer</div>
              <div className="profile-statistics-category-category">Wins</div>
              <div className="profile-statistics-category-spcontent">
                {parseInt(wins).toLocaleString()}
              </div>{" "}
              {/**change when done */}
              <div className="profile-statistics-category-category">Losses</div>
              <div className="profile-statistics-category-spcontent">
                {parseInt(losses).toLocaleString()}
              </div>{" "}
              {/**change when done */}
            </div>
            <div className="profile-statistics-category-container">
              <div className="profile-statistics-category-title">Singleplayer</div>
              <div className="profile-statistics-category-category">Average Score</div>
              <div className="profile-statistics-category-mpcontent">
                {parseInt(average_score).toLocaleString()}
              </div>{" "}
              {/**change when done */}
              <div className="profile-statistics-category-category">High Score</div>
              <div className="profile-statistics-category-mpcontent">
                {parseInt(high_score).toLocaleString()}
              </div>{" "}
              {/**change when done */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
