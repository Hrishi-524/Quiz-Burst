// frontend/src/pages/HostGameLive.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { socket } from "../socket";
import { getUserInfo } from "../utils/auth";

const HostGameLive = () => {
  const { gameCode } = useParams();
  const navigate = useNavigate();
  const user = getUserInfo();

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showingAnswer, setShowingAnswer] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [gameEnded, setGameEnded] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [totalPlayers, setTotalPlayers] = useState(0);

  const timerRef = useRef(null);
  const hasJoinedRef = useRef(false);

  useEffect(() => {
    // Verify user is logged in
    if (!user) {
      navigate("/login");
      return;
    }

    // Join as host
    if (!hasJoinedRef.current) {
      hasJoinedRef.current = true;
      socket.emit("hostJoin", {
        gameCode,
        user: { id: user.id, username: user.username },
      });
    }

    // Socket event handlers
    const handleNewQuestion = (data) => {
      console.log("New question received:", data);
      setCurrentQuestion(data);
      setQuestionNumber(data.questionNumber);
      setTotalQuestions(data.totalQuestions);
      setTimeRemaining(data.timeLimit);
      setShowingAnswer(false);
      setCorrectAnswer(null);
      setAnsweredCount(0);

      // Start timer
      startTimer(data.timeLimit);
    };

    const handleAnswerReveal = (data) => {
      console.log("Answer revealed:", data);
      setShowingAnswer(true);
      setCorrectAnswer(data.correctAnswer);
      clearTimer();
    };

    const handleLeaderboardUpdate = (data) => {
      console.log("Leaderboard update:", data);
      setLeaderboard(data.leaderboard);
      // Track how many players have answered
      setAnsweredCount((prev) => prev + 1);
    };

    const handleGameEnded = (data) => {
      console.log("Game ended:", data);
      setGameEnded(true);
      setLeaderboard(data.leaderboard);
      clearTimer();
    };

    const handlePlayersUpdate = (data) => {
      setTotalPlayers(data.players.length);
    };

    const handleError = (err) => {
      console.error("Socket error:", err);
      alert(err.message || "An error occurred");
    };

    socket.on("newQuestion", handleNewQuestion);
    socket.on("answerReveal", handleAnswerReveal);
    socket.on("leaderboardUpdate", handleLeaderboardUpdate);
    socket.on("gameEnded", handleGameEnded);
    socket.on("playersUpdate", handlePlayersUpdate);
    socket.on("error", handleError);

    return () => {
      socket.off("newQuestion", handleNewQuestion);
      socket.off("answerReveal", handleAnswerReveal);
      socket.off("leaderboardUpdate", handleLeaderboardUpdate);
      socket.off("gameEnded", handleGameEnded);
      socket.off("playersUpdate", handlePlayersUpdate);
      socket.off("error", handleError);
      clearTimer();
    };
  }, [gameCode, user, navigate]);

  const startTimer = (duration) => {
    clearTimer();
    let timeLeft = duration;
    setTimeRemaining(timeLeft);

    timerRef.current = setInterval(() => {
      timeLeft -= 1;
      setTimeRemaining(timeLeft);

      if (timeLeft <= 0) {
        clearTimer();
        // Emit time up event to trigger answer reveal
        socket.emit("timeUp", { gameCode });
      }
    }, 1000);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleManualNext = () => {
    if (showingAnswer) {
      socket.emit("nextQuestion", { gameCode });
    }
  };

  const handleEndGame = () => {
    if (window.confirm("Are you sure you want to end the game?")) {
      socket.emit("endGame", { gameCode });
    }
  };

  const handleCloseGame = () => {
    socket.emit("closeLobby", { gameCode });
    navigate("/quizbank");
  };

  if (gameEnded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 flex items-center justify-center">
        <div className="max-w-4xl w-full bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              🎉 Quiz Complete!
            </h1>
            <p className="text-slate-400">Final Results</p>
          </div>

          <div className="space-y-3 mb-8">
            {leaderboard.map((player, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-4 rounded-xl ${
                  idx === 0
                    ? "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/50"
                    : idx === 1
                    ? "bg-gradient-to-r from-slate-500/20 to-gray-500/20 border border-slate-500/50"
                    : idx === 2
                    ? "bg-gradient-to-r from-orange-500/20 to-amber-700/20 border border-orange-500/50"
                    : "bg-slate-800/50 border border-slate-700"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-white w-8">
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${player.rank}`}
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-white">
                      {player.name}
                    </p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-cyan-400">
                  {player.score}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleCloseGame}
            className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg transition-all"
          >
            Close Game
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2">
              <p className="text-slate-400 text-sm">Game Code</p>
              <p className="text-xl font-mono font-bold text-cyan-400">
                {gameCode}
              </p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2">
              <p className="text-slate-400 text-sm">Question</p>
              <p className="text-xl font-bold text-white">
                {questionNumber}/{totalQuestions}
              </p>
            </div>
          </div>

          <button
            onClick={handleEndGame}
            className="bg-gradient-to-r from-red-500 to-rose-600 text-white py-2 px-6 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            End Game
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Question Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timer */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Time Remaining</h3>
                <div
                  className={`text-5xl font-bold ${
                    timeRemaining <= 5 ? "text-red-400 animate-pulse" : "text-cyan-400"
                  }`}
                >
                  {timeRemaining}s
                </div>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    timeRemaining <= 5
                      ? "bg-gradient-to-r from-red-500 to-rose-600"
                      : "bg-gradient-to-r from-cyan-500 to-blue-600"
                  }`}
                  style={{
                    width: `${(timeRemaining / (currentQuestion.timeLimit || 30)) * 100}%`,
                  }}
                ></div>
              </div>
              <p className="text-slate-400 text-sm mt-2 text-center">
                Answered: {answeredCount}/{totalPlayers} players
              </p>
            </div>

            {/* Question Display */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-white mb-8">
                {currentQuestion.question}
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {currentQuestion.options.map((option, idx) => (
                  <div
                    key={idx}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      showingAnswer && correctAnswer === idx
                        ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500"
                        : "bg-slate-800/50 border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                          showingAnswer && correctAnswer === idx
                            ? "bg-green-500 text-white"
                            : "bg-slate-700 text-slate-300"
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <p className="text-white text-lg font-semibold flex-1">
                        {option}
                      </p>
                      {showingAnswer && correctAnswer === idx && (
                        <span className="text-2xl">✓</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {showingAnswer && (
                <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/50 rounded-xl">
                  <p className="text-cyan-400 font-semibold">
                    Correct Answer: {String.fromCharCode(65 + correctAnswer)}
                  </p>
                </div>
              )}
            </div>

            {/* Host Controls */}
            {showingAnswer && (
              <button
                onClick={handleManualNext}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg transition-all"
              >
                Next Question →
              </button>
            )}
          </div>

          {/* Leaderboard Sidebar */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Live Leaderboard
            </h3>
            <div className="space-y-2">
              {leaderboard.length === 0 ? (
                <p className="text-slate-400 text-center py-8">
                  No scores yet
                </p>
              ) : (
                leaderboard.slice(0, 10).map((player, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 font-bold w-6">
                        #{player.rank}
                      </span>
                      <span className="text-white font-semibold">
                        {player.name}
                      </span>
                    </div>
                    <span className="text-cyan-400 font-bold">
                      {player.score}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostGameLive;