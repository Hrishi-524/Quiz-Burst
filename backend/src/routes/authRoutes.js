import { Router } from 'express';
import { signupUser, verifyLogin } from '../controllers/authController.js';

const router = Router();

router.route('/signup')
 .post(signupUser) 

router.route('/login')
 .post(verifyLogin)

export default router;