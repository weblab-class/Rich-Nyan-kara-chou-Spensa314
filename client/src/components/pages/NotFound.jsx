import React from "react";
import { useEffect } from "react";
import "./NotFound.css";
import { useNavigate, useLocation } from "react-router-dom";
import {get} from "../../utilities";
import "../../utilities.css";
import { useState } from "react";
import { updateThemeVariables } from "../../utilities";


const NotFound = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    get("/api/whoami").then((res) => {
        if (!res.name) {
            navigate("/");
            return;
        }
        setIsLoggedIn(true);

        const savedTheme = localStorage.getItem("selectedTheme");

        if (savedTheme) {
          try {
            const parsedTheme = JSON.parse(savedTheme);
            // Apply the saved theme globally
            updateThemeVariables(parsedTheme.cssVariables);
          } catch (err) {
            console.error("Error parsing saved theme from localStorage:", err);
          }
        }
      })
  }, []);
  
  const handleLoginClick = () => {
    navigate("/");
  };

  return (
    !isLoggedIn ? 
    <div className="intermediate-container">
    </div>:(
    <>
      <div className="not-found-container">
        <h1 className="not-found-title">404 Not Found</h1>
        <p className="not-found-text">The page you requested couldn't be found.</p>
        <div onClick={handleLoginClick} className="login-button">
          Go to Login
        </div>
      </div>
    </>
    )
  );
};

export default NotFound;
