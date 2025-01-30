import React, { useState, useEffect, createContext } from "react";
import { Outlet } from "react-router-dom";

import jwt_decode from "jwt-decode";

import "../utilities.css";

import { socket } from "../client-socket";

import { get, post } from "../utilities";

export const UserContext = createContext(null);

/**
 * Define the "App" component
 */
const App = () => {
  const [userId, setUserId] = useState(undefined);
  const [username, setUsername] = useState("");
  const [isGuest, setGuest] = useState(false);
  const [profilepicture, setProfilePicture] = useState("");
  const [savedThemes, setSavedThemes] = useState([]);
  useEffect(() => {
    get("/api/whoami").then((user) => {
      if (user._id) {
        setUserId(user._id);
        if (user.name) {
          setUsername(user.name);
        }
        if (user.profilePicture) {
          setProfilePicture(user.profilePicture);
        }
      }
    });
  }, []);

  const handleLogin = (credentialResponse) => {
    const userToken = credentialResponse.credential;
    const decodedCredential = jwt_decode(userToken);
    console.log(`Logged in as ${decodedCredential.name}`);
    post("/api/login", { token: userToken }).then((user) => {
      if (user.token) {
        localStorage.setItem("token", user.token); // Store JWT in localStorage
      } else {
        console.error("Token missing in backend response");
      }
      setUserId(user.user._id);
      // if (user.name) {
      setUsername(user.user.name); //should be required
      // }
      setProfilePicture(user.user.profilePicture);
      get("/api/whoami").then((updatedUser) => {
        // setUserId(updatedUser._id); //this should never change tho-
        setUsername(updatedUser.name); // fetching the right one
        setProfilePicture(updatedUser.profilePicture);
        setGuest(false);
        get(`/api/getSavedThemes/${user.user._id}`).then((themes) => {
          setSavedThemes(themes || []); // Populate themes from the server
        })
        .catch((err) => {
          console.error("Failed to fetch saved themes:", err);
        });
      });
      post("/api/initsocket", { socketid: socket.id });
    });
  };

  const handleGuestLogin = async () => {
    try {
      const response = await post("/api/guestlogin"); // Send guest login request
      setUserId(response._id);
      setUsername(response.name);
      setProfilePicture(response.profilePicture);
      get(`/api/getSavedThemes/${response._id}`).then((themes) => {
        setSavedThemes(themes || []); // Populate themes from the server
      })
      .catch((err) => {
        console.error("Failed to fetch saved themes:", err);
      });
      setGuest(true);
      // Initialize socket after successful guest login
      if (socket && socket.id) {
        await post("/api/initsocket", { socketid: socket.id });
      }
  
      // Optionally log the guest user session
      console.log("Logged in as guest:", response);
    } catch (err) {
      console.error("Guest login failed:", err);
      alert("Unable to log in as Guest. Please try again.");
    }
  };

  const handleLogout = () => {
    setUserId(undefined);
    setUsername("");
    post("/api/logout");
  };

  const authContextValue = {
    userId,
    username,
    profilepicture,
    setUsername,
    savedThemes,
    handleLogin,
    handleGuestLogin,
    handleLogout,
  };

  return (
    <UserContext.Provider value={authContextValue}>
      <Outlet />
    </UserContext.Provider>
  );
};

export default App;
