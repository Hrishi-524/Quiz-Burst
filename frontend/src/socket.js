// frontend/src/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3002';
console.log('Socket URL:', SOCKET_URL); // Debug log

export const socket = io(SOCKET_URL, {
  path: "/socket.io/",
  transports: ["polling", "websocket"],
});

socket.on("connect", () => console.log("✅ Socket connected:", socket.id));
socket.on("connect_error", (err) => console.warn("Socket connect_error:", err));