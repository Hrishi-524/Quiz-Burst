// src/controllers/quizController.js
import mongoose from 'mongoose';
import Quiz from '../models/Quiz.js';
import User from '../models/User.js';

export async function createQuiz(req, res) {
    try {
        const { title, description, category, difficulty, questions } = req.body;
        console.log('Received quiz data:', req.body);

        // Validate questions
        if (!questions || questions.length === 0) {
            return res.status(400).json({ error: 'At least one question is required' });
        }

        // Validate each question
            // for (let i = 0; i < questions.length; i++) {
            //     const q = questions[i];
            //     if (!q.question || !q.options || q.options.length !== 4) {
            //         return res.status(400).json({ 
            //             error: `Question ${i + 1} must have a question text and exactly 4 options` 
            //         });
            //     }
            //     if (q.correctAnswer === undefined || q.correctAnswer < 0 || q.correctAnswer > 3) {
            //         return res.status(400).json({ 
            //             error: `Question ${i + 1} must have a valid correct answer (0-3)` 
            //         });
            //     }
            // }

        /**
         * const quizData = {
                title,
                description,
                category,
                difficulty,
                questions : [questions.map(q => (
                    {  
                        id: q.id, 
                        question: q.question, 
                        options: q.options, 
                        correctAnswer: q.correctAnswer, 
                        timeLimit: q.timeLimit, 
                        points: q.points, 
                        type: q.type 
                    }
                ))],
            }
         */
        console.log("Decoded user from JWT who is creating quiz:", req.user);
        /**
         * Decoded user from JWT who is creating quiz: {
            id: '68de5eace33e4c8cd82a95df',
            username: 'Iamnewuser',
            iat: 1759403692,
            exp: 1759428892
            }
         */
        const quiz = new Quiz({
            title,
            description,
            category,
            difficulty,
            questions: questions.map(q => ({
                id: q.id,
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                timeLimit: q.timeLimit || 30,
                points: q.points || 1000,
                type: q.type || 'single-choice'
            })),
            createdBy: req.user.id,
        });

        console.log('Creating quiz:', quiz);
        console.log('create quiz quizId:', quiz._id);

        await quiz.save();

        res.status(201).json({
            status: 'success',
            message: 'Quiz created successfully',
            quiz: {
                id: quiz._id,
                title: quiz.title,
                description: quiz.description,
                questionCount: quiz.questions.length
            }
        });
    } catch (error) {
        console.error('Create quiz error:', error);
        if (!res.headersSent) {
            res.status(500).json({
                status: 'error', 
                error: 'Failed to create quiz' 
            });
        }
    }
}

export async function getQuiz(req, res) {
    try {
        const { id } = req.params;
        const quiz = await Quiz.findById(id);

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        res.json({ quiz });
    } catch (error) {
        console.error('Get quiz error:', error);
        res.status(500).json({ error: 'Failed to fetch quiz' });
    }
}

export async function getAllQuizzes(req, res) {
    try {
        const { id } = req.params;
        console.log('Fetching quizzes for user ID:', id);

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const quizzes = await Quiz.find({ createdBy: id })
            .sort('-createdAt')
            .limit(20);
        console.log(`Found ${quizzes.length} quizzes for user ID ${id}`);

        res.json({
            status: 'success',
            quizzesMeta: quizzes.map(q => ({
                id: q._id,
                title: q.title,
                description: q.description,
                questionCount: q.questions.length,
                createdAt: q.createdAt,
                duration: q.questions.reduce((total, question) => total + (question.timeLimit || 0), 0),
                difficulty: q.difficulty,
                category: q.category,
                isPublished : q.isPublic,
            }))
        });
    } catch (error) {
        console.error('Get all quizzes error:', error);
        res.status(500).json({
            status: 'error',
            error: 'Failed to fetch quizzes' 
        });
    }
}

export async function updateQuiz(req, res) {
    try {
        const { id } = req.params;
        const updates = req.body;

        const quiz = await Quiz.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        res.json({
        message: 'Quiz updated successfully',
        quiz: {
            id: quiz._id,
            title: quiz.title,
            description: quiz.description,
            questionCount: quiz.questions.length
        }
        });
    } catch (error) {
        console.error('Update quiz error:', error);
        res.status(500).json({ error: 'Failed to update quiz' });
    }
}

export async function deleteQuiz(req, res) {
    try {
        const { id } = req.params;
        const quiz = await Quiz.findByIdAndDelete(id);

        if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
        }

        res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        console.error('Delete quiz error:', error);
        res.status(500).json({ error: 'Failed to delete quiz' });
    }
}