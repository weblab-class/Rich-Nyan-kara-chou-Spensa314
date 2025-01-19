const axios = require("axios");
const seedrandom = require("seedrandom"); // For seed-based random generation

// Constants
const DEFAULT_SEQUENCE_LENGTH = 200;
const DEFAULT_TIMER_VALUE = 60;
const DEFAULT_MIN_WORD_LENGTH = 3;
const ROOM_EXPIRATION_TIME = 300000; // 5 minutes in milliseconds

const letters = {
  regular: "aaaaaaaabbccccddddeeeeeeeeeeeffggghhhiiiiiiiiijkllllllmmmnnnnnnnnooooooopppqrrrrrrrrssssssssstttttttuuuuvwxyyz",
  hard: "abcdefghijklmnopqrstuvwxyz",
};

// State Maps
const roomStates = new Map(); // Map to hold room states
const playerStates = new Map(); // Map to hold player states

// Helper: Generate Seeded Random Sequence
function generateSeededSequence(seed, length = DEFAULT_SEQUENCE_LENGTH, type = "regular") {
  const charSet = letters[type] || letters.regular;
  const rng = seedrandom(seed);
  return Array.from({ length }, () => charSet[Math.floor(rng() * charSet.length)]);
}

// Initialize a Room
function initializeRoom(roomId, type = "regular", seed = null) {
  if (!roomStates.has(roomId)) {
    const roomSeed = seed || `${roomId}-${Date.now()}`;
    roomStates.set(roomId, {
      randomLetters: generateSeededSequence(roomSeed, DEFAULT_SEQUENCE_LENGTH, type),
      currentIndex: 0,
      createdAt: Date.now(),
      type,
      seed: roomSeed,
    });
  }
}

// Get the Next Letter for a Room
function getNextLetter(roomId) {
  const roomState = roomStates.get(roomId);
  if (!roomState) throw new Error(`Room ${roomId} not found.`);
  
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
      timerValue: DEFAULT_TIMER_VALUE,
      minWordLength: DEFAULT_MIN_WORD_LENGTH,
    });
  }
  return playerStates.get(playerId);
}

// Reset Player State
function resetPlayerState(playerId, roomId) {
  const state = getPlayerState(playerId);
  if (state.score > state.highScore) state.highScore = state.score;

  state.score = 0;
  state.prevWord = "";
  state.curLetter = getNextLetter(roomId);
  state.nextLetter = getNextLetter(roomId);
  state.timerValue = DEFAULT_TIMER_VALUE;
}

// Handle Player Search
async function handlePlayerSearch(playerId, roomId, query) {
  const state = getPlayerState(playerId);
  const roomState = roomStates.get(roomId);
  if (!roomState) throw new Error(`Room ${roomId} not initialized.`);

  if (!query || query.length < state.minWordLength) {
    throw new Error(`Word must be at least ${state.minWordLength} letters long.`);
  }

  const addQuery = `${state.curLetter}${query}`;
  const quotedQuery = `"${addQuery}"`;
  const url = `https://www.googleapis.com/customsearch/v1?key=${process.env.API_KEY}&cx=${process.env.CX}&q=${quotedQuery}`;

  try {
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
  } catch (error) {
    console.error("Error during Google API search:", error.message);
    throw new Error("Failed to fetch search results.");
  }
}

// Helper: Expire Old Rooms
function expireOldRooms(expirationTime = ROOM_EXPIRATION_TIME) {
  const now = Date.now();
  for (const [roomId, roomState] of roomStates.entries()) {
    if (now - roomState.createdAt > expirationTime) {
      roomStates.delete(roomId);
      console.log(`Room ${roomId} expired and removed.`);
    }
  }
}

// Periodically Check for Expired Rooms
setInterval(expireOldRooms, 60000); // Check every minute

// Exported Methods
module.exports = {
  initializeRoom,
  getNextLetter,
  getPlayerState,
  resetPlayerState,
  handlePlayerSearch,
  expireOldRooms,
};
