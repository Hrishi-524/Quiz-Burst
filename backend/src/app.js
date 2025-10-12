import express, { json, urlencoded } from 'express';
import cors from 'cors';
import quizRoutes from './routes/quizRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import authRoutes from './routes/authRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(cors({ 
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(json());
app.use(urlencoded({ extended: true })); 

// Routes
app.use('/api/quiz', quizRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'QuizBurst API is running' });
});

// Error handling middleware
app.use(errorHandler);

export default app;