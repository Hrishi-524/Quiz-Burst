// backend/src/app.js
import express, { json, urlencoded } from 'express';
import cors from 'cors';
import quizRoutes from './routes/quizRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import authRoutes from './routes/authRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// Middleware - FIX CORS
app.use(cors({ 
  origin: [
    "http://localhost:5173",  // Fixed: http not https, correct port
    "http://localhost:5174",
    "https://quiz-burst.vercel.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(json());
app.use(urlencoded({ extended: true })); 

// Routes
app.use('/api/quiz', quizRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/certificate', certificateRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'QuizBurst API is running' });
});

// Error handling middleware
app.use(errorHandler);

export default app;