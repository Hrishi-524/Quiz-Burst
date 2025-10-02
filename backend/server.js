import { createServer } from 'http';
import app from '../backend/src/app.js';
import { Server } from 'socket.io';
import connectDB from './src/config/database.js';
import setupSocketHandlers from './src/socket/index.js';

import 'dotenv/config';

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = createServer(app);

// Setup Socket.io
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// after setupSocketHandlers(io)
app.set('io', io);

// Connect to MongoDB
connectDB();

// Setup socket handlers
setupSocketHandlers(io);

// // Make io accessible to routes
// set('io', io);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});