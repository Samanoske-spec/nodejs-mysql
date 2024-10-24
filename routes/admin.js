import express from 'express';
import authMiddleware from '../middleware/auth.js';
import pool from '../config/db.js';

const router = express.Router();

// Save or update a microsite
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT users.name, users.email,users.role, user_profiles.country_code, user_profiles.mobile_no, user_profiles.profile, user_profiles.image_file FROM user_profiles LEFT JOIN users ON users.id = user_profiles.user_id  WHERE user_profiles.isdel=0 ORDER BY users.name');
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
});
router.get('/sites', authMiddleware, async (req, res) => {
  try {
    const [sites] = await pool.query('SELECT sites.content, sites.id, users.name, users.email FROM sites LEFT JOIN users ON users.id = sites.owner_id WHERE sites.isdel=0');
    res.status(200).json({ sites });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
});
router.get('/projects', authMiddleware, async (req, res) => {
  try {
    const [projects] = await pool.query('SELECT projects.id, projects.name AS pname, projects.price, projects.description, users.name, users.email FROM projects LEFT JOIN users on users.id = projects.trainer_id WHERE projects.isdel=0');
    res.status(200).json({ projects });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
});

export default router;
