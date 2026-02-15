import 'dotenv/config';
import mongoose from 'mongoose';
import Movie from './models/Movie.js';

const movies = [
  {
    name: 'Rajamanikyam',
    poster: '/images/RAJAMANIKYAM.jpg',
    description: 'Rajamanikyam is a 2005 Indian Malayalam-language comedy film directed by Anwar Rasheed.',
    duration: '2h 45m',
    language: 'Malayalam',
    rating: 8.2,
    ticketPrice: 69,
    showTime: '9:30 AM - 12:30 PM',
    showOrder: 1,
  },
  {
    name: 'Chotta Mumbai',
    poster: '/images/CHOTTAMUMBAI.jpg',
    description: 'Chotta Mumbai is a 2007 Indian Malayalam-language action comedy film directed by Anwar Rasheed.',
    duration: '2h 35m',
    language: 'Malayalam',
    rating: 7.8,
    ticketPrice: 69,
    showTime: '1:30 PM - 4:00 PM',
    showOrder: 2,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const existing = await Movie.countDocuments({ name: { $in: movies.map((m) => m.name) } });
    if (existing > 0) {
      for (const m of movies) {
        await Movie.updateOne(
          { name: m.name },
          { $set: { showTime: m.showTime, showOrder: m.showOrder, poster: m.poster } }
        );
      }
      console.log('Updated show timings, order and poster paths for existing movies.');
      process.exit(0);
      return;
    }
    await Movie.insertMany(movies);
    console.log('Added movies: Rajamanikyam (9:30 AM–12:30 PM), Chotta Mumbai (1:30 PM–4:00 PM). Ticket price: ₹69 each.');
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
