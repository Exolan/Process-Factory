const socket = io();

socket.on("connect", () => {
  console.log("Подключение установлено");
  socket.emit("playerConnect");

  const header = document.querySelector("h1");
  header.innerText += ` ${socket.id}`;
});

socket.on("lobbyUpdate", (players) => {
  const lobbyHeader = document.querySelector(".lobby__header");

  let readyPlayers = 0;
  const allPlayers = players.length;

  players.forEach((player) => {
    if (player.isReady) {
      readyPlayers++;
    }
  });

  if (lobbyHeader.querySelector("h4")) {
    const countsOld = lobbyHeader.querySelector("h4");
    lobbyHeader.removeChild(countsOld);
  }
  const countsNew = document.createElement("h4");
  countsNew.innerText = `${readyPlayers}/${allPlayers}`;
  lobbyHeader.append(countsNew);
});

socket.on("gameCards", (roles) => {
  const lobby = document.querySelector(".lobby");
  const gameCards = document.querySelector(".game-cards");

  lobby.setAttribute("hidden", "hidden");
  gameCards.removeAttribute("hidden");

  const divCards = document.querySelector(".cards");
  divCards.innerHTML = "";

  roles.forEach(([key, role], index) => {
    const card = document.createElement("button");
    card.classList.add("card");
    card.dataset.roleKey = key;
    card.innerText = "Карта";

    if (!role.isSelect) {
      card.addEventListener("click", () => {
        socket.emit("selectRole", key);
        card.classList.add("selected");
        divCards.setAttribute("hidden", "hidden");

        const waiting = document.querySelector(".waiting");
        waiting.removeAttribute("hidden");
      });
    } else {
      card.classList.add("disabled");
    }

    divCards.appendChild(card);
  });
});

socket.on("cardsUpdate", (roles) => {
  const arrBtn = document.querySelectorAll(".card");
  for (let i = 0; i < roles.length; i++) {
    if (roles[i][1].isSelect) {
      arrBtn[i].setAttribute("disabled", "true");
    }
  }
});

socket.on("startGame", (data) => {
  const waiting = document.querySelector(".waiting");

  waiting?.setAttribute("hidden", "hidden");

  const myBoard = document.getElementById(data.role);
  if (myBoard) {
    myBoard.removeAttribute("hidden");
  } else {
    console.error(`Доска для роли ${data.role} не найдена!`);
  }
});

const btnReady = document.querySelector(".btn-ready");
btnReady.addEventListener("click", () => {
  socket.emit("playerIsReady");
});
