const mongoose = require("mongoose");

const leaderboardSchema = new mongoose.Schema({
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User", // Reference to the User model
  },
  name: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String, // URL to the profile picture
  },
  highScore: {
    type: Number,
    required: true,
    default: 0,
  },
  settings: {
    type: String, // JSON string for settings { minLetters, activeTime, hideLetter, hardMode }
    required: true,
  },
  rank: {
    type: Number, // Rank based on the score, calculated each time
  },
});

const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema);

module.exports = Leaderboard;
