import express from 'express';
import authMiddleware from '../middleware/auth.js';
import pool from '../config/db.js';
import path from 'path';
import multer from 'multer';

const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Ensure this folder exists
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname)); // Ensure unique filenames
    },
  });
  
  const upload = multer({ storage });

// Create or update user profile
router.post('/', authMiddleware, upload.single('imageFile'), async (req, res) => {
  const { country_code, mobile_no, profile } = req.body;
  const userId = req.user.id;
  const imageFile = req.file ? req.file.path : null;
  console.log(imageFile.slice(8));

  try {
    const [existingProfile] = await pool.query(
      'SELECT * FROM user_profiles WHERE user_id = ?',
      [userId]
    );

    if (existingProfile.length) {
      // Update existing profile
      await pool.query(
        'UPDATE user_profiles SET country_code = ?, mobile_no = ?, profile = ?, image_file = ? WHERE user_id = ?',
        [country_code, mobile_no, profile, imageFile.slice(8), userId]
      );
      res.json({ message: 'Profile updated successfully' });
    } else {
      // Create new profile
      await pool.query(
        'INSERT INTO user_profiles (user_id, country_code, mobile_no, profile, image_file) VALUES (?, ?, ?, ?, ?)',
        [userId, country_code, mobile_no, profile, imageFile.slice(8)]
      );
      res.json({ message: 'Profile created successfully' });
    }
  } catch (error) {
    console.error('Error saving profile:', error);
    res.status(500).json({ message: 'Error saving profile', error });
  }
});

// Get user profile
router.get('/', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const [profile] = await pool.query('SELECT * FROM user_profiles WHERE user_id = ?', [userId]);
    if (profile.length === 0) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile', error });
  }
});

export default router;
