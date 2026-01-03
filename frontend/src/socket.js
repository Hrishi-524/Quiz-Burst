// frontend/src/socket.js
import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_SOCKET_URL, {
    withCredentials: true,
    transports: ["websocket"], // prefer websocket
});

// optional debug
socket.on("connect", () => console.log("✅ Socket connected:", socket.id));
socket.on("connect_error", (err) => console.warn("Socket connect_error:", err));
