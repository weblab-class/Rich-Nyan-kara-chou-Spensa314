import React from "react";
import "./NotFound.css";
import { useNavigate } from "react-router-dom";
import "../../utilities.css";

const NotFound = () => {
  const navigate = useNavigate();
  const handleLoginClick = () => {
    navigate("/");
  };

  return (
    <>
      <div className="not-found-container">
        <h1 className="not-found-title">404 Not Found</h1>
        <p className="not-found-text">The page you requested couldn't be found.</p>
        <div onClick={handleLoginClick} className="login-button">
          Go to Login
        </div>
      </div>
    </>
  );
};

export default NotFound;
