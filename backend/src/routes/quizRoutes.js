import { Router } from 'express';
const router = Router();
import { createQuiz, getAllQuizzes, getQuiz, updateQuiz, deleteQuiz } from '../controllers/quizController.js';
import { validateQuiz } from '../middleware/validation.js';

router.post('/', createQuiz); // validateQuiz later from middleware
router.get('/all/:id', getAllQuizzes);
router.get('/:id', getQuiz);
router.put('/:id', validateQuiz, updateQuiz);
router.delete('/:id', deleteQuiz);

export default router;