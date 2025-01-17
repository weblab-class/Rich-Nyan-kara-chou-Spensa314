import React, { useState } from "react";
import "../../utilities.css";
import NavBar from "../modules/NavBar";
import { useNavigate } from "react-router-dom";

import "./Leaderboard.css";

const Leaderboard = () => {
  return (
    <>
      <NavBar />
      <div className="leaderboard-container">
        <h1 className="leaderboard-title">Leaderboard</h1>
      </div>
      ;
    </>
  );
};

export default Leaderboard;
