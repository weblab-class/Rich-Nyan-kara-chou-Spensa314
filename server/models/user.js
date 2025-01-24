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

const MultiPlayerSchema = new mongoose.Schema({
  settings: {
    type: String, // JSON string for settings { minLetters, activeTime, hideLetter, hardMode }
    required: true,
  },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
});

const userSchema = new mongoose.Schema({
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
  },
  profilePicture: {
    type: String, // Store the profile picture URL
  },
  singlePlayerScores: {
    type: [SinglePlayerSchema],
    default: [], // Set default to an empty array
  },
  multiPlayerScores: {
    type: [MultiPlayerSchema],
    default: [], // Set default to an empty array
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
