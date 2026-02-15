import express from 'express';
import { getTheatresByMovie, createTheatre } from '../controllers/theatreController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();
router.get('/:movieId', getTheatresByMovie);
router.post('/', protect, admin, createTheatre);

export default router;
