// models/user.js
const mongoose = require("mongoose");

const SinglePlayerSchema = new mongoose.Schema({
  settings: {
    type: String, // JSON string for settings { minLetters, activeTime, hideLetter, hardMode }
    required: true,
  },
  highScore: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
  gamesPlayed: { type: Number, default: 0 },
});

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  googleid: {
    type: String,
    required: true,
    unique: true, // Ensure that googleid is unique
  },
  email: {
    type: String,
    required: true,
    unique: true, //making sure? shouldn't change anything
  },
  profilePicture: {
    type: String, // Store the profile picture URL
  },
  singlePlayerScores: [SinglePlayerSchema], // Array
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
