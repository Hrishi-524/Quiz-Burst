import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Trophy,
  Target,
  Clock,
  Shield,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Play,
  Crown,
  Check,
  Globe,
  Brain,
  Code,
} from "lucide-react";
import Navbar from "../components/common/Navbar";
import { socket } from "../socket";

const Home = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [gameCode, setGameCode] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const pendingJoin = useRef(null);
  const [socketReady, setSocketReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    //IMPORTANT: WE WILL REPLACE THIS WITH A PROPER AUTH CHECK LATER
    if (token) {
      setIsHost(true);
    }
  }, []);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onConnect = () => setSocketReady(true);
    const onDisconnect = () => setSocketReady(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  useEffect(() => {
    const handleJoinSuccess = (data) => {
      console.log("Join success:", data);
      if (pendingJoin.current) {
        navigate(`/quiz/lobby/${data.gameCode}`, {
          state: {
            playerName: pendingJoin.current.name,
            isLobbyCreator: false,
            initialPlayers: data.players || [], // ← ADD THIS
            quizTitle: data.quizTitle || "",
          },
        });
        pendingJoin.current = null;
      }
    };

    const handleError = (err) => {
      console.error("Join error:", err);
      alert(err.message || "Failed to join");
      pendingJoin.current = null;
    };

    socket.on("joinSuccess", handleJoinSuccess);
    socket.on("error", handleError);

    return () => {
      socket.off("joinSuccess", handleJoinSuccess);
      socket.off("error", handleError);
    };
  }, [navigate]);

  // in Home.jsx handleJoinGame
  // Home.jsx -> handleJoinGame (player path)
  const handleJoinGame = () => {
    if (pendingJoin.current) return;

    if (!name || !gameCode) {
      alert("Enter both name and game code");
      return;
    }

    if (!socket.connected) {
      alert("Connecting… please try again in a second");
      return;
    }
    console.log("socket.connected:", socket.connected);

    pendingJoin.current = { name, gameCode };

    socket.emit("playerJoin", {
      gameCode: gameCode.toUpperCase(),
      playerName: name,
    });
  };

  const features = [
    {
      icon: Clock,
      title: "Real-Time Gameplay",
      description: "Compete in live, timed quizzes with instant feedback",
    },
    {
      icon: Target,
      title: "Adaptive Difficulty",
      description: "Questions adjust to your skill level dynamically",
    },
    {
      icon: Shield,
      title: "Anti-Cheat System",
      description: "Tab switching detection & shuffled answer options",
    },
    {
      icon: TrendingUp,
      title: "Performance Analytics",
      description: "Track progress with detailed insights and reports",
    },
  ];

  const benefits = [
    "No login required for players",
    "Instant multiplayer matchmaking",
    "Multimedia questions support",
    "Export detailed analytics",
    "Blind leaderboard mode",
    "Mobile responsive design",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <Navbar />
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-[120px]"></div>
      </div>
      {/* The grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none"></div>

      <div className="relative z-10 container mx-auto px-6 py-16 max-w-7xl">
        {/* Hero Section
                <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-20"
                >
                <motion.div 
                    className="flex items-center justify-center gap-3 mb-6"
                    whileHover={{ scale: 1.02 }}
                >
                    <Zap className="w-10 h-10 text-cyan-400" strokeWidth={2.5} />
                    <h1 className="text-6xl md:text-7xl font-bold text-white tracking-tight">
                    QuizBurst
                    </h1>
                </motion.div>
                
                <p className="text-xl text-slate-400 font-medium mb-3 tracking-wide">
                    Real-Time Multiplayer Quiz Platform
                </p>
                
                <p className="text-slate-500 max-w-2xl mx-auto text-lg">
                    Compete with friends, challenge your knowledge, and climb the leaderboard
                </p>
                </motion.div> */}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-20">
          {/* Join Game Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-xl">
                  <Play className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                <h2 className="text-3xl font-bold text-white">Join a Quiz</h2>
              </div>

              <div className="space-y-5 mb-8">
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-4 pl-12 pr-4 rounded-xl border border-slate-700 bg-slate-800/50 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="relative">
                  <Code className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="GAME CODE"
                    value={gameCode}
                    onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                    className="w-full p-4 pl-12 pr-4 rounded-xl border border-slate-700 bg-slate-800/50 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all uppercase tracking-[0.3em] font-semibold text-center"
                    maxLength={6}
                  />
                </div>
              </div>

              <motion.button
                onClick={handleJoinGame}
                disabled={!socket.connected}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all
                        ${
                          socketReady
                            ? "bg-gradient-to-r from-cyan-500 to-blue-600"
                            : "bg-slate-700 cursor-not-allowed opacity-60"
                        }`}
              >
                {socketReady ? "Join Game Now" : "Connecting…"}
              </motion.button>

              <p className="text-center text-slate-500 text-sm mt-5">
                No account needed • Join instantly • Free to play
              </p>
            </div>
          </motion.div>

          {/* Features Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-2">
                <Sparkles className="w-7 h-7 text-cyan-400" />
                Why QuizBurst?
              </h2>

              <div className="space-y-4 mb-8">
                {features.map((feature, idx) => {
                  const IconComponent = feature.icon;
                  const isActive = activeFeature === idx;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                      whileHover={{ x: 4 }}
                      onClick={() => setActiveFeature(idx)}
                      className={`p-5 rounded-xl cursor-pointer transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-cyan-500/30"
                          : "bg-slate-800/30 border border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-2.5 rounded-lg flex-shrink-0 transition-all ${
                            isActive ? "bg-cyan-500/20" : "bg-slate-800"
                          }`}
                        >
                          <IconComponent
                            className="w-5 h-5 text-cyan-400"
                            strokeWidth={2}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white mb-1.5 text-base">
                            {feature.title}
                          </h3>
                          <p className="text-sm text-slate-400 leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="border-t border-slate-800 pt-6">
                <h3 className="text-base font-semibold text-white mb-4">
                  Additional Features:
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {benefits.map((benefit, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + idx * 0.05 }}
                      className="flex items-center gap-3 text-slate-400"
                    >
                      <div className="w-5 h-5 rounded-full bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                        <Check
                          className="w-3 h-3 text-cyan-400"
                          strokeWidth={3}
                        />
                      </div>
                      <span className="text-sm">{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Host Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          {!isHost ? (
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
              <div className="p-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 mb-6">
                  <Crown className="w-8 h-8 text-white" strokeWidth={2} />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Become a Quiz Host
                </h2>
                <p className="text-slate-400 mb-8 text-lg max-w-2xl mx-auto">
                  Create custom quizzes, host live games, and access powerful
                  analytics tools
                </p>
                <motion.button
                  onClick={() => navigate("/login")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-white text-slate-900 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
                >
                  <Crown className="w-5 h-5" />
                  Join as Host
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-600/10 backdrop-blur-xl rounded-2xl border border-emerald-500/30 shadow-2xl overflow-hidden">
              <div className="p-10 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Trophy
                    className="w-10 h-10 text-emerald-400"
                    strokeWidth={2}
                  />
                  <h3 className="text-3xl font-bold text-white">
                    Welcome back, Host!
                  </h3>
                </div>
                <p className="text-slate-300 mb-8 text-lg">
                  Ready to create amazing quiz experiences?
                </p>
                <Link
                  to="/quizbank"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 text-white rounded-xl font-semibold text-lg shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all"
                >
                  <Brain className="w-5 h-5" />
                  Go to Quiz Bank
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16 text-slate-600"
        >
          <p className="text-sm">Built for quiz enthusiasts worldwide</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
