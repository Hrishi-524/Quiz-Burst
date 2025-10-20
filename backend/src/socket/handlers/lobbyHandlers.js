import Quiz from '../../models/Quiz.js';
import gameService from '../../services/gameService.js';

// HOST: create lobby (only when hosting from QuizBank)
export const handleCreateLobby = (io, socket) => {
    socket.on('createLobby', async ({ quizId, user }) => {
        try {
            if (!quizId || !user) {
                socket.emit('error', { message: 'Missing quizId or user for createLobby' });
                return;
            }
            
            // verify quiz exists
            const quiz = await Quiz.findById(quizId);
            if (!quiz) {
                socket.emit('error', { message: 'Quiz not found' });
                return;
            }

            console.log(`Creating game for quiz ${quizId} by host ${user.id}`);
            const game = await gameService.createGame(quizId, user.id);

            // socket that created the lobby should be joined server-side in createGame (or do it here)
            socket.join(game.gameCode);

            // helpful event so client can navigate from QuizBank -> Lobby (already implemented on your client)
            socket.emit('takeGameCode', { gameCode: game.gameCode, quizTitle: game.quiz.title });

            // emit lobbyInfo back to the creator socket only
            socket.emit('lobbyInfo', {
                gameCode: game.gameCode,
                quizTitle: game.quiz.title,
                players: game.players.map(p => ({ name: p.name, score: p.score })),
                gameStatus: game.status,
                isLobbyOwner: true
            });

            // notify everyone (room is just host now)
            io.to(game.gameCode).emit('playersUpdate', {
                players: game.players.map(p => ({ name: p.name, score: p.score }))
            });


            console.log(`Created new game: ${game.gameCode}`);
        } catch (err) {
            console.error('createLobby error:', err);
            socket.emit('error', { message: err.message || 'Failed to create lobby' });
        }
    });
};

// HOST: join an existing lobby (e.g. refresh or direct URL)
export const handleHostJoin = (io, socket) => {
  socket.on('hostJoin', async ({ gameCode, user }) => {
    try {
      if (!gameCode) {
        socket.emit('error', { message: 'Missing gameCode for hostJoin' });
        return;
      }

      const game = await gameService.getGame(gameCode);
      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      socket.join(gameCode);
      console.log(`Host (${user?.username || user?.id || 'unknown'}) rejoined room ${gameCode}`);

      socket.emit('lobbyInfo', {
        gameCode: game.gameCode,
        quizTitle: game.quiz.title,
        players: game.players.map(p => ({ name: p.name, score: p.score })),
        gameStatus: game.status,
        isLobbyOwner: user ? (game.host.toString() === user.id) : false
      });

      io.to(gameCode).emit('playersUpdate', {
        players: game.players.map(p => ({ name: p.name, score: p.score }))
      });
    } catch (err) {
      console.error('hostJoin error:', err);
      socket.emit('error', { message: err.message || 'Host join failed' });
    }
  });
};

// PLAYER: join using game code + playerName
export const handlePlayerJoin = (io, socket) => {
  socket.on('playerJoin', async ({ gameCode, playerName }) => {
    try {
      if (!gameCode || !playerName) {
        socket.emit('error', { message: 'Missing gameCode or playerName' });
        return;
      }

      // make sure game exists
      const game = await gameService.getGame(gameCode);
      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      // ensure duplicates checked only against game.players (not host)
      if (game.players.some(p => p.name.toLowerCase() === playerName.toLowerCase())) {
        socket.emit('error', { message: 'Name already taken' });
        return;
      }

      const updatedGame = await gameService.addPlayer(gameCode, playerName, socket.id);
      
      socket.join(gameCode);
      console.log(`Player ${playerName} joined game ${gameCode}`);

      console.log('Updated players:', updatedGame.players);
      // notify everyone
      io.to(gameCode).emit('playersUpdate', {
            players: updatedGame.players.map(p => ({ name: p.name, score: p.score }))
      });

      // reply only to joining socket
      socket.emit('joinSuccess', {
        gameCode,
        playerName,
        quizTitle: updatedGame.quiz?.title,
        players: updatedGame.players
      });
    } catch (err) {
      console.error('playerJoin error:', err);
      socket.emit('error', { message: err.message || 'Failed to join as player' });
    }
  });
};

// Host starts the game
export const handleStartGame = (io, socket) => {
  socket.on('startGame', async ({ gameCode, hostId }) => {
    try {
        console.log('startgame is initiated by host')
        console.log(hostId)
      const game = await gameService.startGame(gameCode, hostId);

      // Notify everyone game has started
      io.to(gameCode).emit('gameStarted', {
        message: 'Game is starting!',
        gameCode
      });

      // Send first question after 2 second delay
      setTimeout(() => {
        const question = game.quiz.questions[0];
        const questionData = {
          questionNumber: 1,
          totalQuestions: game.quiz.questions.length,
          question: question.question,
          options: question.options,
          timeLimit: question.timeLimit || 30,
          points: question.points || 1000
        };

        io.to(gameCode).emit('newQuestion', questionData);
      }, 2000);

    } catch (error) {
      console.error('Start game error:', error);
      socket.emit('error', { message: error.message });
    }
  });
};

// Close lobby (host only)
export const handleCloseLobby = (io, socket) => {
  socket.on('closeLobby', async ({ gameCode }) => {
    try {
      await gameService.endGame(gameCode);
      
      io.to(gameCode).emit('lobbyClosed', {
        message: 'Host closed the lobby'
      });

      // Disconnect all sockets from this room
      const socketsInRoom = await io.in(gameCode).fetchSockets();
      socketsInRoom.forEach(s => s.leave(gameCode));

    } catch (error) {
      console.error('Close lobby error:', error);
    }
  });
};




// ====== GAME HANDLERS ======

// Player submits answer
export const handleSubmitAnswer = (io, socket) => {
  socket.on('submitAnswer', async ({ gameCode, answerIndex }) => {
    try {
      const result = await gameService.updatePlayerScore(
        gameCode, 
        socket.id, 
        answerIndex
      );

      // Send result to the player
      socket.emit('answerResult', {
        isCorrect: result.isCorrect,
        correctAnswer: result.currentQuestion.correctAnswer,
        score: result.player.score
      });

      // Update leaderboard for HOST ONLY (not players during game)
      const game = await gameService.getGame(gameCode);
      const leaderboard = gameService.getLeaderboard(game);
      
      io.to(gameCode).emit('leaderboardUpdate', { leaderboard });

    } catch (error) {
      console.error('Submit answer error:', error);
      socket.emit('error', { message: error.message });
    }
  });
};

// Host shows answer and stats
export const handleShowAnswer = (io, socket) => {
  socket.on('showAnswer', async ({ gameCode }) => {
    try {
      const game = await gameService.getGame(gameCode);
      const currentQuestion = game.quiz.questions[game.currentQuestion];

      io.to(gameCode).emit('answerReveal', {
        correctAnswer: currentQuestion.correctAnswer,
        explanation: currentQuestion.explanation || null
      });

    } catch (error) {
      console.error('Show answer error:', error);
    }
  });
};

// Host moves to next question
export const handleNextQuestion = (io, socket) => {
  socket.on('nextQuestion', async ({ gameCode }) => {
    try {
      const { game, isGameOver } = await gameService.nextQuestion(gameCode);

      if (isGameOver) {
        const leaderboard = gameService.getLeaderboard(game);
        
        io.to(gameCode).emit('gameEnded', {
          message: 'Quiz completed!',
          leaderboard
        });
      } else {
        const question = game.quiz.questions[game.currentQuestion];
        const questionData = {
          questionNumber: game.currentQuestion + 1,
          totalQuestions: game.quiz.questions.length,
          question: question.question,
          options: question.options,
          timeLimit: question.timeLimit || 30,
          points: question.points || 1000
        };

        io.to(gameCode).emit('newQuestion', questionData);
      }

    } catch (error) {
      console.error('Next question error:', error);
      socket.emit('error', { message: error.message });
    }
  });
};

// Host ends game manually
export const handleEndGame = (io, socket) => {
  socket.on('endGame', async ({ gameCode }) => {
    try {
      const game = await gameService.endGame(gameCode);
      const leaderboard = gameService.getLeaderboard(game);

      io.to(gameCode).emit('gameEnded', {
        message: 'Game ended by host',
        leaderboard
      });

    } catch (error) {
      console.error('End game error:', error);
    }
  });
};

// timer expiry
export const handleTimeUp = (io, socket) => {
  socket.on('timeUp', async ({ gameCode }) => {
    try {
      const game = await gameService.getGame(gameCode);
      const currentQuestion = game.quiz.questions[game.currentQuestion];

      // Emit answer reveal to everyone
      io.to(gameCode).emit('answerReveal', {
        correctAnswer: currentQuestion.correctAnswer,
        explanation: currentQuestion.explanation || null
      });

      // After 3 seconds, move to next question automatically
      setTimeout(async () => {
        const { game: updatedGame, isGameOver } = await gameService.nextQuestion(gameCode);

        if (isGameOver) {
          const leaderboard = gameService.getLeaderboard(updatedGame);
          
          io.to(gameCode).emit('gameEnded', {
            message: 'Quiz completed!',
            leaderboard
          });
        } else {
          const question = updatedGame.quiz.questions[updatedGame.currentQuestion];
          const questionData = {
            questionNumber: updatedGame.currentQuestion + 1,
            totalQuestions: updatedGame.quiz.questions.length,
            question: question.question,
            options: question.options,
            timeLimit: question.timeLimit || 30,
            points: question.points || 1000
          };

          io.to(gameCode).emit('newQuestion', questionData);
        }
      }, 3000);

    } catch (error) {
      console.error('Time up error:', error);
    }
  });
};

// Player disconnects
export const handleDisconnect = (io, socket) => {
  return async () => {
    try {
      // Find game where this player exists
      const result = await gameService.removePlayer(null, socket.id);
      
      if (result && result.game) {
        io.to(result.game.gameCode).emit('playersUpdate', {
          players: result.game.players.map(p => ({ name: p.name, score: p.score }))
        });
        
        console.log(`Player ${result.removedPlayer?.name} disconnected`);
      }
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };
};