import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import theatreRoutes from './routes/theatreRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/theatres', theatreRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cine-carnival')
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
