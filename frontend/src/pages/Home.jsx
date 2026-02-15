import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { moviesAPI } from '../services/api';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    moviesAPI
      .getAll()
      .then(({ data }) => {
        if (!cancelled) setMovies(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load movies.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center">
        <div className="w-12 h-12 border-2 border-carnival-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-red-500/20 text-red-400 rounded-xl p-4">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">SHOWS</h1>
      {movies.length === 0 ? (
        <div className="text-center py-12 sm:py-16 text-white/60 text-sm sm:text-base">
          No movies available. Check back later or add movies from Admin.
        </div>
      ) : (
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 items-stretch">
          {movies.map((movie) => (
            <Link
              key={movie._id}
              to={`/movie/${movie._id}/theatres`}
              className="group flex flex-col h-full bg-carnival-card rounded-xl overflow-hidden border border-white/10 hover:border-carnival-primary/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.99] shadow-lg hover:shadow-xl"
            >
              {/* Tile poster - consistent aspect across breakpoints */}
              <div className="relative aspect-[3/4] overflow-hidden bg-white/5 flex-shrink-0 max-h-[240px] min-[480px]:max-h-[280px] sm:max-h-none">
                <img
                  src={movie.poster || 'https://via.placeholder.com/400x600?text=No+Poster'}
                  alt={movie.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex flex-col gap-0.5 sm:gap-1 items-end">
                  {movie.showOrder === 1 && (
                    <span className="bg-green-600 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded">First Show</span>
                  )}
                  {movie.showOrder === 2 && (
                    <span className="bg-blue-600 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded">Second Show</span>
                  )}
                  <span className="bg-amber-500 text-black text-xs sm:text-sm font-bold px-1.5 sm:px-2 py-0.5 rounded">
                    {movie.rating || '—'}/10
                  </span>
                </div>
              </div>
              <div className="p-3 sm:p-4 flex flex-col flex-1 min-h-0">
                <h2 className="font-semibold text-base sm:text-lg truncate group-hover:text-carnival-primary transition">
                  {movie.name}
                </h2>
                <p className="text-xs sm:text-sm text-white/60 mt-0.5 sm:mt-1">{movie.duration} • {movie.language} • ₹{movie.ticketPrice ?? 69}/ticket</p>
                {movie.showTime && <p className="text-xs sm:text-sm text-amber-400/90 mt-0.5 sm:mt-1">Show: {movie.showTime}</p>}
                <p className="text-xs sm:text-sm text-white/50 mt-1 sm:mt-2 line-clamp-2">{movie.description}</p>
                <span className="inline-block mt-auto pt-2 sm:pt-3 text-carnival-primary text-xs sm:text-sm font-medium">
                  Book tickets →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
