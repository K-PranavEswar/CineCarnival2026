import Booking from '../models/Booking.js';
import Theatre from '../models/Theatre.js';
import Movie from '../models/Movie.js';
import QRCode from 'qrcode';
import Razorpay from 'razorpay';
import crypto from 'crypto';

export const createBooking = async (req, res) => {
  try {
    const { movieId, theatreId, seats } = req.body;
    const userId = req.user._id;

    if (!movieId || !theatreId || !seats?.length) {
      return res.status(400).json({ message: 'Movie, theatre and at least one seat are required.' });
    }

    const theatre = await Theatre.findById(theatreId);
    if (!theatre) {
      return res.status(404).json({ message: 'Theatre not found.' });
    }
    if (theatre.movieId.toString() !== movieId) {
      return res.status(400).json({ message: 'Theatre does not belong to this movie.' });
    }

    const flatSeats = theatre.seats.flat();
    const requestedSeats = Array.isArray(seats) ? seats : [seats];
    const invalidSeats = requestedSeats.filter((s) => !flatSeats.includes(s));
    if (invalidSeats.length) {
      return res.status(400).json({ message: `Invalid seat(s): ${invalidSeats.join(', ')}` });
    }

    const alreadyBooked = requestedSeats.filter((s) => theatre.bookedSeats.includes(s));
    if (alreadyBooked.length) {
      return res.status(400).json({ message: `Seat(s) already booked: ${alreadyBooked.join(', ')}` });
    }

    const movie = await Movie.findById(movieId);
    const movieName = movie?.name || 'Unknown';

    const booking = await Booking.create({
      userId,
      movieId,
      theatreId,
      seats: requestedSeats,
      qrCode: '',
      bookingDate: new Date(),
    });

    const qrPayload = JSON.stringify({
      bookingId: booking._id.toString(),
      movieName,
      theatreName: theatre.name,
      seatNumbers: requestedSeats,
      userId: userId.toString(),
    });
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 256, margin: 2 });
    booking.qrCode = qrDataUrl;
    await booking.save();

    theatre.bookedSeats.push(...requestedSeats);
    await theatre.save();

    const populated = await Booking.findById(booking._id)
      .populate('movieId', 'name poster duration language rating ticketPrice showTime showOrder')
      .populate('theatreId', 'name');

    const response = { ...populated.toObject(), qrCode: qrDataUrl };
    res.status(201).json(response);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Booking failed.' });
  }
};

export const createRazorpayOrder = async (req, res) => {
  try {
    const { movieId, theatreId, seats } = req.body;
    const userId = req.user._id;

    if (!movieId || !theatreId || !seats?.length) {
      return res.status(400).json({ message: 'Movie, theatre and at least one seat are required.' });
    }

    const theatre = await Theatre.findById(theatreId);
    if (!theatre) return res.status(404).json({ message: 'Theatre not found.' });
    if (theatre.movieId.toString() !== movieId) {
      return res.status(400).json({ message: 'Theatre does not belong to this movie.' });
    }

    const flatSeats = theatre.seats.flat();
    const requestedSeats = Array.isArray(seats) ? seats : [seats];
    const invalidSeats = requestedSeats.filter((s) => !flatSeats.includes(s));
    if (invalidSeats.length) {
      return res.status(400).json({ message: `Invalid seat(s): ${invalidSeats.join(', ')}` });
    }

    const alreadyBooked = requestedSeats.filter((s) => theatre.bookedSeats.includes(s));
    if (alreadyBooked.length) {
      return res.status(400).json({ message: `Seat(s) already booked: ${alreadyBooked.join(', ')}` });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ message: 'Movie not found.' });

    const amountPerSeat = movie.ticketPrice || 0;
    const amount = amountPerSeat * requestedSeats.length * 100; // paise

    console.log("ENV FILE LOADED:", process.env.RAZORPAY_KEY_ID);
console.log("ENV FILE LOADED SECRET:", process.env.RAZORPAY_KEY_SECRET);

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    // create a pending booking record to be confirmed after payment verification
    const booking = await Booking.create({
      userId,
      movieId,
      theatreId,
      seats: requestedSeats,
      qrCode: '',
      bookingDate: new Date(),
      isPaid: false,
      payment: { orderId: order.id, status: 'pending' },
    });

    res.status(201).json({ order, bookingId: booking._id });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to create order.' });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      return res.status(400).json({ message: 'Missing payment verification fields.' });
    }

    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature.' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    if (booking.payment?.orderId !== razorpay_order_id) {
      return res.status(400).json({ message: 'Order ID mismatch.' });
    }

    booking.isPaid = true;
    booking.payment = {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      status: 'paid',
    };

    // generate QR and mark seats
    const theatre = await Theatre.findById(booking.theatreId);
    const movie = await Movie.findById(booking.movieId);
    const movieName = movie?.name || 'Unknown';

    const qrPayload = JSON.stringify({
      bookingId: booking._id.toString(),
      movieName,
      theatreName: theatre?.name || '',
      seatNumbers: booking.seats,
      userId: booking.userId.toString(),
    });
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 256, margin: 2 });
    booking.qrCode = qrDataUrl;
    await booking.save();

    // update theatre bookedSeats
    if (theatre) {
      theatre.bookedSeats.push(...booking.seats);
      await theatre.save();
    }

    const populated = await Booking.findById(booking._id)
      .populate('movieId', 'name poster duration language rating ticketPrice showTime showOrder')
      .populate('theatreId', 'name');

    const response = { ...populated.toObject(), qrCode: qrDataUrl };
    res.json(response);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Payment verification failed.' });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not allowed to view these bookings.' });
    }
    const bookings = await Booking.find({ userId })
      .populate('movieId', 'name poster duration language rating ticketPrice showTime showOrder')
      .populate('theatreId', 'name')
      .sort({ bookingDate: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch bookings.' });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('movieId', 'name poster ticketPrice showTime showOrder')
      .populate('theatreId', 'name')
      .sort({ bookingDate: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch bookings.' });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    console.log('Delete requested for booking:', bookingId);
    console.log('User role:', req.user?.role);
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      console.log('Booking not found:', bookingId);
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Remove seats from theatre's bookedSeats
    const theatre = await Theatre.findById(booking.theatreId);
    if (theatre) {
      theatre.bookedSeats = theatre.bookedSeats.filter((s) => !booking.seats.includes(s));
      await theatre.save();
    }

    // Delete booking
    await Booking.findByIdAndDelete(bookingId);
    console.log('Booking deleted successfully:', bookingId);
    res.json({ message: 'Booking deleted successfully.' });
  } catch (err) {
    console.error('Delete booking error:', err);
    res.status(500).json({ message: err.message || 'Failed to delete booking.' });
  }
};

export const updateBookingSeats = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { newSeats } = req.body;

    if (!newSeats || !Array.isArray(newSeats) || newSeats.length === 0) {
      return res.status(400).json({ message: 'New seats are required and must be a non-empty array.' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    const theatre = await Theatre.findById(booking.theatreId);
    if (!theatre) {
      return res.status(404).json({ message: 'Theatre not found.' });
    }

    const flatSeats = theatre.seats.flat();
    const invalidSeats = newSeats.filter((s) => !flatSeats.includes(s));
    if (invalidSeats.length) {
      return res.status(400).json({ message: `Invalid seat(s): ${invalidSeats.join(', ')}` });
    }

    // Check if new seats (excluding current seats) are available
    const availableNewSeats = newSeats.filter((s) => !booking.seats.includes(s));
    const alreadyBooked = availableNewSeats.filter((s) => theatre.bookedSeats.includes(s));
    if (alreadyBooked.length) {
      return res.status(400).json({ message: `Seat(s) already booked: ${alreadyBooked.join(', ')}` });
    }

    // Update theatre bookedSeats: remove old, add new
    theatre.bookedSeats = theatre.bookedSeats.filter((s) => !booking.seats.includes(s));
    theatre.bookedSeats.push(...availableNewSeats);
    await theatre.save();

    // Update booking seats
    booking.seats = newSeats;
    await booking.save();

    // Regenerate QR code
    const movie = await Movie.findById(booking.movieId);
    const movieName = movie?.name || 'Unknown';
    const qrPayload = JSON.stringify({
      bookingId: booking._id.toString(),
      movieName,
      theatreName: theatre.name,
      seatNumbers: newSeats,
      userId: booking.userId.toString(),
    });
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 256, margin: 2 });
    booking.qrCode = qrDataUrl;
    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('movieId', 'name poster duration language rating ticketPrice showTime showOrder')
      .populate('theatreId', 'name');

    const response = { ...populated.toObject(), qrCode: qrDataUrl };
    res.json(response);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to update booking seats.' });
  }
};
