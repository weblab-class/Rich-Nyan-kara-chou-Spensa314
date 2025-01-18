// Server-Side Game Logic for Node.js
const axios = require("axios");

// Constants and Utilities
const letters = {
  regular: "aaaaaaaabbccccddddeeeeeeeeeeeffggghhhiiiiiiiiijkllllllmmmnnnnnnnnooooooopppqrrrrrrrrssssssssstttttttuuuuvwxyyz",
  hard: "abcdefghijklmnopqrstuvwxyz",
};

function generateRandom(type = "regular") {
  const charSet = letters[type] || letters.regular;
  return charSet[Math.floor(Math.random() * charSet.length)];
}

// Room-Based Random Letters Management
const roomStates = new Map(); // Map to hold state for each room

function initializeRoom(roomId, type = "regular") {
  if (!roomStates.has(roomId)) {
    roomStates.set(roomId, {
      randomLetters: Array.from({ length: 100 }, () => generateRandom(type)), // Pre-generate letters
      currentIndex: 0,
    });
  }
}

function getNextLetter(roomId) {
  const roomState = roomStates.get(roomId);
  if (!roomState) {
    throw new Error(`Room ${roomId} not initialized.`);
  }

  const letter = roomState.randomLetters[roomState.currentIndex];
  roomState.currentIndex = (roomState.currentIndex + 1) % roomState.randomLetters.length;
  return letter;
}

// Game State Management
const playerStates = new Map();

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

async function handlePlayerSearch(playerId, roomId, query) {
  const state = getPlayerState(playerId);

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

module.exports = {
  initializeRoom,
  getNextLetter,
  getPlayerState,
  resetPlayerState,
  handlePlayerSearch,
};
