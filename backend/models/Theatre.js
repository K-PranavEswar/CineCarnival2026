import mongoose from 'mongoose';

const theatreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true,
  },
  seats: {
    type: [[String]],
    required: true,
    default: [],
  },
  bookedSeats: {
    type: [String],
    default: [],
  },
  image: {
    type: String,
    default: '',
  },
}, { timestamps: true });

export default mongoose.model('Theatre', theatreSchema);
