// src/models/Game.js
import { Schema, model } from 'mongoose';

const playerSchema = new Schema({
  name: { type: String, required: true },
  socketId: { type: String },  // for real-time tracking
  score: { type: Number, default: 0 }
});

const gameSchema = new Schema({
  quiz: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  host: { type: String, default: 'host' }, // can extend later
  gameCode: { type: String, unique: true, required: true },
  players: [playerSchema],
  status: {
    type: String,
    enum: ['waiting', 'in-progress', 'ended'],
    default: 'waiting'
  },
  currentQuestion: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default model('Game', gameSchema);
