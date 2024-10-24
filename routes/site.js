import express from 'express';
import authMiddleware from '../middleware/auth.js';
import pool from '../config/db.js';

const router = express.Router();

// Save or update a microsite
router.post('/', authMiddleware, async (req, res) => {
  const { content } = req.body;

  try {
    await pool.query(
      'INSERT INTO sites (owner_id, content) VALUES (?, ?) ON DUPLICATE KEY UPDATE content = ?',
      [req.user.id, JSON.stringify(content), JSON.stringify(content)]
    );
    res.status(200).json({ message: 'Site saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving site', error });
  }
});

// Fetch the microsite for the owner
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT content FROM sites WHERE owner_id = ?', [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Site not found' });
    res.json(JSON.parse(rows[0].content));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching site', error });
  }
});

export default router;
