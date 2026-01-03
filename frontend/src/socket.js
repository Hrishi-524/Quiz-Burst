// frontend/src/socket.js
import { io } from "socket.io-client";

export const socket = io("https://metaterminal.duckdns.org", {
    path: "/socket.io/",  // Add this
    withCredentials: true,
    transports: ["websocket", "polling"], // Try both, prefer websocket
});

socket.on("connect", () => console.log("✅ Socket connected:", socket.id));
socket.on("connect_error", (err) => console.warn("Socket connect_error:", err));