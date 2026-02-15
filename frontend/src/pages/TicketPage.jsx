import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingsAPI } from '../services/api';

export default function TicketPage() {
  const { bookingId } = useParams();
  const { state } = useLocation();
  const { user } = useAuth();
  const [booking, setBooking] = useState(state?.booking || null);
  const [loading, setLoading] = useState(!state?.booking);
  const [error, setError] = useState('');

  useEffect(() => {
    if (booking?._id === bookingId) return;
    if (!user?._id) {
      setLoading(false);
      if (!booking) setError('Not logged in');
      return;
    }
    let cancelled = false;
    bookingsAPI
      .getByUser(user._id)
      .then(({ data }) => {
        const b = data.find((x) => x._id === bookingId);
        if (!cancelled) setBooking(b || null);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load ticket.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [bookingId, user?._id]);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 flex justify-center">
        <div className="w-12 h-12 border-2 border-carnival-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="bg-red-500/20 text-red-400 rounded-xl p-4">
          {error || 'Ticket not found.'}
        </div>
        <Link to="/my-tickets" className="mt-4 inline-block text-carnival-primary hover:underline">
          View My Tickets
        </Link>
      </div>
    );
  }

  const movie = booking.movieId || {};
  const theatre = booking.theatreId || {};

  return (
    <div className="max-w-lg mx-auto px-3 sm:px-4 py-4 sm:py-8 animate-fade-in">
      <div className="bg-carnival-card rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="p-4 sm:p-6 border-b border-white/10 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-carnival-primary">Cine Carnival</h1>
          <p className="text-white/60 text-xs sm:text-sm mt-1">Your e-ticket</p>
        </div>
        <div className="p-4 sm:p-6 flex flex-col items-center">
          {booking.qrCode ? (
            <img
              src={booking.qrCode}
              alt="Ticket QR Code"
              className="w-44 h-44 sm:w-56 sm:h-56 rounded-xl bg-white p-2"
            />
          ) : (
            <div className="w-44 h-44 sm:w-56 sm:h-56 rounded-xl bg-white/10 flex items-center justify-center text-white/50 text-sm">
              No QR
            </div>
          )}
          <div className="mt-4 sm:mt-6 w-full space-y-2 sm:space-y-3 text-center sm:text-left text-sm sm:text-base">
            <p><span className="text-white/50">Movie</span> <span className="font-medium">{movie.name}</span></p>
            <p><span className="text-white/50">Theatre</span> <span className="font-medium">{theatre.name}</span></p>
            {movie.showTime && <p><span className="text-white/50">Show</span> <span className="font-medium">{movie.showTime}</span></p>}
            <p><span className="text-white/50">Seats</span> <span className="font-medium">{booking.seats?.join(', ') || '—'}</span></p>
            <p><span className="text-white/50">Amount</span> <span className="font-medium">₹{(booking.seats?.length || 0) * (movie.ticketPrice ?? 69)}</span></p>
            <p><span className="text-white/50">Booking ID</span> <span className="font-mono text-sm">{booking._id}</span></p>
            <p><span className="text-white/50">Date</span> <span className="font-medium">{new Date(booking.bookingDate).toLocaleString()}</span></p>
          </div>
        </div>
      </div>
      <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
        <Link
          to="/my-tickets"
          className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition text-center touch-manipulation min-h-[44px] flex items-center justify-center"
        >
          My Tickets
        </Link>
        <Link
          to="/"
          className="px-6 py-3 rounded-lg bg-carnival-primary hover:bg-red-600 transition text-center touch-manipulation min-h-[44px] flex items-center justify-center"
        >
          Book Another
        </Link>
      </div>
    </div>
  );
}
