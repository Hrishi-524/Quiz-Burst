import { Schema, model } from 'mongoose';

const playerSchema = new Schema({
  id: String,
  name: String,
  score: {
    type: Number,
    default: 0
  },
  answers: [{
    questionIndex: Number,
    answer: Number,
    isCorrect: Boolean,
    points: Number,
    timeSpent: Number
  }],
  isActive: {
    type: Boolean,
    default: true
  }
});

const gameSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  quizId: {
    type: Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  hostId: {
    type: String,
    required: true
  },
  players: [playerSchema],
  currentQuestion: {
    type: Number,
    default: -1
  },
  status: {
    type: String,
    enum: ['waiting', 'started', 'question', 'answer', 'leaderboard', 'finished'],
    default: 'waiting'
  },
  startedAt: Date,
  finishedAt: Date,
  settings: {
    shuffleQuestions: {
      type: Boolean,
      default: false
    },
    shuffleOptions: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Auto-delete games after 24 hours
gameSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export default model('Game', gameSchema);