import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import io from "socket.io-client";
import {
  Users,
  Clock,
  Trophy,
  Zap,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Crown,
  Target,
  TrendingUp,
  Award,
  Sparkles
} from "lucide-react";

const SOCKET_URL = "http://localhost:5000";
let socket;

const PlayGame = () => {
  const { gameCode } = useParams();
  const location = useLocation();
  const [playerName, setPlayerName] = useState(location.state?.playerName || "");
  const [joined, setJoined] = useState(false);
  const [players, setPlayers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    socket = io(SOCKET_URL);

    socket.on("connect", () => {
      console.log("Player connected:", socket.id);
      if (location.state?.playerName) {
        socket.emit("joinGame", { gameCode, name: location.state.playerName });
        setJoined(true);
      }
    });

    socket.on("playersUpdate", (data) => {
      setPlayers(data.players);
    });

    socket.on("questionUpdate", (data) => {
      setCurrentQuestion(data.question);
      setQuestionNumber((prev) => prev + 1);
      setShowAnswer(false);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(data.question?.timeLimit || 30);
    });

    socket.on("showAnswer", (data) => {
      setShowAnswer(true);
      if (data.correctIndex === selectedOption) {
        setScore((prev) => prev + (currentQuestion?.points || 0));
      }
    });

    socket.on("gameEnded", () => {
      setCurrentQuestion(null);
    });

    return () => {
      socket.disconnect();
    };
  }, [gameCode, location.state?.playerName, selectedOption, currentQuestion]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && !showAnswer) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, showAnswer]);

  const joinGame = () => {
    if (!playerName.trim()) return;
    socket.emit("joinGame", { gameCode, name: playerName });
    setJoined(true);
  };

  const submitAnswer = (index) => {
    if (showAnswer || isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    socket.emit("submitAnswer", { gameCode, answerIndex: index });
  };

  const getOptionStyle = (idx) => {
    if (!showAnswer && selectedOption !== idx) return "default";
    if (showAnswer) {
      if (idx === currentQuestion?.correctAnswer) return "correct";
      if (idx === selectedOption && idx !== currentQuestion?.correctAnswer) return "wrong";
    }
    if (selectedOption === idx) return "selected";
    return "default";
  };

  const optionStyles = {
    default: "bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800/70",
    selected: "bg-cyan-500/20 border-cyan-500 ring-2 ring-cyan-500/50",
    correct: "bg-emerald-500/20 border-emerald-500 ring-2 ring-emerald-500/50",
    wrong: "bg-red-500/20 border-red-500 ring-2 ring-red-500/50"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[120px]"></div>
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none"></div>

      <div className="relative z-10 container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-8 h-8 text-cyan-400" strokeWidth={2.5} />
            <h1 className="text-4xl md:text-5xl font-bold text-white">QuizBurst</h1>
          </div>
          <div className="inline-flex items-center gap-2 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-xl px-6 py-3">
            <Target className="w-5 h-5 text-cyan-400" />
            <span className="text-slate-400">Game Code:</span>
            <span className="text-white font-bold text-lg tracking-[0.2em]">{gameCode}</span>
          </div>
        </motion.div>

        {/* Join Screen */}
        {!joined && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-xl">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Join the Game</h2>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && joinGame()}
                  className="w-full p-4 rounded-xl border border-slate-700 bg-slate-800/50 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                />
                <motion.button
                  onClick={joinGame}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all"
                >
                  Join Game
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Game Screen */}
        {joined && (
          <div className="space-y-6">
            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800 p-4 flex items-center gap-3">
                <div className="bg-cyan-500/20 p-2 rounded-lg">
                  <Users className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Players</div>
                  <div className="text-white font-bold text-xl">{players.length}</div>
                </div>
              </div>

              <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800 p-4 flex items-center gap-3">
                <div className="bg-amber-500/20 p-2 rounded-lg">
                  <Trophy className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Your Score</div>
                  <div className="text-white font-bold text-xl">{score}</div>
                </div>
              </div>

              <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800 p-4 flex items-center gap-3">
                <div className="bg-purple-500/20 p-2 rounded-lg">
                  <Target className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Question</div>
                  <div className="text-white font-bold text-xl">{questionNumber}</div>
                </div>
              </div>
            </motion.div>

            {/* Main Content */}
            {currentQuestion ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl overflow-hidden"
              >
                {/* Timer Bar */}
                {timeLeft !== null && !showAnswer && (
                  <div className="h-2 bg-slate-800">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
                      initial={{ width: "100%" }}
                      animate={{ width: `${(timeLeft / (currentQuestion?.timeLimit || 30)) * 100}%` }}
                      transition={{ duration: 1, ease: "linear" }}
                    />
                  </div>
                )}

                <div className="p-8">
                  {/* Question Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-lg">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-slate-400 font-medium">
                        Question {questionNumber}
                      </span>
                    </div>
                    {timeLeft !== null && !showAnswer && (
                      <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-lg">
                        <Clock className="w-5 h-5 text-cyan-400" />
                        <span className="text-white font-bold text-lg">{timeLeft}s</span>
                      </div>
                    )}
                  </div>

                  {/* Question Text */}
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 leading-relaxed">
                    {currentQuestion.question}
                  </h2>

                  {/* Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQuestion.options.map((option, idx) => {
                      const style = getOptionStyle(idx);
                      const isCorrect = showAnswer && idx === currentQuestion.correctAnswer;
                      const isWrong = showAnswer && idx === selectedOption && idx !== currentQuestion.correctAnswer;

                      return (
                        <motion.button
                          key={idx}
                          onClick={() => submitAnswer(idx)}
                          disabled={showAnswer || isAnswered}
                          whileHover={!showAnswer && !isAnswered ? { scale: 1.02, x: 4 } : {}}
                          whileTap={!showAnswer && !isAnswered ? { scale: 0.98 } : {}}
                          className={`relative p-5 rounded-xl border-2 transition-all text-left ${optionStyles[style]} ${
                            showAnswer || isAnswered ? "cursor-not-allowed" : "cursor-pointer"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-bold ${
                              style === "correct" ? "bg-emerald-500 text-white" :
                              style === "wrong" ? "bg-red-500 text-white" :
                              style === "selected" ? "bg-cyan-500 text-white" :
                              "bg-slate-700 text-slate-400"
                            }`}>
                              {String.fromCharCode(65 + idx)}
                            </div>
                            <span className="text-white font-medium flex-1">{option}</span>
                            {isCorrect && (
                              <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                            )}
                            {isWrong && (
                              <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Answer Feedback */}
                  <AnimatePresence>
                    {showAnswer && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-6"
                      >
                        {selectedOption === currentQuestion.correctAnswer ? (
                          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3">
                            <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                            <div>
                              <div className="text-emerald-400 font-semibold">Correct!</div>
                              <div className="text-slate-300 text-sm">+{currentQuestion.points || 10} points</div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
                            <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                            <div>
                              <div className="text-red-400 font-semibold">Incorrect</div>
                              <div className="text-slate-300 text-sm">
                                Correct answer: {String.fromCharCode(65 + currentQuestion.correctAnswer)}
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl p-12 text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 mb-6">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Waiting for Host...
                </h2>
                <p className="text-slate-400 mb-8">
                  The game will begin shortly. Get ready!
                </p>

                {/* Players List */}
                <div className="max-w-md mx-auto">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-cyan-400" />
                    <span className="text-slate-400 font-medium">Players in Lobby:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {players.map((player, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 flex items-center gap-2"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                          {player.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-white text-sm font-medium truncate">{player.name}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayGame;