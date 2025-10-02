import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  Play,
  Plus,
  Search,
  Filter,
  Clock,
  Users,
  Target,
  Edit,
  Trash2,
  MoreVertical,
  Zap,
  TrendingUp,
  Award,
  ChevronDown,
  Copy,
  Archive,
  Sparkles,
  BarChart3,
  Calendar
} from 'lucide-react';
import { getAllQuizzes } from '../api/quiz';
import { getUserInfo } from '../utils/auth';

function QuizBank() {
    const [quizzes, setQuizzes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuizzes = async () => {
            setLoading(true);
            const userId = getUserInfo()?.id;
            if (!userId) {
                console.error("User not authenticated");
                setLoading(false);
                return;
            }
            const allQuizzes = await getAllQuizzes(userId);
            console.log("Fetched quizzes:", allQuizzes);

            // const metaData = allQuizzes.map(quiz => ({
            //     id: quiz.id,
            //     title: quiz.title,
            //     description: quiz.description,
            //     questions: quiz.questionCount,
            //     duration: Math.max(5, Math.min(quiz.questionCount * 2, 30)), // Example duration logic
            //     difficulty: quiz.difficulty || "Medium",
            //     category: quiz.category || "General",
            //     plays: Math.floor(Math.random() * 500), // Random plays for demo
            //     avgScore: Math.floor(Math.random() * 100), // Random avg score for demo
            //     createdAt: new Date(quiz.createdAt).toISOString().split('T')[0],
            //     isPublished: quiz.isPublished || false
            // }));
            // Demo data
            const demoQuizzes = [
                {
                    id: 1,
                    title: "JavaScript Fundamentals",
                    description: "Test your knowledge of core JavaScript concepts",
                    questions: 15,
                    duration: 20,
                    difficulty: "Medium",
                    category: "Programming",
                    plays: 342,
                    avgScore: 78,
                    createdAt: "2025-09-15",
                    isPublished: true
                },
                {
                    id: 2,
                    title: "React Hooks Deep Dive",
                    description: "Advanced concepts in React Hooks and state management",
                    questions: 20,
                    duration: 30,
                    difficulty: "Hard",
                    category: "Frontend",
                    plays: 198,
                    avgScore: 65,
                    createdAt: "2025-09-20",
                    isPublished: true
                },
                {
                    id: 3,
                    title: "Web Security Basics",
                    description: "Understanding common web vulnerabilities and prevention",
                    questions: 12,
                    duration: 15,
                    difficulty: "Easy",
                    category: "Security",
                    plays: 521,
                    avgScore: 82,
                    createdAt: "2025-09-10",
                    isPublished: false
                }
            ];
            
            setTimeout(() => {
                setQuizzes(demoQuizzes);
                setLoading(false);
            }, 100);
        };

        fetchQuizzes();
    }, []);

    const handleGoLive = (quizId) => {
        console.log(`Going live with quiz ID: ${quizId}`);
        // Add navigation logic here
    };

    const handleCreateQuiz = () => {
        console.log("Create new quiz");
        // Add navigation to create quiz page
        navigate('/quiz/new');
    };

    const filteredQuizzes = quizzes.filter(quiz =>
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const difficultyColors = {
        Easy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
        Medium: "text-amber-400 bg-amber-500/10 border-amber-500/30",
        Hard: "text-red-400 bg-red-500/10 border-red-500/30"
    };

    const QuizCard = ({ quiz }) => (
        <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -4 }}
        className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-xl overflow-hidden hover:border-slate-700 transition-all group"
        >
        {/* Card Header */}
        <div className="p-6 pb-4">
            <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {quiz.title}
                </h3>
                {!quiz.isPublished && (
                    <span className="px-2 py-1 bg-slate-700/50 border border-slate-600 rounded-md text-xs text-slate-400 font-medium">
                    Draft
                    </span>
                )}
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                {quiz.description}
                </p>
            </div>
            
            <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-slate-500" />
            </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
                <div className="p-1.5 bg-cyan-500/10 rounded-lg">
                <Target className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                <div className="text-slate-500 text-xs">Questions</div>
                <div className="text-white font-semibold">{quiz.questions}</div>
                </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
                <div className="p-1.5 bg-purple-500/10 rounded-lg">
                <Clock className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                <div className="text-slate-500 text-xs">Duration</div>
                <div className="text-white font-semibold">{quiz.duration}m</div>
                </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
                <div className="p-1.5 bg-amber-500/10 rounded-lg">
                <Users className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                <div className="text-slate-500 text-xs">Plays</div>
                <div className="text-white font-semibold">{quiz.plays}</div>
                </div>
            </div>
            </div>

            {/* Tags */}
            <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-3 py-1 rounded-lg border text-xs font-medium ${difficultyColors[quiz.difficulty]}`}>
                {quiz.difficulty}
            </span>
            <span className="px-3 py-1 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-300 text-xs font-medium">
                {quiz.category}
            </span>
            <div className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400">
                <TrendingUp className="w-3 h-3" />
                <span>{quiz.avgScore}% avg</span>
            </div>
            </div>
        </div>

        {/* Card Footer */}
        <div className="px-6 py-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors group/btn">
                <Edit className="w-4 h-4 text-slate-400 group-hover/btn:text-cyan-400 transition-colors" />
            </button>
            <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors group/btn">
                <Copy className="w-4 h-4 text-slate-400 group-hover/btn:text-cyan-400 transition-colors" />
            </button>
            <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors group/btn">
                <BarChart3 className="w-4 h-4 text-slate-400 group-hover/btn:text-cyan-400 transition-colors" />
            </button>
            <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors group/btn">
                <Trash2 className="w-4 h-4 text-slate-400 group-hover/btn:text-red-400 transition-colors" />
            </button>
            </div>
            
            <motion.button
            onClick={() => handleGoLive(quiz.id)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all flex items-center gap-2"
            >
            <Play className="w-4 h-4" />
            Go Live
            </motion.button>
        </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[120px]"></div>
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none"></div>

        <div className="relative z-10 container mx-auto px-6 py-12 max-w-7xl">
            {/* Header */}
            <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
            >
            <div className="flex items-center justify-between mb-6">
                <div>
                <div className="flex items-center gap-3 mb-3">
                    <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-xl">
                    <Brain className="w-7 h-7 text-white" strokeWidth={2.5} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white">Quiz Bank</h1>
                </div>
                <p className="text-slate-400 text-lg">
                    Create, manage, and host your interactive quizzes
                </p>
                </div>

                <motion.button
                onClick={handleCreateQuiz}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all flex items-center gap-2"
                >
                <Plus className="w-5 h-5" strokeWidth={2.5} />
                Create Quiz
                </motion.button>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Search quizzes by name or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-4 pl-12 pr-4 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                />
                </div>

                <motion.button
                onClick={() => setFilterOpen(!filterOpen)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-4 bg-slate-900/50 backdrop-blur-xl border border-slate-800 text-white rounded-xl font-semibold hover:border-slate-700 transition-all flex items-center gap-2"
                >
                <Filter className="w-5 h-5" />
                Filter
                <ChevronDown className={`w-4 h-4 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
                </motion.button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800 p-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/10 rounded-lg">
                    <Brain className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                    <div className="text-slate-400 text-sm">Total Quizzes</div>
                    <div className="text-white font-bold text-xl">{quizzes.length}</div>
                    </div>
                </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800 p-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                    <div className="text-slate-400 text-sm">Published</div>
                    <div className="text-white font-bold text-xl">
                        {quizzes.filter(q => q.isPublished).length}
                    </div>
                    </div>
                </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800 p-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Users className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                    <div className="text-slate-400 text-sm">Total Plays</div>
                    <div className="text-white font-bold text-xl">
                        {quizzes.reduce((sum, q) => sum + q.plays, 0)}
                    </div>
                    </div>
                </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800 p-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                    <Award className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                    <div className="text-slate-400 text-sm">Avg Score</div>
                    <div className="text-white font-bold text-xl">
                        {quizzes.length > 0 
                        ? Math.round(quizzes.reduce((sum, q) => sum + q.avgScore, 0) / quizzes.length)
                        : 0}%
                    </div>
                    </div>
                </div>
                </div>
            </div>
            </motion.div>

            {/* Quiz Grid */}
            {loading ? (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 mb-4">
                    <Brain className="w-8 h-8 text-white animate-pulse" />
                </div>
                <p className="text-slate-400 text-lg">Loading your quizzes...</p>
                </div>
            </div>
            ) : filteredQuizzes.length === 0 ? (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
            >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 mb-6">
                <Search className="w-10 h-10 text-slate-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">No quizzes found</h2>
                <p className="text-slate-400 mb-8">
                {searchTerm ? "Try adjusting your search terms" : "Create your first quiz to get started"}
                </p>
                {!searchTerm && (
                <motion.button
                    onClick={handleCreateQuiz}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all inline-flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Create Your First Quiz
                </motion.button>
                )}
            </motion.div>
            ) : (
            <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnimatePresence>
                {filteredQuizzes.map((quiz) => (
                    <QuizCard key={quiz.id} quiz={quiz} />
                ))}
                </AnimatePresence>
            </motion.div>
            )}
        </div>
        </div>
    );
}

export default QuizBank;