import Game from '../../models/Game.js';
import Quiz from '../../models/Quiz.js';

export const handleHostJoin = (io, socket) => {
    socket.on('hostJoin', async ({ gameCode }) => {
        try {
        console.log('Host joining game:', gameCode);
        
        // Join the socket room
        socket.join(gameCode);
        socket.join(`${gameCode}-host`);
        
        // Get game details
        const game = await Game.findOne({ gameCode }).populate('quiz');
        if (!game) {
            socket.emit('error', { message: 'Game not found' });
            return;
        }
        
        // Send initial data to host
        socket.emit('waitingRoom', {
            players: game.players,
            quizTitle: game.quiz.title,
            totalQuestions: game.quiz.questions.length,
            gameStatus: game.status
        });
        
        } catch (error) {
        console.error('Host join error:', error);
        socket.emit('error', { message: 'Failed to join as host' });
        }
    });
};

export const handleStartGame = (io, socket) => {
  socket.on('startGame', async ({ gameCode }) => {
    try {
      console.log('Starting game:', gameCode);
      
      const game = await Game.findOne({ gameCode }).populate('quiz');
      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }
      
      if (game.status !== 'waiting') {
        socket.emit('error', { message: 'Game already started' });
        return;
      }
      
      // Update game status
      game.status = 'in-progress';
      game.currentQuestion = 0;
      game.startedAt = new Date();
      await game.save();
      
      const firstQuestion = game.quiz.questions[0];
      
      // Prepare question data (hide correct answer from players)
      const questionData = {
        question: firstQuestion.question,
        options: firstQuestion.options,
        timeLimit: firstQuestion.timeLimit || 30,
        points: firstQuestion.points || 1000,
        questionNumber: 1,
        totalQuestions: game.quiz.questions.length
      };
      
      // Notify all players and host
      io.to(gameCode).emit('gameStarted', {
        message: 'Game has started!',
        quizTitle: game.quiz.title
      });
      
      // Send first question after a short delay
      setTimeout(() => {
        io.to(gameCode).emit('questionUpdate', {
          question: questionData,
          quizTitle: game.quiz.title
        });
      }, 2000);
      
    } catch (error) {
      console.error('Start game error:', error);
      socket.emit('error', { message: 'Failed to start game' });
    }
  });
};

export const handleNextQuestion = (io, socket) => {
  socket.on('nextQuestion', async ({ gameCode }) => {
    try {
      console.log('Next question for game:', gameCode);
      
      const game = await Game.findOne({ gameCode }).populate('quiz');
      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }
      
      if (game.status !== 'in-progress') {
        socket.emit('error', { message: 'Game not in progress' });
        return;
      }
      
      // Move to next question
      game.currentQuestion = (game.currentQuestion || 0) + 1;
      
      if (game.currentQuestion >= game.quiz.questions.length) {
        // Game is over
        game.status = 'ended';
        game.finishedAt = new Date();
        await game.save();
        
        // Calculate final leaderboard
        const leaderboard = game.players
          .sort((a, b) => b.score - a.score)
          .map((player, index) => ({
            rank: index + 1,
            name: player.name,
            score: player.score
          }));
        
        io.to(gameCode).emit('gameEnded', {
          message: 'Game finished!',
          leaderboard
        });
        
        return;
      }
      
      await game.save();
      const question = game.quiz.questions[game.currentQuestion];
      
      const questionData = {
        question: question.question,
        options: question.options,
        timeLimit: question.timeLimit || 30,
        points: question.points || 1000,
        questionNumber: game.currentQuestion + 1,
        totalQuestions: game.quiz.questions.length
      };
      
      // Send next question
      io.to(gameCode).emit('questionUpdate', {
        question: questionData,
        quizTitle: game.quiz.title
      });
      
    } catch (error) {
      console.error('Next question error:', error);
      socket.emit('error', { message: 'Failed to load next question' });
    }
  });
};

export const handleShowAnswer = (io, socket) => {
  socket.on('showAnswer', async ({ gameCode }) => {
    try {
      const game = await Game.findOne({ gameCode }).populate('quiz');
      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }
      
      const currentQuestion = game.quiz.questions[game.currentQuestion || 0];
      
      // Send correct answer to all players
      io.to(gameCode).emit('showAnswer', {
        correctIndex: currentQuestion.correctAnswer,
        explanation: currentQuestion.explanation || null
      });
      
    } catch (error) {
      console.error('Show answer error:', error);
      socket.emit('error', { message: 'Failed to show answer' });
    }
  });
};

export const handleEndGame = (io, socket) => {
  socket.on('endGame', async ({ gameCode }) => {
    try {
      const game = await Game.findOne({ gameCode });
      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }
      
      game.status = 'ended';
      game.finishedAt = new Date();
      await game.save();
      
      const leaderboard = game.players
        .sort((a, b) => b.score - a.score)
        .map((player, index) => ({
          rank: index + 1,
          name: player.name,
          score: player.score
        }));
      
      io.to(gameCode).emit('gameEnded', {
        message: 'Game ended by host',
        leaderboard
      });
      
    } catch (error) {
      console.error('End game error:', error);
      socket.emit('error', { message: 'Failed to end game' });
    }
  });
};