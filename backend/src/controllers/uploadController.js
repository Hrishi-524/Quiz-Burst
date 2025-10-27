import multer from 'multer';
import { cloudinary, storage } from '../config/cloudConfig.js';

const upload = multer({ storage });

// Upload multimedia file
export const uploadMedia = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const result = {
            url: req.file.path,
            publicId: req.file.filename,
            type: req.file.mimetype.startsWith('image/') ? 'image' : 
                  req.file.mimetype.startsWith('video/') ? 'video' : 
                  req.file.mimetype.startsWith('audio/') ? 'audio' : 'none'
        };

        res.status(200).json({
            success: true,
            media: result
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
};

// Delete multimedia file
export const deleteMedia = async (req, res) => {
    try {
        const { publicId } = req.params;
        
        if (!publicId) {
            return res.status(400).json({ error: 'Public ID required' });
        }

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(publicId);
        
        res.status(200).json({ success: true, message: 'Media deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
};
