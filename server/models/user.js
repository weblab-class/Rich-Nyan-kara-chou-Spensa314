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
      {
        name: "Deep Ocean",
        cssVariables: `{"--white":"#ffffff","--light--beige":"#c2e6ff","--dull--beige":"#a3d5f5","--beige":"#7fb8e6","--off--beige":"#5a9fd6","--dark--beige":"#4183b8","--off--dark--beige":"#336c99","--light--beige--glass":"rgba(194, 230, 255, 0.353)","--beige--glass":"rgba(127, 184, 230, 0.874)","--brown--glass":"rgba(51, 108, 153, 0.708)","--light--brown":"#1e5885","--off--light--brown":"#154875","--dark--light--brown":"#0d3961","--brown":"#072947","--beige--shadow":"rgb(51, 108, 153)","--off--brown":"#051f38","--dull--dark--brown":"#031628","--dark--brown":"#020e1a","--dark--brown--glass":"#020e1acf","--off--dark--brown":"#010a14"}`,
      },
      {
        name: "Chill Vibes",
        cssVariables: `{"--white":"#ffffff","--light--beige":"#d4f5f5","--dull--beige":"#c4e8e8","--beige":"#b4f0f0","--off--beige":"#a3e7e7","--dark--beige":"#8cd9d9","--off--dark--beige":"#7ccece","--light--beige--glass":"rgba(180, 240, 240, 0.353)","--beige--glass":"rgba(140, 217, 217, 0.874)","--brown--glass":"rgba(89, 178, 178, 0.708)","--light--brown":"#59b2b2","--off--light--brown":"#4da6a6","--dark--light--brown":"#419999","--brown":"#2d7373","--beige--shadow":"rgb(89, 178, 178)","--off--brown":"#1f5959","--dull--dark--brown":"#184747","--dark--brown":"#0f3333","--dark--brown--glass":"#0f3333cf","--off--dark--brown":"#0c2626"}`,
      },
      {
        name: "American Dream",
        cssVariables: `{"--white":"#ffffff","--light--beige":"#e6f3ff","--dull--beige":"#d4e1ed","--beige":"#cfe0fa","--off--beige":"#bed3f2","--dark--beige":"#9cb8e1","--off--dark--beige":"#8aa6d2","--light--beige--glass":"rgba(203, 226, 255, 0.353)","--beige--glass":"rgba(130, 162, 202, 0.874)","--brown--glass":"rgba(73, 100, 140, 0.708)","--light--brown":"#6889b0","--off--light--brown":"#597fb1","--dark--light--brown":"#557aa8","--brown":"#39527f","--beige--shadow":"rgb(87, 136, 179)","--off--brown":"#2f456e","--dull--dark--brown":"#2c405e","--dark--brown":"#0f234a","--dark--brown--glass":"#0f234acf","--off--dark--brown":"#0c1e41"}`,
      },
      {
        name: "Zebra",
        cssVariables: `{"--white":"#FFFFFF","--light--beige":"#F5F5F5","--dull--beige":"#E8E8E8","--beige":"#ECECEC","--off--beige":"#DDDDDD","--dark--beige":"#D3D3D3","--off--dark--beige":"#C8C8C8","--light--beige--glass":"rgba(245, 245, 245, 0.353)","--beige--glass":"rgba(220, 220, 220, 0.874)","--brown--glass":"rgba(80, 80, 80, 0.708)","--light--brown":"#888888","--off--light--brown":"#707070","--dark--light--brown":"#606060","--brown":"#404040","--beige--shadow":"rgb(180, 180, 180)","--off--brown":"#303030","--dull--dark--brown":"#252525","--dark--brown":"#1A1A1A","--dark--brown--glass":"#1A1A1Acf","--off--dark--brown":"#000000"}`,
      },
      {
        name: "MIT Cardinals",
        cssVariables: `{"--white":"#fff","--light--beige":"#ffcdd1","--dull--beige":"#edd0d4","--beige":"#fac5cf","--off--beige":"#f2b8be","--dark--beige":"#e19c9c","--off--dark--beige":"#d28a8a","--light--beige--glass":"rgba(255, 203, 209, 0.353)","--beige--glass":"rgba(202, 130, 130, 0.874)","--brown--glass":"rgba(140, 73, 73, 0.708)","--light--brown":"#b06868","--off--light--brown":"#b15959","--dark--light--brown":"#a85555","--brown":"#7f3939","--beige--shadow":"rgb(179, 87, 87)","--off--brown":"#6e2f2f","--dull--dark--brown":"#5e2c2c","--dark--brown":"#4a0f0f","--dark--brown--glass":"#4a0f0fcf","--off--dark--brown":"#410c0c"}`,
      },
      {
        name: "Silver Mirage",
        cssVariables: `{"--white":"#ffffff","--light--beige":"#e0e8ed","--dull--beige":"#d4dde2","--beige":"#cfd8e0","--off--beige":"#bec7d2","--dark--beige":"#9ca8b8","--off--dark--beige":"#8a96a6","--light--beige--glass":"rgba(203, 215, 255, 0.353)","--beige--glass":"rgba(130, 147, 202, 0.874)","--brown--glass":"rgba(73, 86, 140, 0.708)","--light--brown":"#687d89","--off--light--brown":"#596e7b","--dark--light--brown":"#4f6270","--brown":"#394852","--beige--shadow":"rgb(87, 108, 179)","--off--brown":"#2f3d4e","--dull--dark--brown":"#2c3640","--dark--brown":"#1f2830","--dark--brown--glass":"#1f2830cf","--off--dark--brown":"#1a222a"}`,
      },
      {
        name: "Lavender Haze",
        cssVariables: `{"--white":"#fff","--light--beige":"#e6d6f3","--dull--beige":"#e0d4ed","--beige":"#d8c6ef","--off--beige":"#cdb8e6","--dark--beige":"#b69dd6","--off--dark--beige":"#a58cc9","--light--beige--glass":"rgba(214, 203, 239, 0.353)","--beige--glass":"rgba(162, 130, 202, 0.874)","--brown--glass":"rgba(99, 73, 140, 0.708)","--light--brown":"#8968b0","--off--light--brown":"#7959b1","--dark--light--brown":"#7455a8","--brown":"#522379","--beige--shadow":"rgb(136, 87, 179)","--off--brown":"#461d6e","--dull--dark--brown":"#3c195e","--dark--brown":"#2f0f4a","--dark--brown--glass":"#2f0f4acf","--off--dark--brown":"#290c41"}`,
      },
      {
        name: "Mint Whisper",
        cssVariables: `{"--white":"#ffffff","--light--beige":"#e0f5f1","--dull--beige":"#d4ede7","--beige":"#cff0e6","--off--beige":"#bef2e3","--dark--beige":"#9ce1d0","--off--dark--beige":"#8ad2c3","--light--beige--glass":"rgba(203, 255, 243, 0.353)","--beige--glass":"rgba(130, 202, 186, 0.874)","--brown--glass":"rgba(73, 140, 127, 0.708)","--light--brown":"#68b0a1","--off--light--brown":"#59b19d","--dark--light--brown":"#55a895","--brown":"#397f71","--beige--shadow":"rgb(87, 179, 162)","--off--brown":"#2f6e61","--dull--dark--brown":"#2c5e52","--dark--brown":"#0f4a3d","--dark--brown--glass":"#0f4a3dcf","--off--dark--brown":"#0c4136"}`,
      },
      {
        name: "Vintage",
        cssVariables: `{"--white":"#fff","--light--beige":"#f0e4d4","--dull--beige":"#e6d5c3","--beige":"#dcc7b4","--off--beige":"#d2baa5","--dark--beige":"#c4a68e","--off--dark--beige":"#b69580","--light--beige--glass":"rgba(240, 228, 212, 0.353)","--beige--glass":"rgba(183, 158, 137, 0.874)","--brown--glass":"rgba(121, 94, 75, 0.708)","--light--brown":"#967c64","--off--light--brown":"#8b6f55","--dark--light--brown":"#806548","--brown":"#654d35","--beige--shadow":"rgb(154, 127, 96)","--off--brown":"#573d2a","--dull--dark--brown":"#4a3424","--dark--brown":"#3b2318","--dark--brown--glass":"#3b2318cf","--off--dark--brown":"#2d1a11"}`,
      },
      {
        name: "Clear Glass",
        cssVariables: `{"--white":"#ffffff","--light--beige":"#b2d3e6","--dull--beige":"#c5e0ed","--beige":"#a3cce3","--off--beige":"#8fc2de","--dark--beige":"#75b3d4","--off--dark--beige":"#5da4cb","--light--beige--glass":"rgba(178, 211, 230, 0.353)","--beige--glass":"rgba(147, 193, 219, 0.874)","--brown--glass":"rgba(89, 156, 196, 0.708)","--light--brown":"#4b9cc8","--off--light--brown":"#3890c1","--dark--light--brown":"#2584ba","--brown":"#1a6b9e","--beige--shadow":"rgb(106, 169, 207)","--off--brown":"#155c8a","--dull--dark--brown":"#114e76","--dark--brown":"#0c3d5e","--dark--brown--glass":"#0c3d5ecf","--off--dark--brown":"#0a324d"}`,
      },
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
