const mongoose = require("mongoose");

const SinglePlayerSchema = new mongoose.Schema({
  settings: {
    type: String, // JSON string for settings { minLetters, activeTime, hideLetter, hardMode }
    required: true,
  },
  highScore: { type: Number, default: 0 },
  queries: { type: [String], default: [] },
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

// this is not standard capitalization
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
  savedThemes: {
    type: [
      {
        name: String,
        cssVariables: String,
      },
    ],
    default: [
      {
        name: "Default",
        cssVariables: `{"--white":"#fff","--light--beige":"#ffebdd","--dull--beige":"#ede0d4","--beige":"#fae0cf","--off--beige":"#f2d3be","--dark--beige":"#e1b89c","--off--dark--beige":"#d2a68a","--light--beige--glass":"rgba(255, 226, 203, 0.353)","--beige--glass":"rgba(202, 162, 130, 0.874)","--brown--glass":"rgba(140, 100, 73, 0.708)","--light--brown":"#b08968","--off--light--brown":"#b17f59","--dark--light--brown":"#a87a55","--brown":"#7f5239","--beige--shadow":"rgb(179, 136, 87)","--off--brown":"#6e452f","--dull--dark--brown":"#5e402c","--dark--brown":"#4a230f","--dark--brown--glass":"#4a230fcf","--off--dark--brown":"#411e0c"}`,
      },
      // {
      //   name: "Rose",
      //   cssVariables: `{"--white":"#fff","--light--beige":"#e8d3dc","--dull--beige":"#e5c6d1","--beige":"#deb9c6","--off--beige":"#d4aebb","--dark--beige":"#c9a3b0","--off--dark--beige":"#be98a5","--light--beige--glass":"rgba(232, 211, 220, 0.353)","--beige--glass":"rgba(206, 163, 176, 0.874)","--brown--glass":"rgba(158, 109, 124, 0.708)","--light--brown":"#b48e9d","--off--light--brown":"#a98391","--dark--light--brown":"#9e7885","--brown":"#8a6371","--beige--shadow":"rgb(181, 142, 156)","--off--brown":"#765660","--dull--dark--brown":"#634850","--dark--brown":"#503941","--dark--brown--glass":"#503941cf","--off--dark--brown":"#42303a"}`,
      // },
      {
        name: "MIT",
        cssVariables: `{"--white":"#fff","--light--beige":"#ffcdd1","--dull--beige":"#edd0d4","--beige":"#fac5cf","--off--beige":"#f2b8be","--dark--beige":"#e19c9c","--off--dark--beige":"#d28a8a","--light--beige--glass":"rgba(255, 203, 209, 0.353)","--beige--glass":"rgba(202, 130, 130, 0.874)","--brown--glass":"rgba(140, 73, 73, 0.708)","--light--brown":"#b06868","--off--light--brown":"#b15959","--dark--light--brown":"#a85555","--brown":"#7f3939","--beige--shadow":"rgb(179, 87, 87)","--off--brown":"#6e2f2f","--dull--dark--brown":"#5e2c2c","--dark--brown":"#4a0f0f","--dark--brown--glass":"#4a0f0fcf","--off--dark--brown":"#410c0c"}`,
      },
      // {
      //   name: "Mint Whisper",
      //   cssVariables: `{"--white":"#ffffff","--light--beige":"#e0f5f1","--dull--beige":"#d4ede7","--beige":"#cff0e6","--off--beige":"#bef2e3","--dark--beige":"#9ce1d0","--off--dark--beige":"#8ad2c3","--light--beige--glass":"rgba(203, 255, 243, 0.353)","--beige--glass":"rgba(130, 202, 186, 0.874)","--brown--glass":"rgba(73, 140, 127, 0.708)","--light--brown":"#68b0a1","--off--light--brown":"#59b19d","--dark--light--brown":"#55a895","--brown":"#397f71","--beige--shadow":"rgb(87, 179, 162)","--off--brown":"#2f6e61","--dull--dark--brown":"#2c5e52","--dark--brown":"#0f4a3d","--dark--brown--glass":"#0f4a3dcf","--off--dark--brown":"#0c4136"}`,
      // },
      // {
      //   name: "Winter Frost",
      //   cssVariables: `{"--white":"#ffffff","--light--beige":"#e6f3ff","--dull--beige":"#d4e1ed","--beige":"#cfe0fa","--off--beige":"#bed3f2","--dark--beige":"#9cb8e1","--off--dark--beige":"#8aa6d2","--light--beige--glass":"rgba(203, 226, 255, 0.353)","--beige--glass":"rgba(130, 162, 202, 0.874)","--brown--glass":"rgba(73, 100, 140, 0.708)","--light--brown":"#6889b0","--off--light--brown":"#597fb1","--dark--light--brown":"#557aa8","--brown":"#39527f","--beige--shadow":"rgb(87, 136, 179)","--off--brown":"#2f456e","--dull--dark--brown":"#2c405e","--dark--brown":"#0f234a","--dark--brown--glass":"#0f234acf","--off--dark--brown":"#0c1e41"}`,
      // },
      {
        name: "Futuristic",
        cssVariables: `{"--white":"#ffffff","--light--beige":"#ffd4d4","--dull--beige":"#e5d8e3","--beige":"#ffc7db","--off--beige":"#ffb6c1","--dark--beige":"#e191b0","--off--dark--beige":"#c77d9b","--light--beige--glass":"rgba(255, 199, 219, 0.353)","--beige--glass":"rgba(199, 125, 155, 0.874)","--brown--glass":"rgba(89, 73, 140, 0.708)","--light--brown":"#8968b0","--off--light--brown":"#7459b1","--dark--light--brown":"#6755a8","--brown":"#394c7f","--beige--shadow":"rgb(87, 102, 179)","--off--brown":"#2f426e","--dull--dark--brown":"#2c3c5e","--dark--brown":"#0f234a","--dark--brown--glass":"#0f234acf","--off--dark--brown":"#0c1e41"}`,
      },
      // {
      //   name: "Lilac Rain",
      //   cssVariables: `{"--white":"#fff","--light--beige":"#f0e6f5","--dull--beige":"#e8ddf0","--beige":"#e6d4f2","--off--beige":"#dcc9ea","--dark--beige":"#d1bce3","--off--dark--beige":"#c5aed8","--light--beige--glass":"rgba(230, 212, 242, 0.353)","--beige--glass":"rgba(197, 174, 216, 0.874)","--brown--glass":"rgba(147, 116, 179, 0.708)","--light--brown":"#9f89b3","--off--light--brown":"#927aa8","--dark--light--brown":"#856c9e","--brown":"#6a4d85","--beige--shadow":"rgb(156, 136, 179)","--off--brown":"#5d4275","--dull--dark--brown":"#513865","--dark--brown":"#422952","--dark--brown--glass":"#422952cf","--off--dark--brown":"#382347"}`,
      // },
      

    ]    
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

// honestly the time complexity is not. the best.
// will revamp it if needed but there are pros and cons to all the different methods
userSchema.post("findOneAndUpdate", async function (doc) {
  if (!doc) return;

  if (!doc.isGuest) {
    // only real users have leaderboard entries
    const Leaderboard = mongoose.model("Leaderboard");
    await Leaderboard.updateMany(
      { playerId: doc._id },
      {
        name: doc.name,
        profilePicture: doc.profilePicture,
      }
    );
  }
});

userSchema.post("save", async function () {
  if (this.isGuest) return;

  const Leaderboard = mongoose.model("Leaderboard");

  await Leaderboard.updateMany(
    { playerId: this._id },
    {
      name: this.name,
      profilePicture: this.profilePicture,
    }
  );
});

const User = mongoose.model("User", userSchema);

module.exports = User;
