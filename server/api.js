/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/
require("dotenv").config();
const express = require("express");
const auth = require("./auth");
const socketManager = require("./server-socket");

const router = express.Router();
const User = require("./models/user");
// Load environment variables
const apiKey = process.env.GOOGLE_API_KEY;
const cx = process.env.GOOGLE_CX;

const games = {}; // In-memory store for game states

router.post("/login", auth.login);
router.post("/logout", auth.logout);

//making them async so we get the right info first
router.get("/whoami", async (req, res) => {
  if (!req.user) {
    return res.send({});
  }
  // trying to have new session data
  try {
    const user = await User.findById(req.user._id); // Ensure latest DB fetch
    res.send(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).send({ msg: "Error fetching user data." });
  }
});

// Route to handle profile picture upload
router.post("/upload-profile-picture", auth.ensureLoggedIn, async (req, res) => {
  const { userId, profilePicture } = req.body;

  if (!userId || !profilePicture) {
    return res.status(400).send({ msg: "Missing required fields: userId or profilePicture" });
  }

  try {
    // Update the user's profile picture in the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ msg: "User not found" });
    }

    user.profilePicture = profilePicture;
    await user.save();

    res.status(200).send({ success: true, profilePicture: user.profilePicture });
  } catch (err) {
    console.error("Error uploading profile picture:", err);
    res.status(500).send({ msg: "Internal server error" });
  }
});

router.post("/update-username", auth.ensureLoggedIn, async (req, res) => {
  const { userId, newUsername } = req.body;

  if (!userId || !newUsername || !newUsername.trim()) {
    return res.status(400).send({ msg: "Invalid input. UserId and newUsername are required." });
  }

  try {
    // Find the user in the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ msg: "User not found" });
    }

    console.log("updating user.name with ", newUsername);
    // Update user's username
    user.name = newUsername.trim();
    await user.save();

    console.log("newUsername saved successfully");

    // refresh session so we get the new name
    // req.login(user, (err) => {
    //   if (err) {
    //     return res.status(500).send({ msg: "Session refresh error" });
    //   }
    //   res.status(200).send({ success: true, username: user.name });
    // });
    res.status(200).send({ success: true, username: user.name });
  } catch (err) {
    console.error("Error updating username:", err);
    res.status(500).send({ msg: "Internal server error" });
  }
});

router.post("/initsocket", (req, res) => {
  // do nothing if user not logged in
  if (req.user)
    socketManager.addUser(req.user, socketManager.getSocketFromSocketID(req.body.socketid));
  res.send({});
});

router.get("/room/:roomCode", (req, res) => {
  const roomCode = req.params.roomCode;
  console.log(roomCode);
  // Check if the roomCode exists in the rooms object
  if (socketManager.gR(roomCode)) {
    // Room exists
    res.send({ exists: true, room: socketManager.gR(roomCode) });
  } else {
    // Room does not exist
    res.send({ exists: false, message: "Room not found" });
  }
});

// Route: Check game status
router.get("/game/status/:roomCode", (req, res) => {
  const roomCode = req.params.roomCode;
  const username = req.query.username.slice(0, -1);
  console.log(`Received request for roomCode: ${roomCode} and username: ${username}`);

  const game = games[roomCode];
  if (!game) {
    return res.status(404).send({ error: "Room not found" });
  }

  try {
    if (!game.state) {
      if (!game.players.includes(username)) {
        return res.status(403).send({ error: "User not in the game" });
      }
      game.state = "waiting";
      console.log(`Game ${roomCode} is in waiting state.`);

      // Start a timer to transition to "started"
      setTimeout(() => {
        game.state = "started";
        console.log(`Game ${roomCode} has transitioned to the started state.`);
      }, 3000);
    }

    // If the game has started, check if the user is in the players list
    if (game.state === "started") {
      if (!game.players.includes(username)) {
        return res.status(403).send({ error: "User not in the game" });
      }
    }

    res.status(200).send({
      roomCode,
      state: game.state,
      started: game.state === "started",
    });
  } catch (err) {
    console.error(`Error in /game/status/${roomCode}:`, err.message);
    res.status(500).send({ error: "Internal server error" });
  }
});

// Route: Start game
// TODO: auth.ensureLoggedIn
router.post("/startGame/:roomCode", (req, res) => {
  try {
    // Extract gameDetails directly from req.body
    const gameDetails = req.body;
    socketManager.startGame(gameDetails.roomCode, gameDetails);
    // Validate that gameDetails is provided
    if (!gameDetails) {
      throw new Error("Missing gameDetails in request body");
    }

    console.log("Received game details:", gameDetails);
    games[parseInt(gameDetails.roomCode)] = gameDetails;
    // Respond with a success message
    res.status(200).send({ msg: "Game started successfully" });
  } catch (err) {
    console.error("Error in /startGame route:", err.message);

    // Send a clear error response to the client
    res.status(500).send({
      msg: "Internal Server Error",
      error: err.message,
    });
  }
});

router.post("/endGame/:roomCode", (req, res) => {
  const roomCode = req.params.roomCode;
  socketManager.endGame(roomCode);
  res.status(200).send({ msg: "Game ended successfully" });
});

router.get("/getRoom/:roomCode", async (req, res) => {
  const roomCode = req.params.roomCode;
  res.send(socketManager.gameStarted(roomCode));
});
// Route: Search
router.get("/search", async (req, res) => {
  const query = req.query["query"];
  if (!query) {
    return res.status(400).send({ msg: "Enter something to search." });
  }

  const quotedQuery = `"${query}"`;

  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${quotedQuery}`;
  console.log(url);
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);
    const totalResults = data.searchInformation.totalResults || 0;
    console.log(totalResults);
    res.send({
      phrase: query,
      totalResults,
    });
  } catch (error) {
    console.error("Error fetching search results:", error);
    res.status(500).send({ msg: "Error fetching search results." });
  }
});

router.post("/initializeRoom", (req, res) => {
  const { roomId, type, seed, settings } = req.body;
  try {
    game.initializeRoom(roomId, { type, seed, ...settings });
    res.status(200).json({ message: "Room initialized." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/getNextLetter/:roomId", (req, res) => {
  const { roomId } = req.params.roomId;
  try {
    const letter = game.getNextLetter(roomId);
    res.status(200).json({ letter });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.get("/getInitiated/:roomId", (req, res) => {
  const roomId = req.params.roomId;
  const userId = req.query.userId.slice(0, -1);
  console.timeLog(roomId, userId);
  const initiated = socketManager.initiated(userId, roomId);
  console.log(initiated);
  res.send(initiated);
});

router.post("/setInitiated/:roomId", (req, res) => {
  const roomId = req.params.roomId;
  const userId = req.query.userId;
  socketManager.setInitiated(userId, roomId);
  res.status(200).send({ msg: "Initiated set successfully" });
});

router.post("/startGameLoop/:roomId", (req, res) => {
  const roomId = req.params.roomId;
  const userId = req.query.userId;
  socketManager.startGameLoop(roomId, userId);
  res.status(200).send({ msg: "Game started successfully" });
});

// Catch-all for undefined routes
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
