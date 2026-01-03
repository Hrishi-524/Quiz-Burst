// frontend/src/pages/PlayerGameLive.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { socket } from "../socket";
import { createDownloadLink, createCertficate } from "../api/certificate";

const PlayerGameLive = () => {
  const { gameCode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const playerName = location.state?.playerName;

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [finalLeaderboard, setFinalLeaderboard] = useState([]);
  const [questionSummaries, setQuestionSummaries] = useState([]);

  const timerRef = useRef(null);
  const hasJoinedRef = useRef(false);

  useEffect(() => {
    // Verify player has a name
    if (!playerName) {
      navigate(`/quiz/lobby/${gameCode}`);
      return;
    }

    // Socket event handlers
    const handleNewQuestion = (data) => {
      console.log("New question received:", data);
      setCurrentQuestion(data);
      setQuestionNumber(data.questionNumber);
      setTotalQuestions(data.totalQuestions);
      setTimeRemaining(data.timeLimit);
      setSelectedAnswer(null);
      setHasAnswered(false);
      setShowResult(false);
      setIsCorrect(false);
      setCorrectAnswer(null);

      // Start timer
      startTimer(data.timeLimit);
    };

    const handleAnswerResult = (data) => {
      console.log("Answer result:", data);
      setIsCorrect(data.isCorrect);
      setCorrectAnswer(data.correctAnswer);
      setCurrentScore(data.score);
      // Don't show result yet - wait for answerReveal
    };

    const handleAnswerReveal = (data) => {
      console.log("Answer revealed:", data);
      setShowResult(true);
      setCorrectAnswer(data.correctAnswer);
      clearTimer();
    };

    const handleGameEnded = (data) => {
      console.log("Game ended:", data);
      setGameEnded(true);
      setFinalLeaderboard(data.leaderboard);
      setQuestionSummaries(data.questionSummaries || []);
      clearTimer();
    };

    const handleError = (err) => {
      console.error("Socket error:", err);
      alert(err.message || "An error occurred");
    };

    socket.on("newQuestion", handleNewQuestion);
    socket.on("answerResult", handleAnswerResult);
    socket.on("answerReveal", handleAnswerReveal);
    socket.on("gameEnded", handleGameEnded);
    socket.on("error", handleError);

    return () => {
      socket.off("newQuestion", handleNewQuestion);
      socket.off("answerResult", handleAnswerResult);
      socket.off("answerReveal", handleAnswerReveal);
      socket.off("gameEnded", handleGameEnded);
      socket.off("error", handleError);
      clearTimer();
    };
  }, [gameCode, playerName, navigate]);

  const startTimer = (duration) => {
    clearTimer();
    let timeLeft = duration;
    setTimeRemaining(timeLeft);

    timerRef.current = setInterval(() => {
      timeLeft -= 1;
      setTimeRemaining(timeLeft);

      if (timeLeft <= 0) {
        clearTimer();
        // Auto-submit if player hasn't answered
        if (!hasAnswered && selectedAnswer !== null) {
          handleSubmitAnswer(selectedAnswer);
        }
        // Emit timeUp event to trigger next question
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

  const handleAnswerSelect = (answerIndex) => {
    if (hasAnswered || showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = (answerIndex = selectedAnswer) => {
    if (hasAnswered || showResult || answerIndex === null) return;

    setHasAnswered(true);
    socket.emit("submitAnswer", { gameCode, answerIndex });
    console.log("Answer submitted:", answerIndex);
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleDownloadCertificate = async () => {
    try {
      const playerPosition = finalLeaderboard.find(p => p.name === playerName);
      if (!playerPosition) return;

      const metadata = {
        playerName,
        score: playerPosition.score,
        totalQuestions: totalQuestions,
        gameCode,
        rank: playerPosition.rank,
        date: new Date().toLocaleDateString()
      }

      const response = await createCertficate(metadata) 

      createDownloadLink(metadata, response)
      
    } catch (error) {
      console.error('Certificate download error:', error);
      alert('Failed to download certificate: ' + (error.response?.data?.error || error.message));
    }
  };

  if (gameEnded) {
    // Find player's position
    const playerPosition = finalLeaderboard.find(
      (p) => p.name === playerName
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 flex items-center justify-center">
        <div className="max-w-5xl w-full bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              🎉 Quiz Complete!
            </h1>
            {playerPosition && (
              <div className="mt-4">
                <p className="text-slate-400 text-lg">Your Final Position</p>
                <p className="text-6xl font-bold text-cyan-400 my-4">
                  #{playerPosition.rank}
                </p>
                <p className="text-2xl font-semibold text-white">
                  {playerPosition.score} points
                </p>
              </div>
            )}
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              Final Leaderboard
            </h3>
            <div className="space-y-2">
              {finalLeaderboard.map((player, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    player.name === playerName
                      ? "bg-cyan-500/20 border border-cyan-500"
                      : "bg-slate-700/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${player.rank}`}
                    </span>
                    <span
                      className={`font-semibold ${
                        player.name === playerName ? "text-cyan-400" : "text-white"
                      }`}
                    >
                      {player.name}
                    </span>
                  </div>
                  <span className="text-cyan-400 font-bold">
                    {player.score}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {questionSummaries.length > 0 && (
            <div className="mt-8">
              <h3 className="text-2xl font-bold text-white mb-4">Review Questions</h3>
              <div className="space-y-4">
                {questionSummaries.map((q) => (
                  <div key={q.questionNumber} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <p className="text-sm text-slate-400">Question {q.questionNumber}</p>
                    <p className="text-white font-semibold">{q.question}</p>
                    <p className="text-cyan-400 mt-2">Correct: {String.fromCharCode(65 + (q.correctAnswer ?? 0))}</p>
                    {q.explanation && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-slate-300">View Explanation</summary>
                        <p className="text-slate-300 mt-2 whitespace-pre-wrap">{q.explanation}</p>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleDownloadCertificate}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              📄 Download Certificate
            </button>
            <button
              onClick={handleBackToHome}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg transition-all"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-white text-xl">Waiting for game to start...</p>
          <p className="text-slate-400 mt-2">Player: {playerName}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2">
            <p className="text-slate-400 text-sm">Player</p>
            <p className="text-lg font-bold text-white">{playerName}</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2">
            <p className="text-slate-400 text-sm">Score</p>
            <p className="text-lg font-bold text-cyan-400">{currentScore}</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2">
            <p className="text-slate-400 text-sm">Question</p>
            <p className="text-lg font-bold text-white">
              {questionNumber}/{totalQuestions}
            </p>
          </div>
        </div>

        {/* Timer */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 mb-6">
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
        </div>

        {/* Question */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 mb-6">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            {currentQuestion.question}
          </h2>

          {/* Multimedia Content */}
          {currentQuestion.media && currentQuestion.media.type !== 'none' && currentQuestion.media.url && (
            <div className="mb-8">
              {currentQuestion.media.type === 'image' && (
                <img
                src={currentQuestion.media.url}
                alt="Question media"
                className="w-full max-w-2xl max-h-[70vh] object-contain rounded-xl border border-slate-700 mx-auto"
                />

              )}
              {currentQuestion.media.type === 'video' && (
                <video 
                  src={currentQuestion.media.url} 
                  controls 
                  className="w-full max-w-2xl h-64 object-cover rounded-xl border border-slate-700 mx-auto"
                />
              )}
              {currentQuestion.media.type === 'audio' && (
                <div className="max-w-2xl mx-auto p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                  <audio src={currentQuestion.media.url} controls className="w-full" />
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswerSelect(idx)}
                disabled={hasAnswered || showResult}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  showResult && correctAnswer === idx
                    ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500"
                    : showResult && selectedAnswer === idx && !isCorrect
                    ? "bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-500"
                    : selectedAnswer === idx
                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500"
                    : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                } ${hasAnswered || showResult ? "cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0 ${
                      showResult && correctAnswer === idx
                        ? "bg-green-500 text-white"
                        : showResult && selectedAnswer === idx && !isCorrect
                        ? "bg-red-500 text-white"
                        : selectedAnswer === idx
                        ? "bg-cyan-500 text-white"
                        : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <p className="text-white text-lg font-semibold flex-1">
                    {option}
                  </p>
                  {showResult && correctAnswer === idx && (
                    <span className="text-3xl">✓</span>
                  )}
                  {showResult && selectedAnswer === idx && !isCorrect && (
                    <span className="text-3xl">✗</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        {!hasAnswered && !showResult && (
          <button
            onClick={() => handleSubmitAnswer()}
            disabled={selectedAnswer === null}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedAnswer === null ? "Select an Answer" : "Submit Answer"}
          </button>
        )}

        {hasAnswered && !showResult && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
            <div className="animate-pulse">
              <p className="text-xl font-semibold text-white mb-2">
                Answer Submitted!
              </p>
              <p className="text-slate-400">
                Waiting for other players...
              </p>
            </div>
          </div>
        )}

        {showResult && (
          <div
            className={`rounded-xl p-6 text-center ${
              isCorrect
                ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500"
                : "bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-500"
            }`}
          >
            <p className="text-3xl font-bold text-white mb-2">
              {isCorrect ? "🎉 Correct!" : "❌ Incorrect"}
            </p>
            <p className="text-lg text-white">
              {isCorrect
                ? `+${currentQuestion.points || 1000} points`
                : `Correct answer was: ${String.fromCharCode(65 + correctAnswer)}`}
            </p>
            <p className="text-slate-300 mt-2">
              Current Score: {currentScore}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerGameLive;
