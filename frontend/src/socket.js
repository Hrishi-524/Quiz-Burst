// frontend/src/socket.js
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3002';

export const socket = io(SOCKET_URL, {
  // CRITICAL for mobile devices
  transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
  
  // Increase timeouts for slower mobile connections
  timeout: 20000,
  
  // Reconnection settings
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  
  // Force new connection (helps with mobile switching networks)
  forceNew: false,
  
  // Explicitly set path
  path: '/socket.io/',
  
  // Enable auto-connect
  autoConnect: true,
  
  // Additional mobile-friendly options
  upgrade: true,
  rememberUpgrade: true,
  
  // CORS credentials
  withCredentials: true,
});

// Debug logging
socket.on('connect', () => {
  console.log('✅ Socket connected:', socket.id);
  console.log('Transport:', socket.io.engine.transport.name);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
  console.log('Attempted transport:', socket.io.engine.transport.name);
});

socket.on('disconnect', (reason) => {
  console.warn('⚠️ Socket disconnected:', reason);
});

// Monitor transport upgrades
socket.io.engine.on('upgrade', (transport) => {
  console.log('🔄 Transport upgraded to:', transport.name);
});

export default socket;