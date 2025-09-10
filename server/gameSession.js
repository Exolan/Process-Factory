class GameSession {
  constructor() {
    this.players = new Map();
    this.roles = new Map([
      ["therapist", { isSelect: false }],
      ["receptionist", { isSelect: false }],
      ["patient", { isSelect: false }],
      ["specialist", { isSelect: false }],
    ]);
    this.gamePhase = "lobby";
  }

  getData() {
    return {
      players: this.players,
      roles: this.roles,
      gamePhase: this.gamePhase,
    };
  }

  uploadData(data) {
    const gameSession = new GameSession();
    gameSession.players = new Map(data.players);
    gameSession.roles = new Map(data.roles);
    gameSession.gamePhase = data.gamePhase;
    return gameSession;
  }
}

module.exports = GameSession;
