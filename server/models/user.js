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
    unique: true, // Ensure that googleid is unique for both guests and regular users
  },
  email: {
    type: String,
    required: function () {
      return !this.isGuest; // Email is required only for regular users
    },
    sparse: true, // Allow multiple null values (for guests)
    unique: true, // Ensure that email is unique for regular users
  },
  profilePicture: {
    type: String,
    default: "/images/default.png", // Default profile picture for all users
  },
  isGuest: {
    type: Boolean,
    default: false, // Default to false for regular users
  },
  singlePlayerScores: {
    type: [SinglePlayerSchema],
    default: [], // Default to an empty array
  },
  multiPlayerScores: {
    type: [MultiPlayerSchema],
    default: [], // Default to an empty array
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set the creation date
  },
});

// Static method to create a guest user
userSchema.statics.createGuestUser = async function () {
  let isUnique = false;
  let guestId;

  while (!isUnique) {
    const randomNumber = Math.floor(Math.random() * 1000000);
    guestId = `Guest${randomNumber}`;

    // Check if the guestId is unique in the database
    const existingUser = await this.findOne({ googleid: guestId });
    if (!existingUser) {
      isUnique = true;
    }
  }

  // Create and save the guest user
  const guestUser = new this({
    name: guestId, // Use the guestId as the name for simplicity
    googleid: guestId,
    isGuest: true,
    profilePicture: "/images/default.png",
  });

  return guestUser.save(); // Save and return the guest user
};

const User = mongoose.model("User", userSchema);

module.exports = User;
