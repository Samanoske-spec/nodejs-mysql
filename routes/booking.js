import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const router = express.Router();

// Register User
router.get('/', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM bookings');
      res.json(rows);
    } catch (err) {
      res.status(500).send('Error fetching bookings');
    }
  });
// Calculate booking price dynamically
const calculateBookingPrice = async (spaceId, startTime, endTime) => {
    const [space] = await pool.query('SELECT * FROM spaces WHERE id = ?', [spaceId]);
    const startHour = new Date(startTime).getHours();
    const endHour = new Date(endTime).getHours();
  
    let totalPrice = 0;
    for (let hour = startHour; hour < endHour; hour++) {
      const isPeak = hour >= space.peak_start && hour < space.peak_end;
      totalPrice += isPeak ? space.hourly_rate_peak : space.hourly_rate_off_peak;
    }
    return totalPrice;
  };
  router.post('/request', async (req, res) => {
    const { user_id, space_id, start_time, end_time, purpose } = req.body;
  
    try {
      await pool.query(
        `INSERT INTO bookings (user_id, space_id, start_time, end_time, purpose, status) 
         VALUES (?, ?, ?, ?, ?, 'requested')`,
        [user_id, space_id, start_time, end_time, purpose]
      );
  
      res.send('Booking request submitted successfully');
    } catch (error) {
      res.status(500).send('Error creating booking request');
    }
  });
  router.get('/trainer/:user_id', async (req, res) => {
    try {
      const [bookings] = await pool.query(
        `SELECT b.*, s.name AS space_name 
         FROM bookings b 
         JOIN spaces s ON b.space_id = s.id 
         WHERE b.user_id = ?`,
        [req.params.user_id]
      );
  
      res.json(bookings);
    } catch (error) {
      res.status(500).send('Error fetching bookings');
    }
  });
  
  router.put('/:id/approve', async (req, res) => {
    const { space_id, start_time, end_time, status } = req.body;
  
    try {
      const price = await calculateBookingPrice(space_id, start_time, end_time);
      await pool.query(
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
      const [result] = await pool.query(
        `INSERT INTO bookings (user_id, purpose, start_time, end_time, class_size, status, amount)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [user_id, purpose, start_time, end_time, class_size, status, amount]
      );
      res.json({ bookingId: result.insertId });
    } catch (err) {
      res.status(500).send('Error creating booking');
    }
  });
  router.get('/available-spaces', async (req, res) => {
    try {
      const { start_date, end_date } = req.query;

      const [spaces] = await pool.query(
        `SELECT s.*, b.start_time, b.end_time, b.status
         FROM spaces s
         LEFT JOIN bookings b 
           ON s.id = b.space_id 
           AND b.start_time BETWEEN ? AND ?`,
        [start_date, end_date]
      );
      console.log(spaces);
      res.json(spaces);
    } catch (error) {
        console.log(error);
      res.status(500).send('Error fetching available spaces');
    }
  });

  router.get('/admin/', async (req, res) => {
    try {
      const [bookings] = await pool.query(
        `SELECT b.id, b.user_id, b.space_id, s.name AS space_name, b.start_time, 
                b.end_time, b.purpose, b.status 
         FROM bookings b 
         JOIN spaces s ON b.space_id = s.id`
      );
      res.json(bookings);
    } catch (error) {
      res.status(500).send('Error fetching bookings');
    }
  });
  
  // Approve or reject a booking
  router.put('/admin/:id', async (req, res) => {
    const { status } = req.body; // 'approved' or 'rejected'
    try {
      await pool.query(
        `UPDATE bookings 
         SET status = ? 
         WHERE id = ?`,
        [status, req.params.id]
      );
      res.send(`Booking ${status}`);
    } catch (error) {
      res.status(500).send('Error updating booking status');
    }
  });
  


export default router;
