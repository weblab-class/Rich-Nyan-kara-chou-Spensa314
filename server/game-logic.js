require("dotenv").config();

const axios = require("axios");
const seedrandom = require("seedrandom"); // For seed-based random generation

// Constants
const DEFAULT_SEQUENCE_LENGTH = 200;
const DEFAULT_TIMER_VALUE = 60;
const DEFAULT_MIN_WORD_LENGTH = 3;
const ROOM_EXPIRATION_TIME = 900000; // 15 minutes in milliseconds

const letters = {
  false: "aaaaaaaabbccccddddeeeeeeeeeeeffggghhhiiiiiiiiijkllllllmmmnnnnnnnnooooooopppqrrrrrrrrssssssssstttttttuuuuvwxyyz",
  true: "abcdefghijklmnopqrstuvwxyz",
};

// State Maps
const roomStates = {};
const playerStates = {};
let startedRooms = [];
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
      host: "",
    };
    if (!roomToPlayers[roomId]) {
        return;
    }
    for (const playerId of roomToPlayers[roomId]) {
        resetPlayerState(playerId, roomId);
    }
    startTimer(roomId);
}
startTimer = (roomId) => {
    const roomState = roomStates[roomId];
    if (!roomState) return;
    
    let val = roomState.time + 5; // Add 5 seconds to the initial time.
    const barrier = val - 5;
    roomState.loading = true; // Set loading state to true initially.
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
    if (!roomStates[roomId]) {
        state.score = 0;
        state.index = 0;
        state.prevWord = "";
        state.curScore = 0;
        state.curLetter = "";
        state.nextLetter = "";
        state.timerValue = DEFAULT_TIMER_VALUE;
        state.initiated = false;
        state.curQuery = "";
        state.queries = [];
        state.words = [];
    }
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
  console.log(state);
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
    setHost(roomId);
}

function setHost(roomId) {
    if (!roomToPlayers[roomId]) {
        return;
    }
    if (!roomStates[roomId]){
        return;
    }
    while (roomToPlayers[roomId].length > 0 && !roomToPlayers[roomId][0]){
        roomToPlayers[roomId].shift();
    }
    if (!roomToPlayers[roomId]){
        return;
    }
    roomStates[roomId].host = roomToPlayers[roomId][0];
}
  
function getHost(roomId) {
    if (!roomToPlayers[roomId]) {
        return;
    }
    if (!roomStates[roomId]){
        return;
    }
    return roomStates[roomId].host;
}

function leaveRoom(roomId, playerId) {
    if (!roomToPlayers[roomId]) {
        return;
    }
    if (!roomStates[roomId]){
        return;
    }
    roomToPlayers[roomId] = roomToPlayers[roomId].filter((id) => id !== playerId);
    if (roomToPlayers[roomId].length === 0) {
        delete roomToPlayers[roomId];
        delete roomStates[roomId];
    }
}

function endGame(roomId) {
    if (!roomStates[roomId]) {
        return;
    }
    if (!roomToPlayers[roomId]) {
        return;
    }
    for (const playerId in roomToPlayers[roomId]) {
        resetPlayerState(playerId, roomId);
    }
    roomStates[roomId].gameStarted = false;
    roomToPlayers[roomId] = [];
    startedRooms = startedRooms.filter((id) => id !== parseInt(roomId, 10));
}

// Handle Player Search
async function handlePlayerSearch(playerId, roomId, query) {
  const state = getPlayerState(playerId);
  const roomState = roomStates[roomId];
  const currentWord = `${state.curLetter}${query}`;
  const queryText = `${state.prevWord} ${currentWord}`;
  const quotedQuery = `"${queryText}"`;

  const currentHour = new Date().getHours();
  let apiKey, cx;

  if (currentHour >= 0 && currentHour < 12) {
    // 12 AM - 12 PM
    apiKey = "AIzaSyBZpVCZKwRmfBNuZJjRQuBhEc2h68DYrso";
    cx = "450f8832fcce44a27";
  } else {
    // 12 PM - 12 AM
    apiKey = "AIzaSyAjqHL2eqHdkj0ROMlZCAtLc7pgNNx87NE";
    cx = "624cb6fad01334dfa";
  }

  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${quotedQuery}`;
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
    //throw new Error("Failed to fetch search results.");
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
}

function getInitiated(playerId, roomId) {
  const state = getPlayerState(playerId);
  return state.initiated;
}

function getSortedScores(roomId) {
    const playersInRoom = roomToPlayers[roomId];
  if (!playersInRoom || playersInRoom.length === 0) {
    return;
  }
  return playersInRoom
    .map((playerId) => {
      const state = playerStates[playerId];
      if (!state) return;
      return { playerName: playerId, score: state.score, playerState: playerStates[playerId] };
    })
    .sort((a, b) => b.score - a.score); // Sort in descending order of scores
}

function getRoomInfo(roomId, userId) {
    if (roomStates[roomId] === undefined) {
        return;
    }
    playerStates[userId].curLetter = roomStates[roomId].randomLetters[playerStates[userId].index];
    playerStates[userId].nextLetter = roomStates[roomId].randomLetters[playerStates[userId].index + 1];
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
  getRoomInfo,
  setHost,
  getHost,
  leaveRoom,
  endGame
};

