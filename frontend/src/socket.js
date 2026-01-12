// frontend/src/socket.js
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export const socket = io(SOCKET_URL, {
  // ONLY CHANGE: Start with polling instead of websocket
  // This works better on mobile networks
  transports: ['polling', 'websocket'], // Changed from ['websocket', 'polling']
  
  path: '/quizburst/socket.io/', // Your subpath
  
  // Keep everything else the same
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  timeout: 20000,
});

// Debug logging (optional - remove if you don't want logs)
socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('❌ Error:', error.message);
});

export default socket;