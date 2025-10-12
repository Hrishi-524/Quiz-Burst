import {
  handleCreateLobby,
  handleHostJoin,
  handlePlayerJoin,
  handleStartGame,
  handleCloseLobby,
  handleSubmitAnswer,
  handleShowAnswer,
  handleNextQuestion,
  handleEndGame,
  handleDisconnect,
  handleTimeUp  // ADD THIS
} from './handlers/lobbyHandlers.js';

const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);
    
    // ===== LOBBY EVENTS =====
    handleCreateLobby(io, socket);
    handleHostJoin(io, socket);
    handlePlayerJoin(io, socket);
    handleStartGame(io, socket);
    handleCloseLobby(io, socket);

    // ===== GAME EVENTS =====
    handleSubmitAnswer(io, socket);
    handleShowAnswer(io, socket);
    handleNextQuestion(io, socket);
    handleTimeUp(io, socket);  // ADD THIS
    handleEndGame(io, socket);

    // ===== DISCONNECT =====
    socket.on('disconnect', () => handleDisconnect(io, socket)());
  });
};

export default setupSocketHandlers;