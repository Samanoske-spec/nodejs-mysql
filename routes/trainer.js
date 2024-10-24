import express from 'express';
import authMiddleware from '../middleware/auth.js';
import pool from '../config/db.js';

const router = express.Router();

// Create a new project
router.post('/project', authMiddleware, async (req, res) => {
  const { name, description, price } = req.body;

  try {
    const [result] = await pool.query(
      'INSERT INTO projects (name, description, price, trainer_id) VALUES (?, ?, ?, ?)',
      [name, description, price, req.user.id]
    );
    res.status(201).json({ message: 'Project created', projectId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Error creating project', error });
  }
});

// Get all projects by trainer
router.get('/project', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM projects WHERE trainer_id = ?',
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects', error });
  }
});

// Update a project
router.put('/project/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;

  try {
    await pool.query(
      'UPDATE projects SET name = ?, description = ?, price = ? WHERE id = ? AND trainer_id = ?',
      [name, description, price, id, req.user.id]
    );
    res.json({ message: 'Project updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating project', error });
  }
});

// Delete a project
router.delete('/project/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      'DELETE FROM projects WHERE id = ? AND trainer_id = ?',
      [id, req.user.id]
    );
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project', error });
  }
});

export default router;
