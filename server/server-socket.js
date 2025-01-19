const gameLogic = require("./game-logic");

let io;

const userToSocketMap = {}; // maps user ID to socket object
const socketToUserMap = {}; // maps socket ID to user object
const rooms = {}; // stores room data
const socketToIDMap = {};

const getAllConnectedUsers = () => Object.values(socketToUserMap);
const getSocketFromUserID = (userid) => userToSocketMap[userid];
const getUserFromSocketID = (socketid) => socketToUserMap[socketid];
const getSocketFromSocketID = (socketid) => io.sockets.sockets.get(socketid);
const getIDFromSocketID = (socket) => socketToIDMap[socket.id];
const addUser = (user, socket) => {
  console.log(user);
  
  if (!user || !user._id) {
    console.log(user);
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
};

const removeUser = (user, socket) => {
  if (user) {
    delete userToSocketMap[user._id];
  }
  delete socketToUserMap[socket.id];
  delete socketToIDMap[socket.id];
};

const joinRoom = (roomId, user, socket, settings) => {
  if (!roomId || !user || !user.name) {
    console.error("Invalid roomId or user object in joinRoom");
    return;
  }

  // Initialize the room if it doesn't exist
  if (!rooms[roomId]) {
    gameLogic.initializeRoom(roomId, settings);
    rooms[roomId] = { players: [], gameStarted: false };
  }

  const room = rooms[roomId];

  // Prevent duplicate players in the room
  if (!room.players.some((p) => p.id === socket.id)) {
    console.log(user);
    room.players.push({ id: socket.id, name: user.name, userId: socketToIDMap[socket.id] });
  }

  socket.join(roomId);

  // Emit the updated player list to everyone in the room
  console.log(`Updated players list for room ${roomId}:`, room.players);
  io.to(roomId).emit("updatePlayers", room.players);

  // Emit the initial game state to everyone in the room
  const initialGameState = gameLogic.getNextLetter(roomId);
  io.to(roomId).emit("updateGameState", { gameState: initialGameState });
};

const leaveRoom = (roomId, socket) => {
  if (!rooms[roomId]) {
    console.error(`Room ${roomId} not found in leaveRoom`);
    return;
  }

  const room = rooms[roomId];
  room.players = room.players.filter((p) => p.id !== socket.id);
  socket.leave(roomId);

  // If the room is empty, delete it
  if (room.players.length === 0) {
    delete rooms[roomId];
  } else {
    // Notify remaining players about the updated player list
    io.to(roomId).emit("updatePlayers", room.players);
  }
};

const startGame = (roomId, gameDetails) => {
  console.log(`startGame called with roomId: ${roomId}`);
  if (!rooms[roomId]) {
    console.error(`Room ${roomId} not found in startGame`);
    return;
  }
  // set gameStarted to true
  rooms[roomId].gameStarted = true;
  gameLogic.initializeRoom(roomId, { minLength: gameDetails.minWordLength, hideLetter: gameDetails.hideLetter, type: gameDetails.hardMode });
  // Emit to everyone that the game has started in this room
  io.to(roomId).emit("gameStarted", {
    roomId,
    message: `The game in room ${roomId} has started!`,
    gameState: { players: rooms[roomId].players, started: true },
  });

  console.log(`Game started in room ${roomId}, notification sent to everyone.`);
};


const gR = (roomId) => {
  if (!gameLogic.getRoom(roomId)) {
    return;
  }
  return gameLogic.getRoom(roomId);
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
        addUser(user, socket);
        joinRoom(roomId, user, socket);
      });

      // When a user leaves a room
      socket.on("leaveRoom", (roomId) => {
        leaveRoom(roomId, socket);
      });

      // When a user submits a query
      socket.on("submitQuery", async ({ roomId, query }) => {
        const user = getUserFromSocketID(socket.id);
        if (!user) {
          socket.emit("errorMessage", "User not found.");
          return;
        }

        try {
          const gameState = await gameLogic.handlePlayerSearch(user._id, roomId, query);
          io.to(roomId).emit("updateGameState", gameState); // Broadcast updated game state
        } catch (error) {
          console.error(`Error processing query: ${error.message}`);
          socket.emit("errorMessage", error.message);
        }
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
};
