// backend/src/services/gameService.js
import Game from '../models/Game.js';
import Quiz from '../models/Quiz.js';
import generateGameCode from './codeGenerator.js';

class GameService {
  // Create game when host enters lobby (or return existing one)
  async createGame(quizId, hostId) {
    console.log(`Creating game for quiz ${quizId} by host ${hostId}`);
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    // Check if host already has an active game for this quiz
    // const existingGame = await Game.findOne({
    //   quiz: quizId,
    //   host: hostId,
    //   status: { $in: ['waiting', 'in-progress'] }
    // }).populate('quiz');

    // if (existingGame) {
    //   console.log(`Returning existing game: ${existingGame.gameCode}`);
    //   return existingGame;
    // }

    // Generate unique 6-digit game code
    let gameCode;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      gameCode = generateGameCode();
      const codeExists = await Game.findOne({ 
        gameCode, 
        status: { $in: ['waiting', 'in-progress'] } 
      });
      if (!codeExists) break;
      attempts++;
    }

    if (attempts === maxAttempts) {
      throw new Error('Failed to generate unique game code');
    }

    const game = new Game({
      quiz: quizId,
      host: hostId,
      gameCode,
      players: [],
      questionStats: (quiz.questions || []).map(() => ({ correctCount: 0, incorrectCount: 0, totalAnswers: 0 })),
      status: 'waiting',
      currentQuestion: 0
    });

    await game.save();
    console.log(`Created new game: ${gameCode}`);
    return game;
  }

  // Get game by code
  async getGame(gameCode) {
    return await Game.findOne({ gameCode }).populate('quiz');
  }

  // Player joins game
  async addPlayer(gameCode, playerName, socketId) {
    const game = await Game.findOne({ gameCode });
    if (!game) {
      throw new Error('Game not found');
    }

    if (game.status !== 'waiting') {
      throw new Error('Game already started');
    }

    const player = {
        name: playerName,
        socketId,
        score: 0 
    };

    console.log(`Adding player ${playerName} to game ${gameCode}`);
    game.players.push(player);
    await game.save();

    return game;
  }

  // Remove player (on disconnect/leave)
    async removePlayer(gameCode, socketId) {
        // if gameCode is null, find by socketId
        let game;
        if (gameCode) {
            game = await Game.findOne({ gameCode });
        } else {
            game = await Game.findOne({ 'players.socketId': socketId });
        }

        if (!game) return null;

        const removedPlayer = game.players.find(p => p.socketId === socketId);
        game.players = game.players.filter(p => p.socketId !== socketId);
        await game.save();

        return { game, removedPlayer };
    }


  // Start game
  async startGame(gameCode, hostId) {
  // Populate quiz AND its questions in one go
  let game = await Game.findOne({ gameCode }).populate({
    path: 'quiz',
    populate: {
      path: 'questions'
    }
  });

  console.log('game is found');
  console.log(game);
  
  if (!game) {
    throw new Error('Game not found');
  }

  if (game.host !== hostId) {
    throw new Error('Only host can start the game');
  }

  if (game.players.length === 0) {
    throw new Error('At least 1 player required');
  }

  game.status = 'in-progress';
  game.currentQuestion = 0;
  await game.save();

  return game;
}

  // Update player score
  async updatePlayerScore(gameCode, socketId, answerIndex) {
    const game = await Game.findOne({ gameCode }).populate('quiz');
    if (!game) {
      throw new Error('Game not found');
    }

    const player = game.players.find(p => p.socketId === socketId);
    if (!player) {
      throw new Error('Player not found');
    }

    const currentQuestion = game.quiz.questions[game.currentQuestion];
    const isCorrect = currentQuestion.correctAnswer === answerIndex;

    if (isCorrect) {
      player.score += currentQuestion.points || 1000;
    }

    // Update per-question stats
    if (!game.questionStats || game.questionStats.length !== game.quiz.questions.length) {
      game.questionStats = (game.quiz.questions || []).map(() => ({ correctCount: 0, incorrectCount: 0, totalAnswers: 0 }));
    }
    const stat = game.questionStats[game.currentQuestion] || { correctCount: 0, incorrectCount: 0, totalAnswers: 0 };
    stat.totalAnswers += 1;
    if (isCorrect) stat.correctCount += 1; else stat.incorrectCount += 1;
    game.questionStats[game.currentQuestion] = stat;

    await game.save();

    return { isCorrect, player, currentQuestion };
  }

  // Get leaderboard
  getLeaderboard(game) {
    return game.players
      .sort((a, b) => b.score - a.score)
      .map((player, index) => ({
        rank: index + 1,
        name: player.name,
        score: player.score
      }));
  }

  // Move to next question
  async nextQuestion(gameCode) {
    const game = await Game.findOne({ gameCode }).populate('quiz');
    if (!game) {
      throw new Error('Game not found');
    }

    game.currentQuestion += 1;

    // Check if game is over
    if (game.currentQuestion >= game.quiz.questions.length) {
      game.status = 'ended';
      await game.save();
      return { game, isGameOver: true };
    }

    await game.save();
    return { game, isGameOver: false };
  }

  // End game manually
  async endGame(gameCode) {
    const game = await Game.findOne({ gameCode });
    if (!game) {
      throw new Error('Game not found');
    }

    game.status = 'ended';
    await game.save();

    return game;
  }
}

export default new GameService();