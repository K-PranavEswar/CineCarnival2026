import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  poster: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  duration: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 10,
  },
  ticketPrice: {
    type: Number,
    default: 69,
    min: 0,
  },
  showTime: {
    type: String,
    default: '',
  },
  showOrder: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

export default mongoose.model('Movie', movieSchema);
