import express from 'express';
import authMiddleware from '../middleware/auth.js';
import pool from '../config/db.js';

const router = express.Router();

// Create a new venue rental
router.post('/venue', authMiddleware, async (req, res) => {
  const { venueName, location, price } = req.body;

  try {
    const [result] = await pool.query(
      'INSERT INTO venues (name, location, price, owner_id) VALUES (?, ?, ?, ?)',
      [venueName, location, price, req.user.id]
    );
    res.status(201).json({ message: 'Venue created successfully', venueId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get all venues owned by the business
router.get('/venue', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM venues WHERE owner_id = ?', [req.user.id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Update a venue
router.put('/venue/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { venueName, location, price } = req.body;

  try {
    await pool.query(
      'UPDATE venues SET name = ?, location = ?, price = ? WHERE id = ? AND owner_id = ?',
      [venueName, location, price, id, req.user.id]
    );
    res.json({ message: 'Venue updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Delete a venue
router.delete('/venue/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM venues WHERE id = ? AND owner_id = ?', [id, req.user.id]);
    res.json({ message: 'Venue deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
