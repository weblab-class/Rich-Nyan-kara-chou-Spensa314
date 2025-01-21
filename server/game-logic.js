require("dotenv").config();

const axios = require("axios");
const seedrandom = require("seedrandom"); // For seed-based random generation

// Constants
const DEFAULT_SEQUENCE_LENGTH = 200;
const DEFAULT_TIMER_VALUE = 60;
const DEFAULT_MIN_WORD_LENGTH = 3;
const ROOM_EXPIRATION_TIME = 300000; // 5 minutes in milliseconds

const letters = {
  false: "aaaaaaaabbccccddddeeeeeeeeeeeffggghhhiiiiiiiiijkllllllmmmnnnnnnnnooooooopppqrrrrrrrrssssssssstttttttuuuuvwxyyz",
  true: "abcdefghijklmnopqrstuvwxyz",
};

// State Maps
const roomStates = {};
const playerStates = {};
const startedRooms = [];
const roomToPlayers = {};
// Helper: Generate Seeded Random Sequence
function generateSeededSequence(seed, length = DEFAULT_SEQUENCE_LENGTH, type = false) {
    let charSet;
    if (type) {
        charSet = letters.true;
    }else{
        charSet = letters.false;
    }
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
function initializeRoom(roomId, settings = {minLength: 3, hideLetter: false, type: false, time: 30}) {
    const rando = Math.floor(Math.random() * 10000); // Random number between 0 and 999999
    const seed = parseInt(roomId, 10) || roomId.length || 0; // Fallback to roomId length if not numeric
    const roomSeed = seed - rando || `${roomId}-${rando}`;
    roomStates[roomId] = {
      randomLetters: generateSeededSequence(roomSeed, DEFAULT_SEQUENCE_LENGTH, settings.type),
      createdAt: Date.now(),
      seed: roomSeed,
      settings: { ...settings },
      firstWord: firstWord(),
      gameStarted: false, 
      loading: true,
      gameEnded: false,
      type: settings.type,
      time: settings.time,
    };
    for (const playerId in roomToPlayers[roomId]) {
        resetPlayerState(playerId, roomId);
    }
    startTimer(roomId);
}
startTimer = (roomId) => {
    const roomState = roomStates[roomId];
    if (!roomState) throw new Error(`Room ${roomId} not found.`);
    
    let val = roomState.time + 5; // Add 5 seconds to the initial time.
    const barrier = val - 5;
    roomState.loading = true; // Set loading state to true initially.
    console.log(val, roomState.time);
    const timerInterval = setInterval(() => { 
      val-=0.1;
      roomState.time = val;
      if (val <= barrier) { // When the timer has run for 5 seconds.
        roomState.loading = false;
      }
  
      if (val <= 0) {
        clearInterval(timerInterval);
        roomState.gameEnded = true; // Mark the game as ended.
      }
    }, 100);
  };
// Get or Initialize Player State
function getPlayerState(playerId) {
  if (!playerStates[playerId]) {
    playerStates[playerId] = {
      score: 0,
      curScore: 0,
      highScore: 0,
      index: 0,
      prevWord: "apple",
      curLetter: "",
      nextLetter: "",
      timerValue: DEFAULT_TIMER_VALUE,
      minWordLength: DEFAULT_MIN_WORD_LENGTH,
      initiated: false,
      queries: [],
      words: [],
    };
  }
  return playerStates[playerId];
}

// Reset Player State
function resetPlayerState(playerId, roomId) {
  const state = getPlayerState(playerId);
  if (state.score > state.highScore) state.highScore = state.score;

  state.score = 0;
  state.index = 0;
  state.prevWord = roomStates[roomId].firstWord;
  state.curScore = 0;
  state.curLetter = roomStates[roomId].randomLetters[state.index];
  state.nextLetter = roomStates[roomId].randomLetters[state.index + 1];
  state.timerValue = DEFAULT_TIMER_VALUE;
  state.initiated = false;
  state.curQuery = "";
  state.queries = [];
  state.words = [roomStates[roomId].firstWord];
}

function setRoomId(roomId, players) {
    if (!roomToPlayers[roomId]) {
      roomToPlayers[roomId] = []; // Initialize the list for the room if it doesn't exist
    }
  
    const playerIds = players.map((player) => player.userId); // Extract user IDs from the players
    for (let i = 0; i < playerIds.length; i++) {
        if (!roomToPlayers[roomId].includes(playerIds[i])) {
            roomToPlayers[roomId] = roomToPlayers[roomId].concat(playerIds[i]);
        }
    }
}
  
// Handle Player Search
async function handlePlayerSearch(playerId, roomId, query) {
  const state = getPlayerState(playerId);
  const roomState = roomStates[roomId];
  const currentWord = `${state.curLetter}${query}`;
  const queryText = `${state.prevWord} ${currentWord}`;
  const quotedQuery = `"${queryText}"`;
  // const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${quotedQuery}`; FIX ME
  const url = `https://www.googleapis.com/customsearch/v1?key=AIzaSyBZpVCZKwRmfBNuZJjRQuBhEc2h68DYrso&cx=450f8832fcce44a27&q=${quotedQuery}`;
console.log(roomStates[roomId].randomLetters);
  try {
    const response = await fetch(url);
    const data = await response.json();
    const totalResults = data.searchInformation.totalResults || 0;
    
    state.score += parseInt(totalResults);
    state.curScore = parseInt(totalResults);
    state.prevWord = currentWord;
    state.index += 1;
    state.curLetter = roomState.randomLetters[state.index];
    state.nextLetter = roomState.randomLetters[state.index + 1];
    state.curQuery = queryText;
    state.queries.push([queryText, totalResults]);
    state.words.push(currentWord);

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
      delete startedRooms[roomId];
      console.log(`Room ${roomId} expired and removed.`);
    }
  }
}

function getRoom(roomId) {
  return roomStates[roomId];
}

function setGameStarted(roomId) {
  startedRooms.push(parseInt(roomId));
  console.log("Started rooms:", startedRooms);
}
function getGameStarted(roomId) {
    for (let i = 0; i < startedRooms.length; i++) {
      if (startedRooms[i] === parseInt(roomId)) {
        return true;
      }
    }
    return false;
}

function setInitiated(playerId) {
  const state = getPlayerState(playerId);
  state.initiated = true;
  console.log("Initiated:", state.initiated);
}

function getInitiated(playerId, roomId) {
  const state = getPlayerState(playerId);
  return state.initiated;
}

function getSortedScores(roomId) {
    const playersInRoom = roomToPlayers[roomId];
  if (!playersInRoom || playersInRoom.length === 0) {
    throw new Error(`No players found for room ${roomId}.`);
  }
  return playersInRoom
    .map((playerId) => {
      const state = playerStates[playerId];
      if (!state) throw new Error(`Player state not found for playerId ${playerId}.`);
      return { playerName: playerId, score: state.score };
    })
    .sort((a, b) => b.score - a.score); // Sort in descending order of scores
}

function getRoomInfo(roomId, userId) {
    playerStates[userId].curLetter = roomStates[roomId].randomLetters[playerStates[userId].index];
    playerStates[userId].nextLetter = roomStates[roomId].randomLetters[playerStates[userId].index + 1];
    console.log(playerStates[userId].curLetter);
    console.log(playerStates[userId].nextLetter);
    const liveResults =  {
        roomState: roomStates[roomId],
        roomPlayers: roomToPlayers[roomId],
        playerStates: playerStates[userId],
        roomScores: getSortedScores(roomId)
    }
    return liveResults;
}

// Periodically Check for Expired Rooms
setInterval(expireOldRooms, 60000); // Check every minute

// Exported Methods
module.exports = {
  initializeRoom,
  getPlayerState,
  resetPlayerState,
  handlePlayerSearch,
  expireOldRooms,
  getRoom,
  getSortedScores,
  setGameStarted,
  getGameStarted,
  setInitiated,
  getInitiated,
  setRoomId,
  getRoomInfo
};

