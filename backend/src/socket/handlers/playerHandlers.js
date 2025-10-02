// // src/socket/handlers/playerHandlers.js
// import Game from '../../models/Game.js';

// export const handleJoinGame = (io, socket) => {
//     socket.on('join-game', async ({ gameCode, name }) => {
//         try {
//             const game = await Game.findOne({ gameCode });
//             if (!game) {
//                 socket.emit('error', { message: 'Game not found' });
//                 return;
//             }

//             if (game.status !== 'waiting') {
//                 socket.emit('error', { message: 'Game already started' });
//                 return;
//             }

//             game.players.push({ name, socketId: socket.id });
//             await game.save();

//             socket.join(gameCode);
//             console.log(`Player ${name} (${socket.id}) joined ${gameCode}`);

//             io.to(gameCode).emit('player-joined', {
//                 players: game.players.map(p => ({ name: p.name, score: p.score }))
//             });
//         } catch (err) {
//         console.error('join-game error:', err);
//         }
//     });
// };

// // Player submits answer
// export const handleSubmitAnswer = (io, socket) => {
//     socket.on('submit-answer', async ({ gameCode, answer }) => {
//         const game = await Game.findOne({ gameCode }).populate('quiz');
//         if (!game) return;

//         const player = game.players.find(p => p.socketId === socket.id);
//         if (!player) return;

//         const qIndex = game.currentQuestion - 1;
//         const question = game.quiz.questions[qIndex];
//         if (!question) return;

//         if (answer === question.correctAnswer) {
//         player.score += question.points;
//         }

//         await game.save();

//         socket.emit('answer-result', {
//         correctAnswer: question.correctAnswer,
//         score: player.score
//         });
//     });
// };

// // Player leaves
// export const handlePlayerLeave = (io, socket) => {
//     socket.on('leave-game', async ({ gameCode }) => {
//         const game = await Game.findOne({ gameCode });
//         if (!game) return;

//         game.players = game.players.filter(p => p.socketId !== socket.id);
//         await game.save();

//         io.to(gameCode).emit('player-left', { players: game.players });
//     });
// };

// // Handle disconnect
// export const handleDisconnect = async (io, socket) => {
//     try {
//         const game = await Game.findOne({ 'players.socketId': socket.id });
//         if (!game) return;

//         game.players = game.players.filter(p => p.socketId !== socket.id);
//         await game.save();

//         io.to(game.gameCode).emit('player-left', { players: game.players });
//         console.log(`Player disconnected: ${socket.id}`);
//     } catch (err) {
//         console.error('disconnect error:', err);
//     }
// };

// src/socket/handlers/playerHandlers.js
import Game from '../../models/Game.js';

// Player joins a game room
export const handleJoinGame = (io, socket) => {
  socket.on('joinGame', async ({ gameCode, name }) => {
    try {
      const game = await Game.findOne({ gameCode });
      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      socket.join(gameCode);

      // Attach playerId to socket for cleanup
      const player = { name, score: 0, socketId: socket.id };
      game.players.push(player);
      await game.save();

      io.to(gameCode).emit('playerJoined', { name, players: game.players });
      console.log(`Player ${name} joined game ${gameCode}`);
    } catch (err) {
      console.error('Join game error:', err);
    }
  });
};

// Player submits answer
export const handleSubmitAnswer = (io, socket) => {
  socket.on("submitAnswer", async ({ gameCode, answer }) => {
    try {
      const game = await Game.findOne({ gameCode }).populate("quiz");
      if (!game) return;

      const currentQuestionIndex = game.currentQuestionIndex;
      const currentQuestion = game.quiz.questions[currentQuestionIndex];

      // ✅ check answer correctness
      const isCorrect = currentQuestion.correctAnswer === answer;

      // ✅ find the player in the game
      const player = game.players.find((p) => p.socketId === socket.id);
      if (player) {
        if (isCorrect) {
          player.score = (player.score || 0) + 10; // add points
        }
        await game.save();
      }

      // ✅ broadcast updated scores to everyone in the room
      io.to(gameCode).emit("scoreboardUpdate", { players: game.players });

    } catch (err) {
      console.error("Error handling answer:", err);
    }
  });
};


// Player leaves manually
export const handlePlayerLeave = (io, socket) => {
  socket.on('leaveGame', async ({ gameCode, name }) => {
    try {
      const game = await Game.findOne({ gameCode });
      if (!game) return;

      game.players = game.players.filter(p => p.name !== name);
      await game.save();

      socket.leave(gameCode);
      io.to(gameCode).emit('playerLeft', { name, players: game.players });
      console.log(`Player ${name} left game ${gameCode}`);
    } catch (err) {
      console.error('Leave game error:', err);
    }
  });
};

// Cleanup when player disconnects
export const handleDisconnect = async (io, socket) => {
  try {
    const game = await Game.findOne({ 'players.socketId': socket.id });
    if (!game) return;

    const player = game.players.find(p => p.socketId === socket.id);
    game.players = game.players.filter(p => p.socketId !== socket.id);
    await game.save();

    io.to(game.gameCode).emit('playerLeft', { name: player?.name, players: game.players });
    console.log(`Player ${player?.name} disconnected from game ${game.gameCode}`);
  } catch (err) {
    console.error('Disconnect error:', err);
  }
};
