import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import businessRoutes from './routes/business.js';
import trainerRoutes from './routes/trainer.js';
import userRoutes from './routes/user.js';
import siteRoutes from './routes/site.js';
import userProfileRoutes from './routes/userProfiles.js';
import path from 'path';
import pool from './config/db.js';
// import apiRoutes from './routes/api.js';
import adminRoutes from './routes/admin.js';
import bookingRoutes from './routes/booking.js';
import spacesRoutes from './routes/spaces.js';
import { fileURLToPath } from 'url';
const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/business', businessRoutes);
app.use('/trainer', trainerRoutes);
app.use('/user', userRoutes);
app.use('/site',siteRoutes);
app.use('/admin', adminRoutes);
app.use('/booking',bookingRoutes);
app.use('/spaces',spacesRoutes);
app.use('/user-profiles', userProfileRoutes);
// app.use('/api', apiRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
