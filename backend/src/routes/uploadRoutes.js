import { Router } from 'express';
import { uploadMedia, deleteMedia } from '../controllers/uploadController.js';
import multer from 'multer';
import { storage } from '../config/cloudConfig.js';
import isLoggedIn from '../middleware/isLoggedIn.js';

const router = Router();
const upload = multer({ storage });

// Upload multimedia file
router.post('/media', isLoggedIn, upload.single('media'), uploadMedia);

// Delete multimedia file
router.delete('/media/:publicId', isLoggedIn, deleteMedia);

export default router;
