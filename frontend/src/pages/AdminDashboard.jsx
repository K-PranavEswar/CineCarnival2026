import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { moviesAPI, theatresAPI, bookingsAPI } from '../services/api';

export default function AdminDashboard() {
  const [tab, setTab] = useState('movies');
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [editSeats, setEditSeats] = useState([]);
  const [editError, setEditError] = useState('');
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = useAuth();

  // Add movie form
  const [movieForm, setMovieForm] = useState({
    name: '',
    poster: '',
    description: '',
    duration: '',
    language: '',
    rating: '',
    ticketPrice: '69',
    showTime: '',
  });

  // Add theatre form
  const [theatreForm, setTheatreForm] = useState({
    name: '',
    movieId: '',
    rows: 5,
    seatsPerRow: 10,
  });
  const [theatreSubmitError, setTheatreSubmitError] = useState('');
  const [movieSubmitError, setMovieSubmitError] = useState('');

  const loadMovies = () => moviesAPI.getAll().then(({ data }) => { setMovies(data || []); return data || []; });
  const loadTheatres = (moviesList) => {
    const list = moviesList || movies;
    if (!list?.length) return setTheatres([]);
    return Promise.all(list.map((m) => theatresAPI.getByMovie(m._id).then(({ data }) => data)))
      .then((arr) => setTheatres(arr.flat()));
  };
  const loadBookings = () => bookingsAPI.getAll().then(({ data }) => setBookings(data || []));

  useEffect(() => {
    let cancelled = false;
    if (authLoading) return;
    if (!isAdmin) {
      navigate('/login', { replace: true });
      return () => { cancelled = true; };
    }
    loadMovies()
      .then((moviesList) => loadTheatres(moviesList))
      .then(() => loadBookings())
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [authLoading, isAdmin, navigate]);

  useEffect(() => {
    if (tab === 'bookings') loadBookings();
  }, [tab]);

  const handleAddMovie = async (e) => {
    e.preventDefault();
    setMovieSubmitError('');
    try {
      await moviesAPI.create({
        ...movieForm,
        rating: movieForm.rating ? parseFloat(movieForm.rating) : 0,
        ticketPrice: movieForm.ticketPrice ? Number(movieForm.ticketPrice) : 69,
        showTime: movieForm.showTime || '',
      });
      setMovieForm({ name: '', poster: '', description: '', duration: '', language: '', rating: '', ticketPrice: '69', showTime: '' });
      await loadMovies();
    } catch (err) {
      setMovieSubmitError(err.response?.data?.message || 'Failed to add movie.');
    }
  };

  const handleAddTheatre = async (e) => {
    e.preventDefault();
    setTheatreSubmitError('');
    if (!theatreForm.movieId) {
      setTheatreSubmitError('Select a movie.');
      return;
    }
    const rows = Math.max(1, Math.min(20, Number(theatreForm.rows) || 5));
    const seatsPerRow = Math.max(1, Math.min(30, Number(theatreForm.seatsPerRow) || 10));
    const rowLetters = 'ABCDEFGHIJKLMNOPQRST';
    const seats = Array.from({ length: rows }, (_, i) =>
      Array.from({ length: seatsPerRow }, (_, j) => `${rowLetters[i]}${j + 1}`)
    );
    try {
      await theatresAPI.create({
        name: theatreForm.name,
        movieId: theatreForm.movieId,
        seats,
      });
      setTheatreForm({ name: '', movieId: '', rows: 5, seatsPerRow: 10 });
      await loadTheatres();
    } catch (err) {
      setTheatreSubmitError(err.response?.data?.message || 'Failed to add theatre.');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    try {
      setEditError('');
      await bookingsAPI.delete(bookingId);
      await loadBookings();
    } catch (err) {
      console.error('Delete booking error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to delete booking.';
      setEditError(msg);
    }
  };

  const handleEditSeats = (booking) => {
    setEditingBookingId(booking._id);
    setEditSeats(booking.seats || []);
    setEditError('');
  };

  const handleUpdateSeats = async (bookingId) => {
    if (!editSeats.length) {
      setEditError('Select at least one seat.');
      return;
    }
    try {
      await bookingsAPI.updateSeats(bookingId, { newSeats: editSeats });
      setEditingBookingId(null);
      await loadBookings();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update booking seats.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 flex justify-center">
        <div className="w-12 h-12 border-2 border-carnival-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="flex gap-2 mb-6 border-b border-white/10">
        {['movies', 'theatres', 'bookings'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-t-lg font-medium capitalize transition ${
              tab === t ? 'bg-carnival-primary text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'movies' && (
        <div className="space-y-6">
          <form onSubmit={handleAddMovie} className="bg-carnival-card rounded-xl p-6 border border-white/10">
            <h2 className="text-lg font-semibold mb-4">Add Movie</h2>
            {movieSubmitError && (
              <div className="mb-4 p-2 rounded bg-red-500/20 text-red-400 text-sm">{movieSubmitError}</div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Movie name"
                value={movieForm.name}
                onChange={(e) => setMovieForm((f) => ({ ...f, name: e.target.value }))}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40"
                required
              />
              <input
                type="text"
                placeholder="Poster URL"
                value={movieForm.poster}
                onChange={(e) => setMovieForm((f) => ({ ...f, poster: e.target.value }))}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40"
                required
              />
              <input
                type="text"
                placeholder="Duration (e.g. 2h 30m)"
                value={movieForm.duration}
                onChange={(e) => setMovieForm((f) => ({ ...f, duration: e.target.value }))}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40"
                required
              />
              <input
                type="text"
                placeholder="Language"
                value={movieForm.language}
                onChange={(e) => setMovieForm((f) => ({ ...f, language: e.target.value }))}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40"
                required
              />
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                placeholder="Rating (0-10)"
                value={movieForm.rating}
                onChange={(e) => setMovieForm((f) => ({ ...f, rating: e.target.value }))}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40"
              />
              <input
                type="number"
                min="1"
                placeholder="Ticket price (₹)"
                value={movieForm.ticketPrice}
                onChange={(e) => setMovieForm((f) => ({ ...f, ticketPrice: e.target.value }))}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40"
              />
              <input
                type="text"
                placeholder="Show time (e.g. 9:30 AM - 12:30 PM)"
                value={movieForm.showTime}
                onChange={(e) => setMovieForm((f) => ({ ...f, showTime: e.target.value }))}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40"
              />
              <textarea
                placeholder="Description"
                value={movieForm.description}
                onChange={(e) => setMovieForm((f) => ({ ...f, description: e.target.value }))}
                className="sm:col-span-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40"
                rows={2}
              />
            </div>
            <button type="submit" className="mt-4 px-6 py-2 rounded-lg bg-carnival-primary font-medium">
              Add Movie
            </button>
          </form>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {movies.map((m) => (
              <div key={m._id} className="bg-carnival-card rounded-xl border border-white/10 p-4">
                <img src={m.poster} alt={m.name} className="w-full aspect-[2/3] object-cover rounded-lg" />
                <p className="font-medium mt-2 truncate">{m.name}</p>
                <p className="text-sm text-white/50">{m.duration} • {m.language} • ₹{m.ticketPrice ?? 69}</p>
                {m.showTime && <p className="text-sm text-amber-400/80">{m.showTime}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'theatres' && (
        <div className="space-y-6">
          <form onSubmit={handleAddTheatre} className="bg-carnival-card rounded-xl p-6 border border-white/10">
            <h2 className="text-lg font-semibold mb-4">Add Theatre</h2>
            {theatreSubmitError && (
              <div className="mb-4 p-2 rounded bg-red-500/20 text-red-400 text-sm">{theatreSubmitError}</div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Theatre name"
                value={theatreForm.name}
                onChange={(e) => setTheatreForm((f) => ({ ...f, name: e.target.value }))}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40"
                required
              />
              <select
                value={theatreForm.movieId}
                onChange={(e) => setTheatreForm((f) => ({ ...f, movieId: e.target.value }))}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
              >
                <option value="">Select movie</option>
                {movies.map((m) => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                max="20"
                placeholder="Rows"
                value={theatreForm.rows}
                onChange={(e) => setTheatreForm((f) => ({ ...f, rows: e.target.value }))}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40"
              />
              <input
                type="number"
                min="1"
                max="30"
                placeholder="Seats per row"
                value={theatreForm.seatsPerRow}
                onChange={(e) => setTheatreForm((f) => ({ ...f, seatsPerRow: e.target.value }))}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40"
              />
            </div>
            <button type="submit" className="mt-4 px-6 py-2 rounded-lg bg-carnival-primary font-medium">
              Add Theatre
            </button>
          </form>
          <div className="space-y-2">
            {theatres.map((t) => (
              <div key={t._id} className="flex justify-between items-center bg-carnival-card rounded-lg px-4 py-3 border border-white/10">
                <span className="font-medium">{t.name}</span>
                <span className="text-white/50 text-sm">
                  {t.movieId?.name || t.movieId} • {t.seats?.flat().length || 0} seats • {t.bookedSeats?.length || 0} booked
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'bookings' && (
        <div className="space-y-3">
          {editError && (
            <div className="p-3 rounded-lg bg-red-500/20 text-red-400 text-sm">{editError}</div>
          )}
          {bookings.length === 0 ? (
            <p className="text-white/50">No bookings yet.</p>
          ) : (
            bookings.map((b) => (
              <div key={b._id} className="bg-carnival-card rounded-xl p-4 border border-white/10">
                {editingBookingId === b._id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Edit Seats</label>
                      <input
                        type="text"
                        value={editSeats.join(', ')}
                        onChange={(e) => setEditSeats(e.target.value.split(',').map((s) => s.trim()))}
                        placeholder="e.g., A1, A2, B5"
                        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateSeats(b._id)}
                        className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingBookingId(null)}
                        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{b.movieId?.name}</p>
                        <p className="text-sm text-white/60">{b.theatreId?.name} • {b.seats?.join(', ')}</p>
                        <p className="text-xs text-white/40">{b.userId?.name || b.userId?.email} • {new Date(b.bookingDate).toLocaleString()}</p>
                      </div>
                      {b.isPaid && <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded">Paid</span>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditSeats(b)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-medium"
                      >
                        Edit Seats
                      </button>
                      <button
                        onClick={() => handleDeleteBooking(b._id)}
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
