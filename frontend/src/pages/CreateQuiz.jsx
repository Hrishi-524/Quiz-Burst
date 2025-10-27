import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Plus,
  Trash2,
  Clock,
  Award,
  CheckCircle,
  AlertCircle,
  Zap,
  Save,
  Play,
  ArrowLeft,
  ChevronDown,
  Image,
  Video,
  Volume2,
  FileText,
  Settings,
  Copy,
  GripVertical
} from 'lucide-react';
import { createQuiz } from '../api/quiz';
import { useNavigate } from 'react-router-dom';

const CreateQuiz = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('General');
    const [difficulty, setDifficulty] = useState('Medium');
    const [questions, setQuestions] = useState([
        { 
            id: 1,
            question: '', 
            options: ['', '', '', ''], 
            correctAnswer: 0, 
            timeLimit: 30, 
            points: 1000,
            explanation: '',
            media: { type: 'none', url: '', publicId: '' },
            type: 'single-choice'
        }
    ]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [quizCreated, setQuizCreated] = useState(null);
    const [gameCreated, setGameCreated] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [uploadingMedia, setUploadingMedia] = useState(false);
    const navigate = useNavigate()

    const handleAddQuestion = () => {
        const newQuestion = {
            id: questions.length + 1,
            question: '',
            options: ['', '', '', ''],
            correctAnswer: 0,
            timeLimit: 30,
            points: 1000,
            explanation: '',
            media: { type: 'none', url: '', publicId: '' },
            type: 'single-choice'
        };
        setQuestions([...questions, newQuestion]);
        setCurrentQuestionIndex(questions.length);
    };

    const handleDeleteQuestion = (index) => {
        if (questions.length === 1) {
            alert('Quiz must have at least one question');
            return;
        }
        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions);
        if (currentQuestionIndex >= newQuestions.length) {
            setCurrentQuestionIndex(newQuestions.length - 1);
        }
    };

    const handleDuplicateQuestion = (index) => {
        const duplicated = { ...questions[index], id: questions.length + 1 };
        const newQuestions = [...questions];
        newQuestions.splice(index + 1, 0, duplicated);
        setQuestions(newQuestions);
        setCurrentQuestionIndex(index + 1);
    };

    const handleChangeQuestion = (index, field, value) => {
        const newQuestions = [...questions];
        if (field === 'question') {
            newQuestions[index].question = value;
        } else if (field.startsWith('option')) {
            const optionIndex = parseInt(field.slice(-1));
            newQuestions[index].options[optionIndex] = value;
        } else if (field === 'correctAnswer') {
            newQuestions[index].correctAnswer = parseInt(value);
        } else if (field === 'timeLimit') {
            newQuestions[index].timeLimit = parseInt(value);
        } else if (field === 'points') {
            newQuestions[index].points = parseInt(value);
        } else if (field === 'media') {
            newQuestions[index].media = value;
        } else if (field === 'explanation') {
            newQuestions[index].explanation = value;
        }

        setQuestions(newQuestions);
    };

    const handleMediaUpload = async (file, questionIndex) => {
        if (!file) return;

        setUploadingMedia(true);
        try {
            const formData = new FormData();
            formData.append('media', file);

            const response = await fetch('http://localhost:5000/api/upload/media', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const result = await response.json();
            const newQuestions = [...questions];
            newQuestions[questionIndex].media = result.media;
            setQuestions(newQuestions);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload media');
        } finally {
            setUploadingMedia(false);
        }
    };

    const handleRemoveMedia = (questionIndex) => {
        const newQuestions = [...questions];
        newQuestions[questionIndex].media = { type: 'none', url: '', publicId: '' };
        setQuestions(newQuestions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!title.trim()) {
            alert('Please enter a quiz title');
            return;
        }
        if (questions.some(q => !q.question.trim())) {
            alert('All questions must have text');
            return;
        }
        if (questions.some(q => q.options.some(opt => !opt.trim()))) {
            alert('All options must be filled');
            return;
        }

        setIsSubmitting(true);
        try {
            const quizData = {
                title,
                description,
                category,
                difficulty,
                questions : questions.map(q => (
                    {  
                        id: q.id, 
                        question: q.question, 
                        options: q.options, 
                        correctAnswer: q.correctAnswer, 
                        explanation: q.explanation,
                        media: q.media,
                        timeLimit: q.timeLimit, 
                        points: q.points, 
                        type: q.type 
                    }
                )),
            }
            console.log('checkpoint quizData before API call:', quizData);
            
            const createdQuiz = await createQuiz(quizData)
            setQuizCreated(createdQuiz);
            alert(`Quiz created successfully!`);
        } catch (err) {
            console.error(err);
            alert('Failed to create quiz');
        } finally {
            setIsSubmitting(false);
            navigate('/quizbank');
        }
    };

    const handleHostGame = async () => {
        if (!quizCreated) return;
        try {
        // Simulated API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const createdGame = {
            gameCode: Math.random().toString(36).substr(2, 6).toUpperCase(),
            quizId: quizCreated.id
        };
        
        setGameCreated(createdGame);
        alert(`Game created! Code: ${createdGame.gameCode}`);
        // Navigate to host game live page
        // navigate(`/host-game-live/${createdGame.gameCode}`);
        } catch (err) {
        console.error(err);
        alert('Failed to create game');
        }
    };

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    const difficultyOptions = ['Easy', 'Medium', 'Hard'];
    const categoryOptions = ['General', 'Programming', 'Science', 'History', 'Geography', 'Sports', 'Entertainment'];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[120px]"></div>
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none"></div>

        <div className="relative z-10 container mx-auto px-6 py-8 max-w-7xl">
            {/* Header */}
            <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
            >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                <button onClick={() => navigate('/quizbank')}className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-400" />
                </button>
                <div>
                    <div className="flex items-center gap-3 mb-2">
                    <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2.5 rounded-xl">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white">Create Quiz</h1>
                    </div>
                    <p className="text-slate-400">Build an engaging quiz experience</p>
                </div>
                </div>

                <div className="flex items-center gap-3">
                <motion.button
                    onClick={() => setShowSettings(!showSettings)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2.5 bg-slate-900/50 backdrop-blur-xl border border-slate-800 text-white rounded-xl font-medium hover:border-slate-700 transition-all flex items-center gap-2"
                >
                    <Settings className="w-4 h-4" />
                    Settings
                </motion.button>

                <motion.button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating...
                    </>
                    ) : (
                    <>
                        <Save className="w-4 h-4" />
                        Create Quiz
                    </>
                    )}
                </motion.button>
                </div>
            </div>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Sidebar - Questions List */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-1 space-y-4"
            >
                {/* Quiz Info Card */}
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    Quiz Information
                </h3>
                
                <div className="space-y-4">
                    <div>
                    <label className="text-sm text-slate-400 mb-2 block">Title</label>
                    <input
                        type="text"
                        placeholder="Enter quiz title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-700 bg-slate-800/50 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                    />
                    </div>

                    <div>
                    <label className="text-sm text-slate-400 mb-2 block">Description</label>
                    <textarea
                        placeholder="Brief description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full p-3 rounded-xl border border-slate-700 bg-slate-800/50 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all resize-none"
                    />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-sm text-slate-400 mb-2 block">Category</label>
                        <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-700 bg-slate-800/50 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                        >
                        {categoryOptions.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm text-slate-400 mb-2 block">Difficulty</label>
                        <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-700 bg-slate-800/50 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                        >
                        {difficultyOptions.map(diff => (
                            <option key={diff} value={diff}>{diff}</option>
                        ))}
                        </select>
                    </div>
                    </div>
                </div>
                </div>

                {/* Questions List */}
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-xl p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Questions</h3>
                    <span className="text-sm text-slate-400">{questions.length} total</span>
                </div>

                <div className="space-y-2 mb-4 max-h-[400px] overflow-y-auto pr-2">
                    {questions.map((q, idx) => (
                    <motion.button
                        key={q.id}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        whileHover={{ x: 4 }}
                        className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                        currentQuestionIndex === idx
                            ? 'bg-cyan-500/10 border-cyan-500/50 ring-2 ring-cyan-500/30'
                            : 'bg-slate-800/30 border-slate-700 hover:border-slate-600'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                            currentQuestionIndex === idx
                            ? 'bg-cyan-500 text-white'
                            : 'bg-slate-700 text-slate-400'
                        }`}>
                            {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-white font-medium text-sm truncate">
                            {q.question || 'Empty question'}
                            </div>
                            <div className="text-slate-400 text-xs mt-1">
                            {q.timeLimit}s • {q.points} pts
                            </div>
                        </div>
                        {q.question && (
                            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        )}
                        </div>
                    </motion.button>
                    ))}
                </div>

                <motion.button
                    onClick={handleAddQuestion}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-slate-800/50 border-2 border-dashed border-slate-700 text-slate-400 rounded-xl font-medium hover:border-cyan-500/50 hover:text-cyan-400 transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Question
                </motion.button>
                </div>
            </motion.div>

            {/* Right Side - Question Editor */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2"
            >
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
                {/* Progress Bar */}
                <div className="h-2 bg-slate-800">
                    <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                    />
                </div>

                <div className="p-8">
                    {/* Question Header */}
                    <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-lg">
                        <Zap className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">
                        Question {currentQuestionIndex + 1}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                        onClick={() => handleDuplicateQuestion(currentQuestionIndex)}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors group"
                        title="Duplicate"
                        >
                        <Copy className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
                        </button>
                        <button
                        onClick={() => handleDeleteQuestion(currentQuestionIndex)}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors group"
                        title="Delete"
                        >
                        <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-red-400" />
                        </button>
                    </div>
                    </div>

                    {/* Question Input */}
                    <div className="mb-8">
                    <label className="text-sm text-slate-400 mb-3 block">Question Text</label>
                    <textarea
                        placeholder="Enter your question here..."
                        value={currentQuestion.question}
                        onChange={(e) => handleChangeQuestion(currentQuestionIndex, 'question', e.target.value)}
                        rows={3}
                        className="w-full p-4 rounded-xl border border-slate-700 bg-slate-800/50 text-white text-lg placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all resize-none"
                    />
                    </div>

                    {/* Options */}
                    <div className="mb-8">
                    <label className="text-sm text-slate-400 mb-3 block">Answer Options</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentQuestion.options.map((option, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ scale: 1.01 }}
                            className={`relative p-4 rounded-xl border-2 transition-all ${
                            currentQuestion.correctAnswer === idx
                                ? 'bg-emerald-500/10 border-emerald-500/50 ring-2 ring-emerald-500/30'
                                : 'bg-slate-800/30 border-slate-700'
                            }`}
                        >
                            <div className="flex items-center gap-3 mb-2">
                            <button
                                onClick={() => handleChangeQuestion(currentQuestionIndex, 'correctAnswer', idx)}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                currentQuestion.correctAnswer === idx
                                    ? 'bg-emerald-500 border-emerald-500'
                                    : 'border-slate-600 hover:border-slate-500'
                                }`}
                            >
                                {currentQuestion.correctAnswer === idx && (
                                <CheckCircle className="w-4 h-4 text-white" strokeWidth={3} />
                                )}
                            </button>
                            <span className="text-slate-400 font-semibold text-sm">
                                Option {String.fromCharCode(65 + idx)}
                            </span>
                            {currentQuestion.correctAnswer === idx && (
                                <span className="ml-auto text-xs font-medium text-emerald-400">
                                Correct Answer
                                </span>
                            )}
                            </div>
                            <input
                            type="text"
                            placeholder={`Enter option ${idx + 1}`}
                            value={option}
                            onChange={(e) => handleChangeQuestion(currentQuestionIndex, `option${idx}`, e.target.value)}
                            className="w-full p-2 rounded-lg border border-slate-700/50 bg-slate-900/50 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                            />
                        </motion.div>
                        ))}
                    </div>
                    </div>

                    <div>
                        <label className="text-sm text-slate-400 mb-3 block">Explanation (optional)</label>
                        <textarea
                        placeholder=""
                        value={currentQuestion.explanation}
                        onChange={(e) => handleChangeQuestion(currentQuestionIndex, 'explanation', e.target.value)}
                        className="w-full p-4 rounded-xl border border-slate-700 bg-slate-800/50 text-white text-lg placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all resize-none"
                        />
                    </div>

                    {/* Multimedia Upload */}
                    <div className="mb-8">
                        <label className="text-sm text-slate-400 mb-3 block">Multimedia (optional)</label>
                        <div className="space-y-4">
                            {currentQuestion.media.type !== 'none' && currentQuestion.media.url ? (
                                <div className="relative">
                                    {currentQuestion.media.type === 'image' && (
                                        <img 
                                            src={currentQuestion.media.url} 
                                            alt="Question media" 
                                            className="w-full max-w-md h-48 object-cover rounded-xl border border-slate-700"
                                        />
                                    )}
                                    {currentQuestion.media.type === 'video' && (
                                        <video 
                                            src={currentQuestion.media.url} 
                                            controls 
                                            className="w-full max-w-md h-48 object-cover rounded-xl border border-slate-700"
                                        />
                                    )}
                                    {currentQuestion.media.type === 'audio' && (
                                        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                                            <audio src={currentQuestion.media.url} controls className="w-full" />
                                        </div>
                                    )}
                                    <button
                                        onClick={() => handleRemoveMedia(currentQuestionIndex)}
                                        className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center">
                                    <input
                                        type="file"
                                        accept="image/*,video/*,audio/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) handleMediaUpload(file, currentQuestionIndex);
                                        }}
                                        className="hidden"
                                        id="media-upload"
                                        disabled={uploadingMedia}
                                    />
                                    <label
                                        htmlFor="media-upload"
                                        className={`cursor-pointer flex flex-col items-center gap-2 ${
                                            uploadingMedia ? 'opacity-50 cursor-not-allowed' : 'hover:text-cyan-400'
                                        }`}
                                    >
                                        {uploadingMedia ? (
                                            <>
                                                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                                                <span className="text-slate-400">Uploading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Image className="w-8 h-8 text-slate-400" />
                                                <span className="text-slate-400">Click to upload image, video, or audio</span>
                                            </>
                                        )}
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-slate-800/30 rounded-xl border border-slate-700">
                    <div>
                        <label className="text-sm text-slate-400 mb-2 block flex items-center gap-2">
                        <Clock className="w-4 h-4 text-cyan-400" />
                        Time Limit (seconds)
                        </label>
                        <input
                        type="number"
                        min="5"
                        max="120"
                        value={currentQuestion.timeLimit}
                        onChange={(e) => handleChangeQuestion(currentQuestionIndex, 'timeLimit', e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900/50 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-slate-400 mb-2 block flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-400" />
                        Points
                        </label>
                        <input
                        type="number"
                        min="100"
                        max="5000"
                        step="100"
                        value={currentQuestion.points}
                        onChange={(e) => handleChangeQuestion(currentQuestionIndex, 'points', e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900/50 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-slate-400 mb-2 block">Correct Answer</label>
                        <select
                        value={currentQuestion.correctAnswer}
                        onChange={(e) => handleChangeQuestion(currentQuestionIndex, 'correctAnswer', e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900/50 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                        >
                        {currentQuestion.options.map((_, idx) => (
                            <option key={idx} value={idx}>
                            Option {String.fromCharCode(65 + idx)}
                            </option>
                        ))}
                        </select>
                    </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
                    <button
                        onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="px-4 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-xl font-medium hover:border-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>

                    <span className="text-slate-400 text-sm">
                        {currentQuestionIndex + 1} of {questions.length}
                    </span>

                    <button
                        onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                        disabled={currentQuestionIndex === questions.length - 1}
                        className="px-4 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-xl font-medium hover:border-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                    </div>
                </div>
                </div>
            </motion.div>
            </div>

            {/* Success Modal */}
            <AnimatePresence>
            {quizCreated && !gameCreated && (
                <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setQuizCreated(null)}
                >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl p-8 max-w-md w-full"
                >
                    <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 mb-6">
                        <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Quiz Created!</h2>
                    <p className="text-slate-400 mb-8">
                        Your quiz has been saved successfully. Ready to host a game?
                    </p>
                    <div className="flex gap-3">
                        <button
                        onClick={() => setQuizCreated(null)}
                        className="flex-1 px-6 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl font-semibold hover:bg-slate-700 transition-all"
                        >
                        Close
                        </button>
                        <button
                        onClick={handleHostGame}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all flex items-center justify-center gap-2"
                        >
                        <Play className="w-4 h-4" />
                        Host Game
                        </button>
                    </div>
                    </div>
                </motion.div>
                </motion.div>
            )}

            {gameCreated && (
                <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl p-8 max-w-md w-full text-center"
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 mb-6">
                    <Play className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Game Created!</h2>
                    <p className="text-slate-400 mb-6">Share this code with players:</p>
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
                    <div className="text-5xl font-bold text-cyan-400 tracking-[0.3em]">
                        {gameCreated.gameCode}
                    </div>
                    </div>
                    <button
                    onClick={() => {/* Navigate to host-game-live */}}
                    className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all"
                    >
                    Go to Host Dashboard
                    </button>
                </motion.div>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
        </div>
    );
};

export default CreateQuiz;