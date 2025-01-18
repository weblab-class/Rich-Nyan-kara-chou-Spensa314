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

// Load environment variables
const apiKey = process.env.GOOGLE_API_KEY;
const cx = process.env.GOOGLE_CX;

const games = {}; // In-memory store for game states
router.post("/login", auth.login);
router.post("/logout", auth.logout);
router.get("/whoami", (req, res) => {
  if (!req.user) {
    return res.send({});
  }
  res.send(req.user);
});

router.post("/initsocket", (req, res) => {
  // do nothing if user not logged in
  if (req.user)
    socketManager.addUser(req.user, socketManager.getSocketFromSocketID(req.body.socketid));
  res.send({});
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
      started: game.state === "started" 
    });
  } catch (err) {
    console.error(`Error in /game/status/${roomCode}:`, err.message);
    res.status(500).send({ error: "Internal server error" });
  }
});

// Route: Start game 
// TODO: auth.ensureLoggedIn
router.post("/startGame", (req, res) => {
  try {
    // Extract gameDetails directly from req.body
    const gameDetails = req.body;
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
      error: err.message 
    });
  }
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

// Catch-all for undefined routes
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
