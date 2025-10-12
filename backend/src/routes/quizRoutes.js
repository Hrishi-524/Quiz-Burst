import { Router } from 'express';
const router = Router();
import { createQuiz, getAllQuizzes, getQuiz, updateQuiz, deleteQuiz } from '../controllers/quizController.js';
import { validateQuiz } from '../middleware/validation.js';
import isLoggedIn from '../middleware/isLoggedIn.js';

router.post('/', isLoggedIn, createQuiz); // validateQuiz later from middleware
router.get('/all/:id', isLoggedIn, getAllQuizzes);
router.get('/:id', isLoggedIn, getQuiz);
router.put('/:id', isLoggedIn, validateQuiz, updateQuiz);
router.delete('/:id', isLoggedIn, deleteQuiz);

export default router;