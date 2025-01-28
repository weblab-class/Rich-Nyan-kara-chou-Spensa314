import React, { useContext, useEffect } from "react";
import { resetThemeVariables } from "../../utilities";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../App";
import { get } from "../../utilities";
import "../../utilities.css";
import "./Login.css";

const Login = () => {
  const { handleLogin, handleGuestLogin } = useContext(UserContext);

  const navigate = useNavigate();

  const handleSuccess = (credentialResponse) => {
    handleLogin(credentialResponse);
    navigate("/home"); // Navigate to Home after successful login
  };

  const handleGuestLoginClick = () => {
    handleGuestLogin(); // Trigger the guest login function from context
    navigate("/home"); // Navigate to Home after guest login
  };

  const handleError = (err) => {
    console.error("Google Login Error:", err);
  };
  useEffect(() => {
    try {
      get("/api/whoami").then((user) => {
        if (user._id) {
          // they are registed in the database, and currently logged in.
          navigate("/home");
        }
      });
      resetThemeVariables();

    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, []);
  return (
    <div className="login-container">
      <div className="title-container">
        <h1 className="chain">
          <img src="/images/logo.png" className="logo-login" alt="App Logo" />
          <div className="chain-text">Chain</div>
        </h1>
        <h2 className="reaction">Reaction</h2>
        <hr className="reaction-line" />
      </div>

      <div className="google-login-container">
        <GoogleLogin onSuccess={handleSuccess} onError={handleError} useOneTap />
      </div>
      <div className="guest-login-button" onClick={handleGuestLoginClick}>
        Continue as Guest
      </div>
    </div>
  );
};

export default Login;
