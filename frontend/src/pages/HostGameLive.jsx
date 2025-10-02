// src/pages/HostGameLive.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';
let socket;

const HostGameLive = () => {
  const { gameCode } = useParams();
  const [players, setPlayers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [quizTitle, setQuizTitle] = useState('');

  useEffect(() => {
    socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log('Host connected:', socket.id);
      socket.emit('hostJoin', { gameCode });
    });

    socket.on('waitingRoom', (data) => {
      setPlayers(data.players);
      setQuizTitle(data.quizTitle);
    });

    socket.on('playersUpdate', (data) => {
      setPlayers(data.players);
    });

    socket.on('questionUpdate', (data) => {
      setCurrentQuestion(data.question);
      setQuizTitle(data.quizTitle);
    });

    return () => {
      socket.disconnect();
    };
  }, [gameCode]);

  const startGame = () => {
    socket.emit('startGame', { gameCode });
  };

  const nextQuestion = () => {
    socket.emit('nextQuestion', { gameCode });
  };

  return (
    <div style={{ padding: '30px' }}>
      <h1>Host Control Panel</h1>
      <h2>Game Code: {gameCode}</h2>

      <h3>Players in Game:</h3>
      <ul>
        {players.map((p, idx) => (
          <li key={idx}>{p.name}</li>
        ))}
      </ul>

      {!currentQuestion ? (
        <div style={{ marginTop: '20px' }}>
          <button onClick={startGame} style={{ padding: '10px 20px' }}>
            Start Game
          </button>
        </div>
      ) : (
        <div style={{ marginTop: '20px' }}>
          <h2>{quizTitle}</h2>
          <h3>{currentQuestion.question}</h3>
          <button onClick={nextQuestion} style={{ padding: '10px 20px' }}>
            Next Question
          </button>
        </div>
      )}
    </div>
  );
};

export default HostGameLive;
