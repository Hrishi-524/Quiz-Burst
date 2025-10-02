// Simple in-memory storage for active games
const games = {}; 
// Structure: { GAMECODE: { quiz, hostId, players: [], currentQ: -1 } }

export default games;
