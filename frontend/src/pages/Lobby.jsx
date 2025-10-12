// frontend/src/pages/Lobby.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { socket } from "../socket";
import { getUserInfo } from "../utils/auth";

const Lobby = () => {
  const { gameCode: gameCodeParam } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUserInfo();

  const navState = location.state || {};
  const playerNameFromState = navState.playerName || null; // Not navState.lobbyInfo.playerName
  const isLobbyCreatorFromState = navState.isLobbyCreator || false;
  const lobbyInfoFromState = navState.lobbyInfo || null;

  const [players, setPlayers] = useState([]);
  const [quizTitle, setQuizTitle] = useState("");
  const [currentGameCode, setCurrentGameCode] = useState(
    gameCodeParam || lobbyInfoFromState?.gameCode || null
  );
  const [gameStatus, setGameStatus] = useState("waiting");
  const [isLobbyOwner, setIsLobbyOwner] = useState(false);
  const [error, setError] = useState(null);

  const hasJoinedRef = useRef(false);

  useEffect(() => {
    // Set up event handlers
    const handleLobbyInfo = (data) => {
      console.log("lobbyInfo:", data);
      setPlayers(data.players || []);
      setQuizTitle(data.quizTitle || "");
      setCurrentGameCode(data.gameCode);
      setGameStatus(data.gameStatus || "waiting");
      setIsLobbyOwner(Boolean(data.isLobbyOwner));
    };

    const handlePlayersUpdate = (data) => {
      console.log("playersUpdate:", data.players.length, "players");
      setPlayers(data.players || []);
    };

    const handleJoinSuccess = (data) => {
      console.log("joinSuccess in Lobby:", data);
      setQuizTitle(data.quizTitle || "");
      setPlayers(data.players || []);
      setCurrentGameCode(data.gameCode);
    };

    const handleGameStarted = ({ gameCode }) => {
      console.log("Game starting!");
      if (isLobbyOwner) {
        navigate(`/host/game/${gameCode}`, { state: { isLobbyOwner: true } });
      } else {
        navigate(`/play/game/${gameCode}`, { state: { isLobbyOwner: false, playerName } });
      }
    };

    const handleLobbyClosed = () => {
      alert("Host closed the lobby");
      navigate("/quizbank");
    };

    const handleError = (err) => {
      console.error("Socket error:", err);
      setError(err?.message || "An error occurred");
    };

    // Attach listeners
    socket.on("lobbyInfo", handleLobbyInfo);
    socket.on("playersUpdate", handlePlayersUpdate);
    socket.on("joinSuccess", handleJoinSuccess);
    socket.on("gameStarted", handleGameStarted);
    socket.on("lobbyClosed", handleLobbyClosed);
    socket.on("error", handleError);

    // Join logic - run ONCE
    if (!hasJoinedRef.current) {
      hasJoinedRef.current = true;

      // Case A: Host just created lobby (from QuizBank)
      if (isLobbyCreatorFromState && lobbyInfoFromState) {
        console.log(
          "Host arrived with lobbyInfo:",
          lobbyInfoFromState.gameCode
        );
        setPlayers(lobbyInfoFromState.players || []);
        setQuizTitle(lobbyInfoFromState.quizTitle || "");
        setCurrentGameCode(lobbyInfoFromState.gameCode);
        setIsLobbyOwner(true);
        setGameStatus("waiting");

        // Join the socket room (server-side already created game)
        socket.emit("hostJoin", {
          gameCode: lobbyInfoFromState.gameCode,
          user: user ? { id: user.id, username: user.username } : null,
        });
      }
      // Case B: Player joining from Home
      else if (playerNameFromState && gameCodeParam) {
        console.log(
          "Player joining:",
          playerNameFromState,
          "Code:",
          gameCodeParam
        );
        // Set initial state from navigation
        if (navState.initialPlayers) {
          setPlayers(navState.initialPlayers);
        }
        if (navState.quizTitle) {
          setQuizTitle(navState.quizTitle);
        }
      }
      // Case C: Host refresh/direct URL
      else if (user && gameCodeParam) {
        console.log("Host rejoining:", gameCodeParam);
        socket.emit("hostJoin", {
          gameCode: gameCodeParam,
          user: { id: user.id, username: user.username },
        });
      }
      // Invalid entry
      else {
        console.warn("Invalid lobby entry - redirecting");
        navigate("/", { replace: true });
      }
    }

    // Cleanup
    return () => {
      socket.off("lobbyInfo", handleLobbyInfo);
      socket.off("playersUpdate", handlePlayersUpdate);
      socket.off("joinSuccess", handleJoinSuccess);
      socket.off("gameStarted", handleGameStarted);
      socket.off("lobbyClosed", handleLobbyClosed);
      socket.off("error", handleError);
    };
  }, []); // EMPTY deps - run once

  const handleStartGame = () => {
    if (!currentGameCode || !isLobbyOwner) return;
    if (players.length === 0) {
      setError("At least 1 player is required to start");
      return;
    }
    socket.emit("startGame", { gameCode: currentGameCode, hostId: user?.id });
  };

  const handleCloseLobby = () => {
    if (!currentGameCode || !isLobbyOwner) return;
    socket.emit("closeLobby", { gameCode: currentGameCode });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {quizTitle || "Loading Quiz..."}
          </h1>
          <div className="inline-block bg-slate-800 border border-slate-700 rounded-xl px-6 py-3 mt-4">
            <p className="text-slate-400 text-sm">Game Code</p>
            <p className="text-3xl font-mono font-bold text-cyan-400">
              {currentGameCode || "..."}
            </p>
          </div>
          {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Players ({players.length})
            </h2>
            {players.length === 0 ? (
              <p className="text-slate-400 text-center py-8">
                Waiting for players to join...
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {players.map((player, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{player.name}</p>
                      <p className="text-slate-400 text-sm">
                        Score: {player.score}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
            {isLobbyOwner ? (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white mb-4">
                  Host Controls
                </h2>
                <button
                  onClick={handleStartGame}
                  disabled={gameStatus !== "waiting" || players.length === 0}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Game
                </button>
                <button
                  onClick={handleCloseLobby}
                  className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Close Lobby
                </button>
                <div className="mt-6 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <p className="text-slate-400 text-sm">
                    Share the game code with players so they can join
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <h3 className="text-xl font-bold text-white mb-2">
                  Waiting for Host
                </h3>
                <p className="text-slate-400 text-sm">
                  The game will start soon...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
