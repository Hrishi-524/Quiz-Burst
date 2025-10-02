import Game, { findOne } from '../models/Game.js';
import { findById } from '../models/Quiz.js';
import { generateGameCode } from './codeGenerator.js';
import { GAME_SETTINGS, POINTS } from '../config/config.js';

class GameService {
  async createGame(quizId, hostId, settings = {}) {
    const quiz = await findById(quizId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    let code;
    let attempts = 0;
    const maxAttempts = 10;

    // Generate unique game code
    while (attempts < maxAttempts) {
      code = generateGameCode();
      const existingGame = await findOne({ code, status: { $ne: 'finished' } });
      if (!existingGame) break;
      attempts++;
    }

    if (attempts === maxAttempts) {
      throw new Error('Failed to generate unique game code');
    }

    const game = new Game({
      code,
      quizId,
      hostId,
      settings: {
        ...settings,
        shuffleOptions: settings.shuffleOptions !== false
      }
    });

    await game.save();
    return game;
  }

  async joinGame(code, playerName, socketId) {
    const game = await findOne({ code, status: 'waiting' });
    if (!game) {
      throw new Error('Game not found or already started');
    }

    if (game.players.length >= GAME_SETTINGS.MAX_PLAYERS) {
      throw new Error('Game is full');
    }

    // Check if player name already exists
    const existingPlayer = game.players.find(p => p.name === playerName);
    if (existingPlayer) {
      throw new Error('Name already taken');
    }

    const player = {
      id: socketId,
      name: playerName,
      score: 0,
      answers: [],
      isActive: true
    };

    game.players.push(player);
    await game.save();

    return { game, player };
  }

  async startGame(gameCode, hostId) {
    const game = await findOne({ code: gameCode, hostId });
    if (!game) {
      throw new Error('Game not found or unauthorized');
    }

    if (game.players.length < GAME_SETTINGS.MIN_PLAYERS) {
      throw new Error(`Minimum ${GAME_SETTINGS.MIN_PLAYERS} player(s) required`);
    }

    game.status = 'started';
    game.startedAt = new Date();
    game.currentQuestion = 0;
    await game.save();

    return game;
  }

  async submitAnswer(gameCode, playerId, questionIndex, answer, timeSpent) {
    const game = await findOne({ code: gameCode }).populate('quizId');
    if (!game) {
      throw new Error('Game not found');
    }

    const player = game.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    const question = game.quizId.questions[questionIndex];
    if (!question) {
      throw new Error('Question not found');
    }

    const isCorrect = answer === question.correctAnswer;
    let points = 0;

    if (isCorrect) {
      // Calculate points with time bonus
      const timeBonus = Math.max(0, (question.timeLimit - timeSpent) / question.timeLimit);
      points = Math.floor(POINTS.BASE_POINTS + (POINTS.BASE_POINTS * POINTS.TIME_BONUS_FACTOR * timeBonus));
      player.score += points;
    }

    player.answers.push({
      questionIndex,
      answer,
      isCorrect,
      points,
      timeSpent
    });

    await game.save();

    return { isCorrect, points, totalScore: player.score };
  }

  async nextQuestion(gameCode, hostId) {
    const game = await findOne({ code: gameCode, hostId }).populate('quizId');
    if (!game) {
      throw new Error('Game not found or unauthorized');
    }

    if (game.currentQuestion >= game.quizId.questions.length - 1) {
      game.status = 'finished';
      game.finishedAt = new Date();
    } else {
      game.currentQuestion++;
      game.status = 'question';
    }

    await game.save();
    return game;
  }

  async getLeaderboard(gameCode) {
    const game = await findOne({ code: gameCode });
    if (!game) {
      throw new Error('Game not found');
    }

    const leaderboard = game.players
      .filter(p => p.isActive)
      .sort((a, b) => b.score - a.score)
      .map((player, index) => ({
        rank: index + 1,
        name: player.name,
        score: player.score
      }));

    return leaderboard;
  }

  async endGame(gameCode, hostId) {
    const game = await findOne({ code: gameCode, hostId });
    if (!game) {
      throw new Error('Game not found or unauthorized');
    }

    game.status = 'finished';
    game.finishedAt = new Date();
    await game.save();

    return game;
  }

  async removePlayer(gameCode, playerId) {
    const game = await findOne({ code: gameCode });
    if (!game) return;

    const player = game.players.find(p => p.id === playerId);
    if (player) {
      player.isActive = false;
      await game.save();
    }
  }
}

export default new GameService();