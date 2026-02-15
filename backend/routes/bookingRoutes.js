import express from 'express';
import { createBooking, getUserBookings, getAllBookings, createRazorpayOrder, verifyPayment, deleteBooking, updateBookingSeats } from '../controllers/bookingController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Specific routes first
router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);
router.get('/all', protect, admin, getAllBookings);
router.get('/user/:userId', protect, getUserBookings);

// Generic parameter routes after
router.post('/', protect, createBooking);
router.delete('/:bookingId', protect, admin, deleteBooking);
router.put('/:bookingId/seats', protect, admin, updateBookingSeats);

export default router;
