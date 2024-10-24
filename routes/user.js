import express from 'express';
import authMiddleware from '../middleware/auth.js';
import pool from '../config/db.js';

const router = express.Router();

// Enroll in a project
router.post('/enroll', authMiddleware, async (req, res) => {
  const { projectId } = req.body;

  try {
    await pool.query(
      'INSERT INTO enrollments (user_id, project_id) VALUES (?, ?)',
      [req.user.id, projectId]
    );
    res.status(201).json({ message: 'Enrolled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error enrolling in project', error });
  }
});

// Get user enrollments
router.get('/enrollments', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM enrollments WHERE user_id = ?',
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching enrollments', error });
  }
});

export default router;
