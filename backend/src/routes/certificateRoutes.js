import { Router } from 'express';
import { generateCertificate } from '../controllers/certificateController.js';

const router = Router();

// Generate certificate
router.post('/generate', generateCertificate);

export default router;
