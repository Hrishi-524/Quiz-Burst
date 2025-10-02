import { Router } from 'express';
import { createGame, joinGame, getGame, startGame, nextQuestion } from '../controllers/gameController.js';

const router = Router();

router.post('/create', createGame);
router.post('/join', joinGame);
router.post('/start', startGame);   // 🔥 host starts game
router.post('/next', nextQuestion); // 🔥 host moves to next question
router.get('/:code', getGame);

export default router;
