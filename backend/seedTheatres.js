import 'dotenv/config';
import mongoose from 'mongoose';
import Movie from './models/Movie.js';
import Theatre from './models/Theatre.js';

const THEATRE_NAME = 'Main Auditorium';
const ROWS = 20;
const SEATS_PER_ROW = 25;
const TOTAL_SEATS = 500;

function buildSeats(rows, seatsPerRow) {
  const rowLetters = 'ABCDEFGHIJKLMNOPQRST';
  return Array.from({ length: rows }, (_, i) =>
    Array.from({ length: seatsPerRow }, (_, j) => `${rowLetters[i]}${j + 1}`)
  );
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const movies = await Movie.find({ name: { $in: ['Rajamanikyam', 'Chotta Mumbai'] } });
    if (movies.length === 0) {
      console.log('Run npm run seed first to add movies.');
      process.exit(1);
    }
    const seats = buildSeats(ROWS, SEATS_PER_ROW);
    for (const movie of movies) {
      const exists = await Theatre.findOne({ movieId: movie._id, name: THEATRE_NAME });
      const venueImage = '/images/main-auditorium.jpg';
      if (exists) {
        await Theatre.updateOne(
          { _id: exists._id },
          { $set: { seats, image: venueImage } }
        );
        console.log(`Updated "${THEATRE_NAME}" for ${movie.name} to ${TOTAL_SEATS} seats.`);
        continue;
      }
      await Theatre.create({
        name: THEATRE_NAME,
        movieId: movie._id,
        seats,
        bookedSeats: [],
        image: venueImage,
      });
      console.log(`Added "${THEATRE_NAME}" (${TOTAL_SEATS} seats) for ${movie.name}.`);
    }
    console.log('Done.');
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
