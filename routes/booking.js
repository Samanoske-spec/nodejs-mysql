import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const router = express.Router();

// Register User
router.get('/', async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM bookings');
      res.json(rows);
    } catch (err) {
      res.status(500).send('Error fetching bookings');
    }
  });
// Calculate booking price dynamically
const calculateBookingPrice = async (spaceId, startTime, endTime) => {
    const [space] = await db.query('SELECT * FROM spaces WHERE id = ?', [spaceId]);
    const startHour = new Date(startTime).getHours();
    const endHour = new Date(endTime).getHours();
  
    let totalPrice = 0;
    for (let hour = startHour; hour < endHour; hour++) {
      const isPeak = hour >= space.peak_start && hour < space.peak_end;
      totalPrice += isPeak ? space.hourly_rate_peak : space.hourly_rate_off_peak;
    }
    return totalPrice;
  };
  router.put('/:id/approve', async (req, res) => {
    const { space_id, start_time, end_time, status } = req.body;
  
    try {
      const price = await calculateBookingPrice(space_id, start_time, end_time);
      await db.query(
        `UPDATE bookings 
         SET approved = ?, amount = ?, space_id = ? 
         WHERE id = ?`,
        [status === 'approved', price, space_id, req.params.id]
      );
      res.send('Booking approved with calculated price');
    } catch (error) {
      res.status(500).send('Error updating booking');
    }
  });
  router.post('/api/calculate-price', async (req, res) => {
    const { space_id, start_time, end_time } = req.body;
  
    try {
      const price = await calculateBookingPrice(space_id, start_time, end_time);
      res.json({ price });
    } catch (error) {
      res.status(500).send('Error calculating price');
    }
  });
  // API to create a booking
router.post('/', async (req, res) => {
    const { user_id, purpose, start_time, end_time, class_size, status, amount } = req.body;
    try {
      const [result] = await db.query(
        `INSERT INTO bookings (user_id, purpose, start_time, end_time, class_size, status, amount)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [user_id, purpose, start_time, end_time, class_size, status, amount]
      );
      res.json({ bookingId: result.insertId });
    } catch (err) {
      res.status(500).send('Error creating booking');
    }
  });
  


export default router;
