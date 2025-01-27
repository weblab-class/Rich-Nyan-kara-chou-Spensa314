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
const llmManager = require("./llm");
const router = express.Router();

const User = require("./models/user");
const Leaderboard = require("./models/leaderboard");
const mongoose = require("mongoose");
// Load environment variables
const apiKey = process.env.GOOGLE_API_KEY;
const cx = process.env.GOOGLE_CX;

const games = {}; // In-memory store for game states

router.post("/login", auth.login);
router.post("/logout", auth.logout);

router.post("/guestlogin", async (req, res) => {
  try {
    let isUnique = false;

    // Ensure the generated guest ID is unique
    while (!isUnique) {
      // Generate a unique guest ID
      const randomNumber = Math.floor(Math.random() * 1000000);
      guestId = `Guest${randomNumber}`;
      guestName = `Guest ${randomNumber}`;

      // Check if a guest user with the same ID already exists
      const existingGuest = await User.findOne({ googleid: guestId });
      if (!existingGuest) {
        isUnique = true;
      }
    }
    // Create a new guest user in MongoDB
    const guestUser = new User({
      googleid: guestId,
      name: guestName,
      profilePicture: "/images/default.png",
      isGuest: true, // Add a flag to differentiate guest users
    });

    // Save the guest user to the database
    await guestUser.save();

    // Store the guest user in the session
    req.session.user = {
      _id: guestUser._id,
      name: guestUser.name,
      profilePicture: guestUser.profilePicture,
      isGuest: true,
    };

    // Send the guest user data back to the client
    res.send({
      _id: guestUser._id,
      name: guestUser.name,
      profilePicture: guestUser.profilePicture,
      isGuest: true,
    });
  } catch (err) {
    console.error("Error handling guest login:", err);
    res.status(500).send({ msg: "Error handling guest login." });
  }
});

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

    res.status(200).send({ success: true, username: user.name });
  } catch (err) {
    console.error("Error updating username:", err);
    res.status(500).send({ msg: "Internal server error" });
  }
});

router.get("/getSavedThemes/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user.savedThemes || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to handle profile picture upload
router.post("/add-theme", auth.ensureLoggedIn, async (req, res) => {
  const { userId, themeName, themeCode } = req.body;

  if (!userId || !themeName || !themeCode) {
    return res
      .status(400)
      .send({ msg: "Missing required fields: userId, themeName, or themeCode" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ msg: "User not found" });
    }
    if (user.savedThemes.some(theme => theme.name === themeName)) {
      return res.status(404).send({ msg: "Theme present already" });
    }
    user.savedThemes.push({
      name: themeName,
      cssVariables: themeCode, // Save the stringified theme code
    });
    await user.save();

    res.status(200).send({ success: true, savedThemes: user.savedThemes });
  } catch (err) {
    console.error("Error saving theme:", err);
    res.status(500).send({ msg: "Internal server error" });
  }
});

router.post("/delete-theme", auth.ensureLoggedIn, async (req, res) => {
  const { userId, themeName, themeCode } = req.body;
  if (!userId || !themeName || !themeCode) {
    return res
      .status(400)
      .send({ msg: "Missing required fields: userId, themeName, or themeCode" });
  }

  try {
    console.log(userId, themeName, themeCode);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ msg: "User not found" });
    }
    if (!user.savedThemes.some(theme => theme.name === themeName)) {
      return res.status(404).send({ msg: "Theme not found" });
    }
    user.savedThemes = user.savedThemes.filter(theme => theme.name !== themeName);
    await user.save();

    res.status(200).send(user.savedThemes);
  } catch (err) {
    console.error("Error saving theme:", err);
    res.status(500).send({ msg: "Internal server error" });
  }
});

// Update single-player scores
router.post("/updateSinglePlayerScore", auth.ensureLoggedIn, async (req, res) => {
  const { userId, score, settings, guest } = req.body;
  console.log("Request Body:", req.body);
  if (!userId || !settings || score === undefined) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const user = await User.findById(userId);
    console.log("This is my user: ", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const settingsString = settings; // Use settings directly as a string

    // const settingsString = JSON.stringify(JSON.parse(settings)); //lifesaver tbh
    console.log("settingsString working okay", settingsString);
    // checking if these settings have been played before
    // should probably check .find() complexity
    // but there's no workaround afaik and it shouldn't be too harsh
    let scoreEntry = user.singlePlayerScores.find((entry) => entry.settings === settingsString);
    console.log("got until here", scoreEntry);

    if (!scoreEntry) {
      // Add a new entry for these settings
      console.log("Adding a new entry for these settings");
      scoreEntry = {
        settings: settingsString,
        highScore: score,
        totalScore: score,
        gamesPlayed: 1,
      };

      user.singlePlayerScores.push(scoreEntry); //like a vector almost
    } else {
      // Update the existing entry
      scoreEntry.highScore = Math.max(scoreEntry.highScore, score);
      scoreEntry.totalScore += score;
      scoreEntry.gamesPlayed += 1;
    }

    await user.save(); //honestly the most important part

    // Leaderboard ugh
    if (!guest) {
      const existingLeaderboardEntry = await Leaderboard.findOne({
        playerId: userId,
        settings: settingsString,
      });

      if (!existingLeaderboardEntry) {
        // New entry
        console.log("New leaderboard entry");
        const leaderboardEntry = new Leaderboard({
          playerId: userId,
          name: user.name,
          profilePicture: user.profilePicture,
          highScore: scoreEntry.highScore,
          settings: settingsString,
          rank: 0, // rank will be calculated later
        });
        await leaderboardEntry.save();
      } else {
        // Update their score if it's higher
        existingLeaderboardEntry.highScore = Math.max(
          existingLeaderboardEntry.highScore,
          scoreEntry.highScore
        );
        await existingLeaderboardEntry.save();
      }

      res.status(200).send({ success: true, msg: "Score updated succsessfully!" });
    }
  } catch (err) {
    console.error("Error updating score:", err);
    res.status(500).send({ msg: "Internal server error" });
  }
});

// GET leaderboard
router.get("/leaderboard", async (req, res) => {
  const { userId, settings } = req.query;

  if (!userId || !settings) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const settingsFilter = JSON.stringify(JSON.parse(settings)); // Normalize the settings

    // Query: Top 10 players
    const topPlayers = await Leaderboard.find({ settings: settingsFilter })
      .sort({ highScore: -1 }) //because ranks haven't been calculated yet
      .limit(10); // Get top 10 players

    // Calculate ranks for each player. Sorry guys we can;t get around the nlogn
    // we might just have to sticj with it
    topPlayers.forEach((player, index) => {
      player.rank = index + 1; // Rank is position in sorted list (1-based index)
    });

    // Get the user's rank
    const userRankResult = await Leaderboard.aggregate([
      { $match: { settings: settingsFilter, playerId: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "leaderboards",
          let: { userScore: "$highScore" },
          pipeline: [
            { $match: { settings: settingsFilter } },
            { $match: { $expr: { $gt: ["$highScore", "$$userScore"] } } },
            { $count: "higherScores" },
          ],
          as: "rankInfo",
        },
      },
      {
        $project: {
          playerId: 1,
          name: 1,
          profilePicture: 1,
          highScore: 1,
          rank: { $add: [{ $arrayElemAt: ["$rankInfo.higherScores", 0] }, 1] },
        },
      },
    ]);

    const userRank = userRankResult.length ? userRankResult[0].rank : null;
    const userScore = userRankResult.length ? userRankResult[0].highScore : null;

    // If user is not in top 10, add them as 11th entry
    if (userRank > 10) {
      topPlayers.push({
        playerId: userId,
        name: "You", // Display "You" for the user
        profilePicture: "", // Optional: Provide the user's profile picture if available
        highScore: userScore,
        rank: userRank,
      });
    }

    // Return the leaderboard and user's rank
    res.json({
      topPlayers,
      userRank,
      userScore,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching leaderboard" });
  }
});

router.get("/getScores", async (req, res) => {
  const { userId, settings } = req.query;

  console.log("Request Query:", req.query);
  if (!userId || !settings) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Parse settings to ensure comparison works
    const parsedSettings = JSON.stringify(JSON.parse(settings)); // Normalize JSON string format
    console.log("parsedSettings:", parsedSettings);

    const scoreSinglePlayerEntry = user.singlePlayerScores.find(
      (score) => score.settings === parsedSettings
    );
    console.log("scoreSinglePlayerEntry: ", scoreSinglePlayerEntry);
    // Default values if score entry does not exist
    const highScore = scoreSinglePlayerEntry?.highScore || 0;
    const totalScore = scoreSinglePlayerEntry?.totalScore || 0;
    const gamesPlayed = scoreSinglePlayerEntry?.gamesPlayed || 0;
    const averageScore = gamesPlayed > 0 ? totalScore / gamesPlayed : 0;

    const scoreMultiPlayerEntry = user.multiPlayerScores.find(
      (score) => score.settings === parsedSettings
    );
    console.log("scoreMultiPlayerEntry: ", scoreMultiPlayerEntry);

    // default values again ;-;
    const wins = scoreMultiPlayerEntry?.wins || 0;
    const losses = scoreMultiPlayerEntry?.losses || 0;

    return res.json({ highScore, averageScore, wins, losses });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

let scoreUpdated = false; // Flag to track if the score has been updated

// Endpoint to check if the score has been updated
router.get("/check-score-update", (req, res) => {
  res.json({ scoreUpdated });
});

router.post("/reset-score-update", (req, res) => {
  scoreUpdated = false;
  res.status(200).send({ message: "Score update flag reset successfully." });
});

router.post("/updateMultiPlayerScore", auth.ensureLoggedIn, async (req, res) => {
  const { userId, isWinner, settings } = req.body;
  console.log("Req body:", req.body);

  if (!userId || isWinner === undefined || !settings) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    if (scoreUpdated) {
      return res.status(400).json({ message: "Score has already been updated." });
    }
    const user = await User.findById(userId);
    console.log("This is my user: ", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const settingsString = settings;
    console.log("settingsString working okay", settingsString);

    // do the settings already exist for this user?
    let scoreEntry = user.multiPlayerScores.find((entry) => entry.settings === settingsString);
    console.log("scoreEntry: ", scoreEntry);

    if (!scoreEntry) {
      // Add a new entry for these settings
      console.log("Adding a new multiplayer entry");
      scoreEntry = {
        settings: settingsString,
        wins: isWinner ? 1 : 0,
        losses: isWinner ? 0 : 1,
      };

      user.multiPlayerScores.push(scoreEntry); // array
    } else {
      // Update the existing entry
      console.log("Updating an existing entry");
      if (isWinner) {
        scoreEntry.wins += 1;
      } else {
        scoreEntry.losses += 1;
      }
    }

    // Set the scoreUpdated flag to true after updating
    scoreUpdated = true;

    await user.save();

    res.status(200).json({ message: "Score updated successfully" });
  } catch (err) {
    console.error("Error updating multiplayer score:", err);
    res.status(500).json({ message: "Internal server error" });
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

router.get("/roomer/:roomCode/:id", (req, res) => {
  const roomCode = req.params.roomCode;
  const id = req.params.id;
  socketManager.addInRoom(roomCode, id);
  console.log("this is the id", id);
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
router.post("/startGame/:roomCode/:id", (req, res) => {
  try {
    // Extract gameDetails directly from req.body
    const gameDetails = req.body;
    const roomCode = req.params.roomCode;
    const id = req.params.id;
    socketManager.addInRoom(roomCode, id);
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

router.get("/getRoom/:roomCode", async (req, res) => {
  const roomCode = req.params.roomCode;
  res.send(socketManager.gameStarted(roomCode));
});

router.get("/inRoom/:roomCode/:id", (req, res) => {
  const roomCode = req.params.roomCode;
  const id = req.params.id;
  res.send(socketManager.inTheRoom(roomCode, id));
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

router.get("/activeRooms/:roomId", (req, res) => {
  const roomId = req.params.roomId;
  const response = socketManager.getActiveRooms(roomId);
  res.send(response);
});

router.get("/getTheme", async (req, res) => {
  const theme = req.query.theme; // Use req.query to access query parameters
  if (!theme) {
    return res.status(400).send({ error: "Theme query parameter is required." });
  }

  try {
    const response = await llmManager.sendPromptToClaude(theme); // Wait for the response
    res.send(response);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send({ error: "Failed to process theme." });
  }
});

// Catch-all for undefined routes
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
