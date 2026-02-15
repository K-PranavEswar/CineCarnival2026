import 'dotenv/config';
import mongoose from 'mongoose';
import Booking from './models/Booking.js';
import Theatre from './models/Theatre.js';

async function findA4() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cine-carnival');
    
    // Find all bookings with A4
    const bookings = await Booking.find({ seats: { $in: ['A4'] } });
    console.log('Bookings with A4:', bookings.length);
    bookings.forEach((b) => {
      console.log(`Booking ID: ${b._id}, Seats: ${b.seats.join(', ')}`);
    });

    // Check theatre bookedSeats
    const theatres = await Theatre.find({});
    theatres.forEach((t) => {
      console.log(`\nTheatre: ${t.name}`);
      console.log(`Booked seats: ${t.bookedSeats.join(', ') || 'none'}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    try { await mongoose.disconnect(); } catch (_) {}
  }
}

findA4();
