import Game from '../models/Game.js';
import Quiz from '../models/Quiz.js';
import { nanoid } from 'nanoid';

// Host creates a game
export const createGame = async (req, res) => {
  try {
    const { quizId, host } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const gameCode = nanoid(6).toUpperCase();

    const game = new Game({
      quiz: quizId,
      host: host || 'host',
      gameCode,
      status: 'waiting',
      players: []
    });

    await game.save();

    res.status(201).json({
      message: 'Game created successfully',
      game: {
        id: game._id,
        gameCode: game.gameCode,
        quizId: quizId,
        status: game.status
      }
    });
  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({ error: 'Failed to create game' });
  }
};

// Player joins a game
export const joinGame = async (req, res) => {
  try {
    const { gameCode, name } = req.body;

    const game = await Game.findOne({ gameCode });
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.status !== 'waiting') {
      return res.status(400).json({ error: 'Game already started' });
    }

    // Avoid duplicate names
    if (game.players.some((p) => p.name === name)) {
      return res.status(400).json({ error: 'Player name already taken' });
    }

    game.players.push({ name, score: 0 });
    await game.save();

    res.json({
      message: 'Player joined successfully',
      player: name,
      gameId: game._id,
      players: game.players
    });
  } catch (error) {
    console.error('Join game error:', error);
    res.status(500).json({ error: 'Failed to join game' });
  }
};

// Get game details
export const getGame = async (req, res) => {
  try {
    const { code } = req.params;
    const game = await Game.findOne({ gameCode: code }).populate('quiz');

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json({ game });
  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({ error: 'Failed to fetch game' });
  }
};

// ... existing createGame, joinGame, getGame ...

// Host starts the game
export const startGame = async (req, res) => {
  try {
    const { gameCode } = req.body;

    const game = await Game.findOne({ gameCode }).populate('quiz');
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.status !== 'waiting') {
      return res.status(400).json({ error: 'Game already started or ended' });
    }

    // update status
    game.status = 'in-progress';
    game.currentQuestionIndex = 0; // track which question is active
    await game.save();

    const firstQuestion = game.quiz.questions[0];

    // ✅ notify via socket.io
    if (req.app.get('io')) {
      req.app.get('io').to(gameCode).emit('gameStarted', {
        message: 'Game has started!',
        quizTitle: game.quiz.title,
        totalQuestions: game.quiz.questions.length,
        question: {
          question: firstQuestion.question,
          options: firstQuestion.options,
          timeLimit: firstQuestion.timeLimit,
          points: firstQuestion.points
        }
      });
    }

    res.json({
      message: 'Game started successfully',
      game: {
        id: game._id,
        gameCode: game.gameCode,
        status: game.status
      }
    });
  } catch (error) {
    console.error('Start game error:', error);
    res.status(500).json({ error: 'Failed to start game' });
  }
};  

// Host goes to next question
export const nextQuestion = async (req, res) => {
  try {
    const { gameCode } = req.body;

    const game = await Game.findOne({ gameCode }).populate('quiz');
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.status !== 'in-progress') {
      return res.status(400).json({ error: 'Game not in progress' });
    }

    // move index forward
    game.currentQuestionIndex = (game.currentQuestionIndex ?? 0) + 1;

    if (game.currentQuestionIndex >= game.quiz.questions.length) {
      // Game is over
      game.status = 'ended';
      await game.save();

      if (req.app.get('io')) {
        req.app.get('io').to(gameCode).emit('gameEnded', {
          message: 'Game finished!',
        });
      }

      return res.json({ message: 'Game finished', game });
    }

    await game.save();
    const question = game.quiz.questions[game.currentQuestionIndex];

    // broadcast next question
    if (req.app.get('io')) {
      req.app.get('io').to(gameCode).emit('questionUpdate', {
        question: {
          question: question.question,
          options: question.options,
          timeLimit: question.timeLimit,
          points: question.points,
        },
        currentIndex: game.currentQuestionIndex,
      });
    }

    res.json({
      message: 'Next question sent',
      game: {
        id: game._id,
        gameCode: game.gameCode,
        currentIndex: game.currentQuestionIndex,
      },
    });
  } catch (error) {
    console.error('Next question error:', error);
    res.status(500).json({ error: 'Failed to send next question' });
  }
};
