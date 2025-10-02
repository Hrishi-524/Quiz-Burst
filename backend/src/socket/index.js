// src/socket/index.js
import { handleHostJoin, handleStartGame, handleNextQuestion, handleShowAnswer, handleEndGame } from './handlers/gameHandlers.js';
import { handleJoinGame, handleSubmitAnswer, handlePlayerLeave, handleDisconnect } from './handlers/playerHandlers.js';

const setupSocketHandlers = (io) => {
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        // Game host handlers
        handleHostJoin(io, socket);
        handleStartGame(io, socket);
        handleNextQuestion(io, socket);
        handleShowAnswer(io, socket);
        handleEndGame(io, socket);

        // Player handlers
        handleJoinGame(io, socket);
        handleSubmitAnswer(io, socket);
        handlePlayerLeave(io, socket);

        // Disconnect handler
        socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        handleDisconnect(io, socket);
        });
    });
};

export default setupSocketHandlers;