import 'dotenv/config';
import mongoose from 'mongoose';
import Theatre from './models/Theatre.js';

async function fixAllTheatres() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cine-carnival');
    
    // Find all theatres with A4 in bookedSeats
    const theatres = await Theatre.find({ bookedSeats: { $in: ['A4'] } });
    
    console.log(`Found ${theatres.length} theatre(s) with A4 booked`);
    
    for (const theatre of theatres) {
      console.log(`\nTheatre: ${theatre.name} (ID: ${theatre._id})`);
      console.log(`Before: ${theatre.bookedSeats.join(', ')}`);
      
      theatre.bookedSeats = theatre.bookedSeats.filter((seat) => seat !== 'A4');
      await theatre.save();
      
      console.log(`After: ${theatre.bookedSeats.join(', ') || 'none'}`);
    }

    console.log('\nSeat A4 is now available for booking in all theatres.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    try { await mongoose.disconnect(); } catch (_) {}
  }
}

fixAllTheatres();
