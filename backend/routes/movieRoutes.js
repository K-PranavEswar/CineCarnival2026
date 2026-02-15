import express from 'express';
import { getMovies, createMovie } from '../controllers/movieController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();
router.get('/', getMovies);
router.post('/', protect, admin, createMovie);

export default router;
