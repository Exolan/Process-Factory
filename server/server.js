const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require("path");
const GameSession = require("./gameSession.js");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

let gameSession = new GameSession();
let { players, roles, gamePhase } = gameSession.getData();

function checkAllPlayersReady() {
  const allPlayers = Array.from(players.values());
  const allReady =
    allPlayers.length > 0 && allPlayers.every((player) => player.isReady);

  if (allReady) {
    gamePhase = "role-selection";
    io.emit("gameCards", Array.from(roles.entries()));
    allPlayers.forEach((player) => (player.isReady = false));
  }
}

function checkAllRolesSelected() {
  const playersCount = players.size;
  const allRoles = Array.from(roles.values());

  let count = 0;

  for (let i = 0; i < allRoles.length; i++) {
    if (allRoles[i].isSelect) {
      count++;
    }

    if (count === playersCount) {
      gamePhase = "game";
      players.forEach((playerData, playerSocketId) => {
        io.to(playerSocketId).emit("startGame", { role: playerData.role });
      });
    }
  }
}

app.use(express.static(path.join(__dirname, "../client")));

io.on("connection", (socket) => {
  const socketID = socket.id;

  socket.on("playerConnect", () => {
    console.log("ID пользователя: ", socketID);
    players.set(socketID, { role: null, isReady: false });
    io.emit("lobbyUpdate", Array.from(players.values()));
  });

  socket.on("playerIsReady", () => {
    const player = players.get(socketID);
    if (player) {
      player.isReady = true;
    }
    io.emit("lobbyUpdate", Array.from(players.values()));
    checkAllPlayersReady();
  });

  socket.on("selectRole", (roleKey) => {
    const player = players.get(socketID);
    if (player) {
      player.role = roleKey;

      const role = roles.get(roleKey);
      if (role) {
        role.isSelect = true;
      }
    }
    console.log(`Пользователь ${socketID} выбрал роль ${roleKey}`);
    io.emit("cardsUpdate", Array.from(roles.entries()));
    checkAllRolesSelected();
  });

  socket.on("disconnect", () => {
    console.log("Пользователь отключился");
    const player = players.get(socketID);

    if (player && player.role) {
      const role = roles.get(player.role);
      if (role) role.isSelect = false;
    }

    players.delete(socketID);
    io.emit("lobbyUpdate", Array.from(players.values()));
    io.emit("cardsUpdate", Array.from(roles.entries()));
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log("Сервер запущен: ", `http://localhost:${PORT}`);
});
