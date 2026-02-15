import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { moviesAPI } from '../services/api';
import { Search, SlidersHorizontal, Star, Clock, Play } from 'lucide-react';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    moviesAPI.getAll()
      .then(({ data }) => { if (!cancelled) setMovies(data); })
      .catch((err) => { if (!cancelled) setError(err.response?.data?.message || 'Connection failed.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Filter movies based on search
  const filteredMovies = useMemo(() => {
    return movies.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [movies, searchQuery]);

  if (loading) return <HomeSkeleton />;

  return (
    <div className="min-h-screen pb-20">
      {/* 1. HERO FEATURED SECTION */}
      {movies.length > 0 && (
        <section className="relative h-[60vh] w-full overflow-hidden mb-12">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-transparent to-transparent z-10" />
          <img 
            src={movies[0].poster} 
            className="w-full h-full object-cover opacity-40 scale-105 blur-sm" 
            alt="featured"
          />
          <div className="absolute inset-0 flex flex-col justify-end px-4 sm:px-12 pb-12 z-20 max-w-7xl mx-auto">
            <span className="bg-carnival-primary text-black text-xs font-bold px-3 py-1 rounded-full w-fit mb-4">
              FEATURED RELEASE
            </span>
            <h1 className="text-4xl sm:text-6xl font-black mb-4 tracking-tighter uppercase italic">
              {movies[0].name}
            </h1>
            <div className="flex gap-4 items-center">
              <Link to={`/movie/${movies[0]._id}/theatres`} className="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-carnival-primary transition-colors">
                <Play size={18} fill="currentColor" /> Book Now
              </Link>
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4">
        {/* 2. SEARCH & FILTER BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="w-2 h-8 bg-carnival-primary rounded-full inline-block" />
              EXPLORE MOVIES
            </h2>
          </div>
          
          <div className="flex gap-2">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-carnival-primary transition-colors" size={18} />
              <input 
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 outline-none focus:border-carnival-primary/50 w-full md:w-64 transition-all"
              />
            </div>
            <button className="p-2.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition">
              <SlidersHorizontal size={20} />
            </button>
          </div>
        </div>

        {/* 3. MOVIE GRID */}
        {filteredMovies.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
            <p className="text-white/40 italic">No movies matched your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function MovieCard({ movie }) {
  return (
    <Link
      to={`/movie/${movie._id}/theatres`}
      className="group relative flex flex-col bg-white/5 rounded-2xl overflow-hidden border border-white/5 hover:border-carnival-primary/30 transition-all duration-500 hover:-translate-y-2 shadow-2xl"
    >
      {/* Rating Badge */}
      <div className="absolute top-3 left-3 z-30 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1">
        <Star size={12} className="text-amber-400 fill-amber-400" />
        <span className="text-xs font-bold text-white">{movie.rating || 'N/A'}</span>
      </div>

      {/* Poster Container */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={movie.poster}
          alt={movie.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-carnival-dark via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
           <span className="w-full py-2 bg-carnival-primary text-black text-center text-xs font-bold rounded-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
             QUICK BOOK
           </span>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 bg-gradient-to-b from-transparent to-black/20">
        <h3 className="font-bold text-base sm:text-lg mb-1 truncate leading-tight group-hover:text-carnival-primary transition-colors">
          {movie.name}
        </h3>
        <div className="flex items-center gap-3 text-[10px] sm:text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1"><Clock size={12}/> {movie.duration}</span>
          <span>•</span>
          <span>{movie.language}</span>
        </div>
        
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-carnival-primary font-bold text-sm">₹{movie.ticketPrice}</span>
            <span className="text-[10px] text-white/30 uppercase tracking-widest">{movie.showTime}</span>
        </div>
      </div>
    </Link>
  );
}

function HomeSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="h-8 w-48 bg-white/5 rounded-full mb-8 animate-pulse" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-[2/3] bg-white/5 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}