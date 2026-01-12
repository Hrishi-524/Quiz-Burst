// backend/server.js
import { createServer } from 'http';
import app from '../backend/src/app.js';
import { Server } from 'socket.io';
import connectDB from './src/config/database.js';
import setupSocketHandlers from './src/socket/index.js';
import 'dotenv/config';

const PORT = process.env.PORT || 3002;

// Create HTTP server 
const server = createServer(app);

// Setup Socket.io with mobile-friendly configuration
const io = new Server(server, {
    cors: {
        origin: [
            "https://quiz-burst.vercel.app",
            "http://localhost:5173",
            "http://localhost:5174"
        ],
        methods: ["GET", "POST"],
        credentials: true
    },
    
    // CRITICAL: Allow both transports
    transports: ['websocket', 'polling'],
    
    // Allow upgrades from polling to websocket
    allowUpgrades: true,
    
    // Increase ping timeout for mobile connections
    pingTimeout: 60000,
    pingInterval: 25000,
    
    // Connection state recovery (helps with mobile network switches)
    connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
        skipMiddlewares: true,
    },
    
    // Explicit path
    path: "/socket.io/",
    
    // Increase max HTTP buffer size for slower connections
    maxHttpBufferSize: 1e8,
    
    // Cookie settings
    cookie: false, // Disable cookies if not needed
});

// Add connection debugging
io.engine.on("connection_error", (err) => {
  console.error("Connection error:", err);
});

// Connect to MongoDB
connectDB();

// Setup socket handlers
setupSocketHandlers(io);

// Set io instance for routes
app.set('io', io);

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Socket.IO transports:', ['websocket', 'polling']);
});