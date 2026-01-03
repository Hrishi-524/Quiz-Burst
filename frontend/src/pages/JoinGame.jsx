import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const JoinGame = () => {
  const [playerName, setPlayerName] = useState('');
  const [gameCode, setGameCode] = useState('');
  const navigate = useNavigate();

  const handleJoinGame = async () => {
    if (!playerName || !gameCode) return alert('Enter your name and game code');

    try {
      const res = await axios.post('/game/join', {
        name: playerName,
        gameCode
      });

      if (res.data.player) {
        // Redirect to play page
        navigate(`/play-game/${gameCode}`, { state: { playerName } });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to join game. Check game code.');
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '400px', margin: '50px auto' }}>
      <h1>Join a Game</h1>

      <div style={{ marginTop: '20px' }}>
        <label>Player Name:</label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          style={{ width: '100%', padding: '10px', marginTop: '5px' }}
        />
      </div>

      <div style={{ marginTop: '20px' }}>
        <label>Game Code:</label>
        <input
          type="text"
          value={gameCode}
          onChange={(e) => setGameCode(e.target.value)}
          placeholder="Enter game code"
          style={{ width: '100%', padding: '10px', marginTop: '5px' }}
        />
      </div>

      <button
        onClick={handleJoinGame}
        style={{ marginTop: '30px', width: '100%', padding: '12px', fontSize: '16px' }}
      >
        Join Game
      </button>
    </div>
  );
};

export default JoinGame;
