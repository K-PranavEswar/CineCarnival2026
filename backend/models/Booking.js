import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true,
  },
  theatreId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Theatre',
    required: true,
  },
  seats: {
    type: [String],
    required: true,
  },
  qrCode: {
    type: String,
    default: '',
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  payment: {
    orderId: { type: String, default: '' },
    paymentId: { type: String, default: '' },
    signature: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  },
  bookingDate: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);
