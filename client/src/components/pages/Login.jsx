import React, { useContext } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../App";
import "../../utilities.css";
import "./Login.css";

const Login = () => {
  const { handleLogin } = useContext(UserContext);

  const navigate = useNavigate();

  const handleSuccess = (credentialResponse) => {
    handleLogin(credentialResponse);
    navigate("/home"); // Navigate to Home after successful login
  };
  const handleGuestLogin = () => {
    const number = Math.floor(Math.random() * 1000000);

    // CHECK NUMBER IS NOT IN DATABASE ALREADY
    handleLogin( {userId: `Guest${number}`, username: `Guest${number}`, profilepicture: `/images/default.png`, setUsername: `Guest${number}`} );
    navigate("/home");
  };
  
  const handleError = (err) => {
    console.error(err);
  };

  return (
    <div className="login-container">
      <div className="title-container">
        <h1 className="chain">
          <img src="/images/logo.png" className="logo-login" />
          <div className="chain-text">Chain</div>
        </h1>
        <h2 className="reaction">Reaction</h2>
        <hr className="reaction-line" />
      </div>
      <button className="guest-login-button" onClick={handleGuestLogin}>
          Continue as Guest
      </button>
      <div className="google-login-container">
        <GoogleLogin onSuccess={handleSuccess} onError={handleError} useOneTap />
      </div>
    </div>
  );
};

export default Login;
