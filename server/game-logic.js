require("dotenv").config();

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
const roomStates = {};
const playerStates = {};

// Helper: Generate Seeded Random Sequence
function generateSeededSequence(seed, length = DEFAULT_SEQUENCE_LENGTH, type = "regular") {
  const charSet = letters[type] || letters.regular;
  const rng = seedrandom(seed);
  return Array.from({ length }, () => charSet[Math.floor(rng() * charSet.length)]);
}

function firstWord(){
    const lister = [
        "apple", "the", "over", "user", "under",
        "banana", "cherry", "grape", "orange", "lemon",
        "pineapple", "pear", "mango", "peach", "plum",
        "table", "chair", "desk", "lamp", "window",
        "happy", "sad", "excited", "calm", "angry",
        "ocean", "mountain", "valley", "river", "forest",
        "house", "building", "apartment", "cabin", "castle"
      ];
    const index = Math.floor(Math.random() * lister.length);
      return lister[index];
}

// Initialize a Room
function initializeRoom(roomId, settings = {minLength: 3, hideLetter: false, type: "regular"}) {
    const rando = Math.floor(Math.random() * 10000); // Random number between 0 and 999999
    const seed = parseInt(roomId, 10) || roomId.length || 0; // Fallback to roomId length if not numeric
    const roomSeed = seed - rando || `${roomId}-${rando}`;

    roomStates[roomId] = {
      randomLetters: generateSeededSequence(roomSeed, DEFAULT_SEQUENCE_LENGTH, settings.type),
      currentIndex: 0,
      createdAt: Date.now(),
      seed: roomSeed,
      settings: { ...settings },
      firstWord: firstWord(),
    };
}

// Get the Next Letter for a Room
function getNextLetter(roomId) {
  const roomState = roomStates[roomId];
  if (!roomState) throw new Error(`Room ${roomId} not found.`);
  
  const letter = roomState.randomLetters[roomState.currentIndex];
  roomState.currentIndex = (roomState.currentIndex + 1) % roomState.randomLetters.length;
  return letter;
}

// Get or Initialize Player State
function getPlayerState(playerId) {
  if (!playerStates[playerId]) {
    playerStates[playerId] = {
      score: 0,
      highScore: 0,
      prevWord: "apple",
      curLetter: "",
      nextLetter: "",
      timerValue: DEFAULT_TIMER_VALUE,
      minWordLength: DEFAULT_MIN_WORD_LENGTH,
    };
  }
  return playerStates[playerId];
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
  const roomState = roomStates[roomId];
  if (!roomState) throw new Error(`Room ${roomId} not initialized.`);

  if (!query || query.length < state.minWordLength) {
    throw new Error(`Word must be at least ${state.minWordLength} letters long.`);
  }

  const quotedQuery = `"${query}"`;
  // const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${quotedQuery}`; FIX ME
  const url = `https://www.googleapis.com/customsearch/v1?key=AIzaSyBZpVCZKwRmfBNuZJjRQuBhEc2h68DYrso&cx=450f8832fcce44a27&q=${quotedQuery}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const totalResults = data.searchInformation.totalResults || 0;
    state.score += parseInt(totalResults);
    state.prevWord = query;
    state.curLetter = state.nextLetter;
    state.nextLetter = getNextLetter(roomId);

    return {
      phrase: query,
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
  for (const [roomId, roomState] of Object.entries(roomStates)) {
    if (!roomState) continue;

    if (now - roomState.createdAt > expirationTime) {
      delete roomStates[roomId];
      console.log(`Room ${roomId} expired and removed.`);
    }
  }
}

function getRoom(roomId) {
  return roomStates[roomId];
}

function getSortedScores() {
    return Object.entries(playerStates)
      .map(([playerName, state]) => ({ playerName, score: state.score }))
      .sort((a, b) => b.score - a.score); // Sort in descending order of scores
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
  getRoom,
  getSortedScores,
};

