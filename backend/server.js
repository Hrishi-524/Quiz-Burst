import { createServer } from 'http';
import app from '../backend/src/app.js';
import { Server } from 'socket.io';
import connectDB from './src/config/database.js';
import setupSocketHandlers from './src/socket/index.js';

import 'dotenv/config';

const PORT = process.env.PORT || 3002;

// Create HTTP server 
const server = createServer(app);

// Setup Socket.io
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

// Connect to MongoDB
connectDB();

// Setup socket handlers
setupSocketHandlers(io);

// after setupSocketHandlers(io)
app.set('io', io);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});