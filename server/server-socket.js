const gameLogic = require("./game-logic");

let io;

const userToSocketMap = {}; // maps user ID to socket object
const socketToUserMap = {}; // maps socket ID to user object
const rooms = {}; // stores room data
const socketToIDMap = {};
const userIDtoNameMap = {};
const userIDtoPhotoMap = {};
const inRoom = {};

const getAllConnectedUsers = () => Object.values(socketToUserMap);
const getSocketFromUserID = (userid) => userToSocketMap[userid];
const getUserFromSocketID = (socketid) => socketToUserMap[socketid];
const getSocketFromSocketID = (socketid) => io.sockets.sockets.get(socketid);
const getIDFromSocketID = (socket) => socketToIDMap[socket.id];
const getNameFromUserID = (userid) => userIDtoNameMap[userid];
const getPhotoFromUserID = (userid) => userIDtoPhotoMap[userid];

const addUser = (user, socket) => {
  if (!user || !user._id) {
    console.error("Invalid user object provided to addUser");
    return;
  }

  const oldSocket = userToSocketMap[user._id];
  if (oldSocket && oldSocket.id) {
    if (oldSocket.id !== socket.id) {
      console.warn(`Disconnecting old socket for user ID: ${user._id}`);
      oldSocket.disconnect(); // Disconnect previous connection
      delete socketToUserMap[oldSocket.id]; // Remove from map
      delete socketToIDMap[oldSocket.id];
    }
  }
  userToSocketMap[user._id] = socket;
  socketToUserMap[socket.id] = user;
  socketToIDMap[socket.id] = user._id;
  userIDtoNameMap[user._id] = user.name;
  userIDtoPhotoMap[user._id] = user.profilePicture;
};

const removeUser = (user, socket) => {
  if (user) {
    delete userToSocketMap[user._id];
    delete userIDtoNameMap[user._id];
    delete userIDtoPhotoMap[user._id];
  }
  delete socketToUserMap[socket.id];
  delete socketToIDMap[socket.id];
};

const joinRoom = (roomId, user, socket, settings) => {
  if (!roomId || !user) {
    console.error("Invalid roomId or user object in joinRoom");
    return;
  }
  // Initialize the room if it doesn't exist
  if (!rooms[roomId]) {
    gameLogic.initializeRoom(roomId, settings);
    rooms[roomId] = { players: [], gameStarted: false , firstWord: gameLogic.getRoom(roomId).firstWord };
  }

  const room = rooms[roomId];
  // Prevent duplicate players in the room
  if (!room.players.some((p) => p.id === socket.id)) {
    room.players.push({ id: socket.id, name: user.name, photo: user.profilePicture, userId: user._id });
  }

  socket.join(roomId);
  gameLogic.setRoomId(roomId, rooms[roomId].players);
  // Emit the updated player list to everyone in the room
  console.log(`Updated players list for room ${roomId}:`, room.players);
  io.to(roomId).emit("updatePlayers", room.players);
  io.to(roomId).emit("updateHost", gameLogic.getHost(roomId));
 
};

const leaveRoom = (roomId, socket) => {
  if (!rooms[roomId]) {
    console.error(`Room ${roomId} not found in leaveRoom`);
    return;
  }

  const room = rooms[roomId];
  room.players = room.players.filter((p) => p.id !== socket.id);
  gameLogic.leaveRoom(roomId, socketToIDMap[socket.id]);
  // socket.leave(roomId);

  gameLogic.setHost(roomId);
  // If the room is empty, delete it
  if (room.players.length === 0) {
    delete rooms[roomId];
    delete inRoom[roomId];
  } else {
    // Notify remaining players about the updated player list
    io.to(roomId).emit("updatePlayers", room.players);
    io.to(roomId).emit("updateHost", gameLogic.getHost(roomId));
  }
};

const startGame = (roomId, gameDetails) => {
  console.log(`startGame called with roomId: ${roomId}`);
  if (!rooms[roomId]) {
    console.error(`Room ${roomId} not found in startGame`);
    return;
  }
  // set gameStarted to true
  gameLogic.initializeRoom(roomId, { minLength: gameDetails.minWordLength, hideLetter: gameDetails.hideLetter, type: gameDetails.hardMode , time: gameDetails.timeLimit});
  gameLogic.setGameStarted(roomId);
  gameLogic.setRoomId(roomId, rooms[roomId].players);
  // Emit to everyone that the game has started in this room
  io.to(roomId).emit("gameStarted", {
    roomId,
    message: `The game in room ${roomId} has started!`,
    gameState: { players: rooms[roomId].players, started: true },
  });
  console.log(`Game started in room ${roomId}, notification sent to everyone.`);
};

const endGame = (roomId, socket) => {
  if (!rooms[roomId]) {
    console.error(`Room ${roomId} not found in endGame`);
    return;
  }
  socket.leave(roomId);
  gameLogic.endGame(roomId);
  inRoom[roomId] = [];
  rooms[roomId].players = [];
}
const gR = (roomId) => {
  if (!gameLogic.getRoom(roomId)) {
    return;
  }
  return gameLogic.getRoom(roomId);
};

const getPlayerStats = (socket) => {
  const userId = socketToIDMap[socket.id];
  if (!userId) {
    return;
  }
  return gameLogic.getPlayerStats(userId);
  
};

const notifyScores = (roomId) => {
  if (!rooms[roomId]) {
    return;
  }
  if (!gameLogic.getPlayerStats(roomId)) {
    return;
  }
  if (!gameLogic.getSortedScores(roomId)) {
    return;
  }
  const sortedScores = gameLogic.getSortedScores(roomId).map((scoreEntry) => {
    const userName = userIDtoNameMap[scoreEntry.playerName];
    return { playerName: userName, score: scoreEntry.score };
  });
  io.to(roomId).emit("updateScores", { scores: sortedScores });
};

const gameStarted = (roomId) => {
  const gameStarted = gameLogic.getGameStarted(roomId);
  return gameStarted;
};

const setInitiated = (userId, roomId) => {
  if (!userId) {
    return;
  }
  gameLogic.setInitiated(userId, roomId);
}
const initiated = (userId, roomId) => {
  const initiated = gameLogic.getInitiated(userId, roomId);
  return initiated;
}
const startGameLoop = (roomId, playerId) => {
  const roomState = rooms[roomId];
  if (!roomState) return;

  const playerSocket = userToSocketMap[playerId];
  if (!playerSocket) return;

  if (!gameLogic.getRoomInfo(roomId, playerId)) return;
  if (!gameLogic.getSortedScores(roomId)) return;

  const intervalId = setInterval(() => {
    // Safely get instanceState
    const instanceState = gameLogic.getRoomInfo(roomId, playerId);
    if (!instanceState) {
      clearInterval(intervalId); // Exit if room info is invalid
      return;
    }

    // Safely get sortedScores
    const sortedScoresRaw = gameLogic.getSortedScores(roomId);
    if (!sortedScoresRaw) {
      clearInterval(intervalId); // Exit if sorted scores are invalid
      return;
    }

    // Map sortedScores with error-checking
    const sortedScores = sortedScoresRaw.map((scoreEntry) => {
      const userName = userIDtoNameMap[scoreEntry.playerName];
      if (!userName) return null; // Handle missing username
      return {
        playerName: userName,
        playerId: scoreEntry.playerName,
        score: scoreEntry.score,
        playerState: scoreEntry.playerState,
      };
    }).filter((entry) => entry !== null); // Filter out invalid entries

    // Emit only if instanceState and sortedScores are valid
    if (sortedScores && instanceState) {
      playerSocket.emit("updateGameState", {
        roomState: instanceState.roomState,
        roomPlayers: instanceState.roomPlayers,
        playerStates: instanceState.playerStates,
        roomScores: sortedScores,
      });
    }

    // Stop interval if game has ended
    if (instanceState.roomState?.gameEnded) {
      clearInterval(intervalId);
      return;
    }
  }, 1000 / 30);
};

const updateProfilePicture = (userId, profilePicture) => {
  userIDtoPhotoMap[userId] = profilePicture;
};

const addInRoom = (roomId, playerId) => {
  if (!inRoom[roomId]) {
    inRoom[roomId] = [];
  }
  // Check if the playerId already exists in the room
  if (!inRoom[roomId].includes(playerId)) {
    inRoom[roomId].push(playerId);
  }
};

const getActiveRooms = (roomId) => {
  if (!rooms) {
    return false;
  }
  for (const key of Object.entries(rooms)) {
    //console.log("ACTIVE ROOMS",key);
    if (key === roomId) {
      return true;
    }
  }
  return false;
}
const inTheRoom = (roomId, playerId) => {
  return inRoom[roomId]?.includes(playerId);
};
module.exports = {
  init: (http) => {
    io = require("socket.io")(http);

    io.on("connection", (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      // When a user joins a room
      socket.on("joinRoom", ({ roomId, user }) => {
        if (!roomId || !user) {
          socket.emit("errorMessage", "Invalid joinRoom request");
          return;
        }
        joinRoom(roomId, user, socket);
      });

      // When a user leaves a room
      socket.on("leaveRoom", (roomId) => {
        leaveRoom(roomId, socket);
      });
      socket.on("endGame", (roomId) => {
        endGame(roomId, socket);
      });
      
      // When a user submits a query
      socket.on("submitQuery", async ({ roomId, query }) => {
        const user = getUserFromSocketID(socket.id);
        if (!user) {
          socket.emit("errorMessage", "User not found.");
          return;
        }

        try {
          // Process the query and get the updated game state
          gameLogic.handlePlayerSearch(user._id, roomId, query);
          // Send the updated game state back to the specific user
          // socket.emit("updateGameState", newGameState);
          // notifyScores(roomId);
          // Optionally broadcast the game state to all clients in the room
          // io.to(roomId).emit("updateGameState", newGameState);
          
        } catch (error) {
          console.error(`Error processing query: ${error.message}`);
          socket.emit("errorMessage", error.message);
        }
      });



      socket.on("firstWord", ({ roomId, gameDetails }) => {
        startGame(roomId, gameDetails);
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`);
        const user = getUserFromSocketID(socket.id);

        if (user) {
          for (const [roomId, room] of Object.entries(rooms)) {
            if (room.players.some((p) => p.id === socket.id)) {
              leaveRoom(roomId, socket); // Remove the player from the room
            }
          }
        }

        removeUser(user, socket); // Clean up user-to-socket mappings
      });
    });
  },

  addUser: addUser,
  removeUser: removeUser,

  getSocketFromUserID: getSocketFromUserID,
  getUserFromSocketID: getUserFromSocketID,
  getSocketFromSocketID: getSocketFromSocketID,
  getIo: () => io,
  gR: gR,

  joinRoom: joinRoom,
  leaveRoom: leaveRoom,
  startGame: startGame,
  getPlayerStats: getPlayerStats,
  notifyScores: notifyScores,
  gameStarted: gameStarted, 
  initiated: initiated, 
  setInitiated: setInitiated,
  startGameLoop: startGameLoop,
  endGame: endGame,
  updateProfilePicture: updateProfilePicture,
  addInRoom: addInRoom,
  inTheRoom: inTheRoom,
  getActiveRooms: getActiveRooms,
};
