import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";
let socket;

const HostGameLive = () => {
  const { id: gameCode } = useParams();
  const [players, setPlayers] = useState([]);
  const [quizTitle, setQuizTitle] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [stage, setStage] = useState("lobby"); // "lobby" | "question" | "leaderboard"

  useEffect(() => {
    socket = io(SOCKET_URL);

    socket.on("connect", () => {
      console.log("Host connected:", socket.id);
      socket.emit("hostJoin", { gameCode });
    });

    socket.on("waitingRoom", (data) => {
      setPlayers(data.players);
      setQuizTitle(data.quizTitle);
    });

    socket.on("playersUpdate", (data) => {
      setPlayers(data.players);
    });

    socket.on("questionUpdate", (data) => {
      setCurrentQuestion(data.question);
      setStage("question");
    });

    socket.on("showLeaderboard", (data) => {
      setStage("leaderboard");
    });

    return () => {
      socket.disconnect();
    };
  }, [gameCode]);

  const startGame = () => {
    socket.emit("startGame", { gameCode });
    setStage("question");
  };

  const nextQuestion = () => {
    socket.emit("nextQuestion", { gameCode });
  };

  const endGame = () => {
    socket.emit("endGame", { gameCode });
    setStage("leaderboard");
  };

  return (
    <div className="p-6 grid grid-cols-4 gap-6">
      {/* Left: Player List */}
      <div className="col-span-1 bg-gray-100 rounded-xl p-4 shadow">
        <h2 className="text-lg font-bold mb-2">
          Players ({players.length})
        </h2>
        <ul className="space-y-1 max-h-80 overflow-y-auto">
          {players.map((p, idx) => (
            <li
              key={idx}
              className="bg-white p-2 rounded shadow-sm border"
            >
              {p.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Center: Game Panel */}
      <div className="col-span-2 bg-white rounded-xl p-6 shadow flex flex-col items-center justify-center">
        {stage === "lobby" && (
          <>
            <h1 className="text-2xl font-bold">{quizTitle}</h1>
            <p className="mt-4 text-gray-600">
              Waiting for players to join...
            </p>
            <h2 className="mt-6 text-xl font-mono bg-gray-200 px-4 py-2 rounded">
              Game Code: {gameCode}
            </h2>
          </>
        )}

        {stage === "question" && currentQuestion && (
          <>
            <h2 className="text-xl font-bold mb-4">
              {currentQuestion.question}
            </h2>
            <ul className="space-y-2">
              {currentQuestion.options.map((opt, idx) => (
                <li
                  key={idx}
                  className="px-4 py-2 border rounded bg-gray-50"
                >
                  {opt}
                </li>
              ))}
            </ul>
          </>
        )}

        {stage === "leaderboard" && (
          <h2 className="text-xl font-bold">Leaderboard coming here...</h2>
        )}
      </div>

      {/* Right: Controls */}
      <div className="col-span-1 bg-gray-100 rounded-xl p-4 shadow flex flex-col gap-3">
        {stage === "lobby" && (
          <button
            onClick={startGame}
            className="bg-green-500 text-white py-2 px-4 rounded"
          >
            Start Game
          </button>
        )}
        {stage === "question" && (
          <button
            onClick={nextQuestion}
            className="bg-blue-500 text-white py-2 px-4 rounded"
          >
            Next Question
          </button>
        )}
        <button
          onClick={endGame}
          className="bg-red-500 text-white py-2 px-4 rounded"
        >
          End Game
        </button>
      </div>
    </div>
  );
};

export default HostGameLive;
