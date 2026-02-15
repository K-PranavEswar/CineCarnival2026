import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingsAPI } from '../services/api';

export default function MyTickets() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?._id) return;
    let cancelled = false;
    bookingsAPI
      .getByUser(user._id)
      .then(({ data }) => {
        if (!cancelled) setBookings(data || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load tickets.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [user?._id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex justify-center">
        <div className="w-12 h-12 border-2 border-carnival-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">My Tickets</h1>
      {error && (
        <div className="mb-3 sm:mb-4 p-3 rounded-lg bg-red-500/20 text-red-400 text-sm">{error}</div>
      )}
      {bookings.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-carnival-card rounded-xl border border-white/10 px-4">
          <p className="text-white/60 mb-4 text-sm sm:text-base">No bookings yet.</p>
          <Link to="/" className="text-carnival-primary hover:underline text-sm sm:text-base">Browse movies</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
          {bookings.map((b) => {
            const movie = b.movieId || {};
            const theatre = b.theatreId || {};
            return (
              <Link
                key={b._id}
                to={`/ticket/${b._id}`}
                className="block bg-carnival-card rounded-xl border border-white/10 hover:border-carnival-primary/50 overflow-hidden transition"
              >
                <div className="flex">
                  <div className="w-24 h-32 flex-shrink-0 bg-white/5 flex items-center justify-center p-2">
                    {b.qrCode ? (
                      <img src={b.qrCode} alt="QR" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-white/30 text-xs">QR</span>
                    )}
                  </div>
                  <div className="p-4 flex-1 min-w-0">
                    <h2 className="font-semibold truncate">{movie.name}</h2>
                    <p className="text-sm text-white/60">{theatre.name}</p>
                    {movie.showTime && <p className="text-sm text-amber-400/80">{movie.showTime}</p>}
                    <p className="text-sm text-white/50 mt-1">Seats: {b.seats?.join(', ') || '—'}</p>
                    <p className="text-xs text-white/40 mt-2">
                      {new Date(b.bookingDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
