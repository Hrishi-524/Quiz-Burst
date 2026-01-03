import express, { json, urlencoded } from 'express';
import cors from 'cors';
import quizRoutes from './routes/quizRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import authRoutes from './routes/authRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// Middleware
const io = new Server(server, {
    cors: {
        origin: [
            "https://quiz-burst.vercel.app",  // No trailing slash
            "http://localhost:5173",
            "http://localhost:5174"
        ],
        methods: ["GET", "POST"],
        credentials: true,
    },
    path: "/socket.io/"  // Explicit path
});
app.use(json());
app.use(urlencoded({ extended: true })); 

// Routes
app.use('/api/quiz', quizRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/certificate', certificateRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'QuizBurst API is running' });
});

// Error handling middleware
app.use(errorHandler);

export default app;