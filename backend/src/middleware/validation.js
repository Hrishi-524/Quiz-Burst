import { body, validationResult } from 'express-validator';

export const validateQuiz = [
    body('title').notEmpty().withMessage('Title is required'),
    body('questions').isArray({ min: 1 }).withMessage('At least one question is required'),
    body('questions.*.question').notEmpty().withMessage('Question text is required'),
    body('questions.*.options').isArray({ min: 4, max: 4 }).withMessage('Each question must have exactly 4 options'),
    body('questions.*.correctAnswer').isInt({ min: 0, max: 3 }).withMessage('Correct answer must be between 0 and 3'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];