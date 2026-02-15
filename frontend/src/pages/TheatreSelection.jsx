import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { theatresAPI } from '../services/api';
import { moviesAPI } from '../services/api';

export default function TheatreSelection() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      moviesAPI.getAll().then(({ data }) => data.find((m) => m._id === movieId)),
      theatresAPI.getByMovie(movieId).then(({ data }) => data),
    ])
      .then(([m, t]) => {
        if (!cancelled) {
          setMovie(m || null);
          setTheatres(t || []);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [movieId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex justify-center">
        <div className="w-12 h-12 border-2 border-carnival-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-red-500/20 text-red-400 rounded-xl p-4">
          {error || 'Movie not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8">
        <img
          src={movie.poster || 'https://via.placeholder.com/200x300?text=No+Poster'}
          alt={movie.name}
          className="w-24 h-32 sm:w-40 sm:h-56 object-cover rounded-xl border border-white/10 flex-shrink-0 mx-auto sm:mx-0"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold">{movie.name}</h1>
            {movie.showOrder === 1 && <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded">First Show</span>}
            {movie.showOrder === 2 && <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded">Second Show</span>}
          </div>
          <p className="text-white/60 text-sm sm:text-base mt-1">{movie.duration} • {movie.language}</p>
          {movie.showTime && <p className="text-amber-400/90 text-sm mt-1">Show: {movie.showTime}</p>}
          <p className="text-white/50 text-sm mt-2 line-clamp-3 sm:line-clamp-none">{movie.description}</p>
        </div>
      </div>
      {theatres.length > 0 && theatres.some((t) => t.image) && (
        <div className="mb-6 sm:mb-8">
          <p className="text-white/60 text-sm mb-2">Venue</p>
          <img
            src={theatres.find((t) => t.image)?.image || ''}
            alt="Main Auditorium"
            className="w-full max-h-48 sm:max-h-64 object-cover rounded-xl border border-white/10"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Select Theatre</h2>
      {theatres.length === 0 ? (
        <div className="text-white/60 py-6 sm:py-8 text-sm">No theatres for this movie yet.</div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {theatres.map((t) => (
            <button
              key={t._id}
              onClick={() => navigate(`/movie/${movieId}/theatre/${t._id}/seats`)}
              className="w-full text-left px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-carnival-card border border-white/10 hover:border-carnival-primary/50 hover:bg-white/5 transition flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 touch-manipulation"
            >
              <span className="font-medium text-sm sm:text-base">{t.name}</span>
              <span className="text-white/50 text-xs sm:text-sm">
                {t.seats?.flat().length || 0} seats • {(t.bookedSeats?.length || 0)} booked
              </span>
              <span className="text-carnival-primary text-sm">Select →</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
