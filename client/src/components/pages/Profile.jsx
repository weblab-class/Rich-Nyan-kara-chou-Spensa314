import React, { useEffect, useState, useContext } from "react";
import "../../utilities.css";
import NavBar from "../modules/NavBar";
import { useNavigate } from "react-router-dom";
import { get, post } from "../../utilities";
import { UserContext } from "../App";

import "./Profile.css";

const Profile = () => {
  const { username, profilepicture, userId } = useContext(UserContext);
  const [currentPicture, setCurrentPicture] = useState(profilepicture);

  const navigate = useNavigate();
  const wins = 0;
  const losses = 0;
  const high_score = 1000000;
  const average_score = 1000;
  // const handleFileChange = async (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   const toBase64 = (file) =>
  //     new Promise((resolve, reject) => {
  //       const reader = new FileReader();
  //       reader.onload = () => resolve(reader.result);
  //       reader.onerror = reject;
  //       reader.readAsDataURL(file);
  //     });

  //   try {
  //     const base64File = await toBase64(file);
  //     console.log("Base64 Encoded Image:", base64File);

  //     // Make a POST request to upload the image
  //     const response = await post("/api/upload-profile-picture", {
  //       userId,
  //       profilePicture: base64File,
  //     });

  //     if (response.success) {
  //       setCurrentPicture(response.profilePicture); // Update profile picture
  //     } else {
  //       alert("Failed to upload image.");
  //     }
  //   } catch (err) {
  //     console.error("Error uploading image:", err);
  //     alert("Error uploading image.");
  //   }
  // };

  // useEffect(() => {
  //   console.log("Profile Picture URL:", profilepicture);
  // }, [profilepicture]);

  // // Helper function to get initials
  // const getInitials = (name) => {
  //   if (!name) return "G"; // Default to "G" for "Guest"
  //   const nameParts = name.split(" ");
  //   return nameParts
  //     .map((part) => part[0].toUpperCase())
  //     .join("")
  //     .slice(0, 2);
  // };

  return (
    <>
      <NavBar />
      <div className="profile-container">
        <div className="profile-personal-container">
          {profilepicture ? (
            <img
              src={currentPicture}
              alt="User Profile Picture"
              className="profile-picture"
              onError={(e) => {
                e.target.src = "/images/default.png"; // Fallback image
              }}
            />
          ) : (
            <div className="profile-placeholder">{username ? username[0].toUpperCase() : "G"}</div>
          )}
          <div className="profile-username">{username || "Guest"}</div>
          {/* make this cuter later */}
          {/* <label className="upload-label">
            Upload Picture
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="upload-input"
            />
          </label> */}
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
