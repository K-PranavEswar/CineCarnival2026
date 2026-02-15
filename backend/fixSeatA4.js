import 'dotenv/config';
import mongoose from 'mongoose';
import Theatre from './models/Theatre.js';
import Booking from './models/Booking.js';

async function fixSeat() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cine-carnival');
    
    // Find the Main Auditorium theatre
    const theatre = await Theatre.findOne({ name: 'Main Auditorium' });
    if (!theatre) {
      console.log('Theatre not found');
      process.exit(1);
    }

    console.log('Before:', theatre.bookedSeats);
    
    // Remove A4 from bookedSeats
    theatre.bookedSeats = theatre.bookedSeats.filter((seat) => seat !== 'A4');
    await theatre.save();
    
    console.log('After:', theatre.bookedSeats);
    console.log('Seat A4 is now available for booking.');

    // Find and remove any bookings with just A4
    const bookingsWithA4 = await Booking.find({ seats: { $in: ['A4'] } });
    if (bookingsWithA4.length > 0) {
      console.log('Found bookings with A4:', bookingsWithA4.length);
      for (const booking of bookingsWithA4) {
        console.log('Booking:', booking._id, 'seats:', booking.seats);
        // Remove A4 from seats array, delete if no seats left
        booking.seats = booking.seats.filter((s) => s !== 'A4');
        if (booking.seats.length > 0) {
          await booking.save();
          console.log('Removed A4 from booking, remaining seats:', booking.seats);
        } else {
          await Booking.deleteOne({ _id: booking._id });
          console.log('Deleted booking (had only A4):', booking._id);
        }
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    try { await mongoose.disconnect(); } catch (_) {}
  }
}

fixSeat();
