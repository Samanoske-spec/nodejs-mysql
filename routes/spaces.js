// server/routes/spaces.js
import express from 'express';
import mysql from 'mysql2/promise';
import pool from '../config/db.js';

const router = express.Router();

// Fetch all spaces
router.get('/', async (req, res) => {
  try {
    const [spaces] = await pool.query('SELECT * FROM spaces WHERE isdel = 0');
    res.json(spaces);
  } catch (error) {
    res.status(500).send('Error fetching spaces');
  }
});

// Create a new space
router.post('/', async (req, res) => {
  const { name, hourly_rate_off_peak, hourly_rate_peak, peak_start, peak_end } = req.body;
  try {
    await pool.query(
      `INSERT INTO spaces (name, hourly_rate_off_peak, hourly_rate_peak, peak_start, peak_end) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, hourly_rate_off_peak, hourly_rate_peak, peak_start, peak_end]
    );
    res.send('Space added successfully');
  } catch (error) {
    res.status(500).send('Error adding space');
  }
});

// Update a space
router.put('/:id', async (req, res) => {
  const { name, hourly_rate_off_peak, hourly_rate_peak, peak_start, peak_end } = req.body;
  try {
    await pool.query(
      `UPDATE spaces 
       SET name = ?, hourly_rate_off_peak = ?, hourly_rate_peak = ?, peak_start = ?, peak_end = ? 
       WHERE id = ?`,
      [name, hourly_rate_off_peak, hourly_rate_peak, peak_start, peak_end, req.params.id]
    );
    res.send('Space updated successfully');
  } catch (error) {
    res.status(500).send('Error updating space');
  }
});

// Delete a space
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('UPDATE spaces SET isdel = 1 WHERE id = ?', [req.params.id]);
    res.send('Space deleted successfully');
  } catch (error) {
    res.status(500).send('Error deleting space');
  }
});

export default router;
