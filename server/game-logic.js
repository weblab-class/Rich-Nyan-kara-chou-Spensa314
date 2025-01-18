const axios = require("axios");
const seedrandom = require("seedrandom"); // For seed-based random generation

// Constants and Utilities
const letters = {
  regular: "aaaaaaaabbccccddddeeeeeeeeeeeffggghhhiiiiiiiiijkllllllmmmnnnnnnnnooooooopppqrrrrrrrrssssssssstttttttuuuuvwxyyz",
  hard: "abcdefghijklmnopqrstuvwxyz",
};

const roomStates = new Map(); // Map to hold state for each room
const playerStates = new Map(); // Map to hold state for each player

// Helper: Generate Seeded Random Sequence
function generateSeededSequence(seed, length = 300, type = "regular") {
  const charSet = letters[type] || letters.regular;
  const rng = seedrandom(seed);
  const sequence = [];
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(rng() * charSet.length);
    sequence.push(charSet[randomIndex]);
  }
  return sequence;
}

// Initialize a Room with Seed-Based Letters
function initializeRoom(roomId, type = "regular", seed = null) {
  if (!roomStates.has(roomId)) {
    const roomSeed = seed || `${roomId}-${Date.now()}`; // Use provided seed or generate one
    roomStates.set(roomId, {
      randomLetters: generateSeededSequence(roomSeed, 100, type),
      currentIndex: 0,
      createdAt: Date.now(), // Track room creation for expiration
      type,
      seed: roomSeed,
    });
  }
}

// Get the Next Letter for a Room
function getNextLetter(roomId) {
  const roomState = roomStates.get(roomId);
  if (!roomState) {
    throw new Error(`Room ${roomId} not initialized.`);
  }

  const letter = roomState.randomLetters[roomState.currentIndex];
  roomState.currentIndex = (roomState.currentIndex + 1) % roomState.randomLetters.length;
  return letter;
}

// Get or Initialize Player State
function getPlayerState(playerId) {
  if (!playerStates.has(playerId)) {
    playerStates.set(playerId, {
      score: 0,
      highScore: 0,
      prevWord: "",
      curLetter: "",
      nextLetter: "",
      timerValue: 60,
      minWordLength: 3,
    });
  }
  return playerStates.get(playerId);
}

// Reset Player State
function resetPlayerState(playerId, roomId) {
  const state = getPlayerState(playerId);
  if (state.score > state.highScore) {
    state.highScore = state.score;
  }
  state.score = 0;
  state.prevWord = "";
  state.curLetter = getNextLetter(roomId);
  state.nextLetter = getNextLetter(roomId);
  state.timerValue = 60;
}

// Handle Player Search
async function handlePlayerSearch(playerId, roomId, query) {
  const state = getPlayerState(playerId);
  const roomState = roomStates.get(roomId);

  if (!roomState) {
    throw new Error(`Room ${roomId} not initialized.`);
  }

  if (!query || query.length < state.minWordLength) {
    throw new Error(`Word must be at least ${state.minWordLength} letters long.`);
  }

  const addQuery = `${state.curLetter}${query}`;
  const quotedQuery = `"${addQuery}"`;
  const url = `https://www.googleapis.com/customsearch/v1?key=${process.env.API_KEY}&cx=${process.env.CX}&q=${quotedQuery}`;

  const response = await axios.get(url);
  const totalResults = parseInt(response.data.searchInformation.totalResults, 10) || 0;

  state.score += totalResults;
  state.prevWord = addQuery;
  state.curLetter = state.nextLetter;
  state.nextLetter = getNextLetter(roomId);

  return {
    phrase: addQuery,
    totalResults,
    gameState: state,
  };
}

// Helper: Expire Old Rooms
function expireOldRooms(expirationTime = 3600000) {
  const now = Date.now();
  for (const [roomId, roomState] of roomStates.entries()) {
    if (now - roomState.createdAt > expirationTime) {
      roomStates.delete(roomId);
      console.log(`Room ${roomId} expired and removed.`);
    }
  }
}

// Periodically Check for Expired Rooms
setInterval(() => {
  expireOldRooms();
}, 60000); // Check every minute

// Exported Methods
module.exports = {
  initializeRoom,
  getNextLetter,
  getPlayerState,
  resetPlayerState,
  handlePlayerSearch,
  expireOldRooms,
};
