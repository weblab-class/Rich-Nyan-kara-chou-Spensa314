// models/user.js
const mongoose = require("mongoose");

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
});

const User = mongoose.model("User", userSchema);

module.exports = User;
