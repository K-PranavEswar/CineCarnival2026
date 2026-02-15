import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { theatresAPI, moviesAPI } from '../services/api';
import { MapPin, Info, Users, ChevronRight, CalendarDays } from 'lucide-react';

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
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load details.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [movieId]);

  if (loading) return <LoadingState />;
  if (error || !movie) return <ErrorState message={error} />;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {/* 1. IMMERSIVE HERO HEADER */}
      <div className="relative h-[300px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a0b] z-10" />
        <img 
          src={movie.poster} 
          className="w-full h-full object-cover opacity-30 blur-xl scale-110" 
          alt="" 
        />
        
        <div className="absolute inset-0 z-20 flex items-end max-w-5xl mx-auto px-4 pb-6">
          <div className="flex gap-6 items-end w-full">
            <img
              src={movie.poster}
              className="hidden sm:block w-40 h-56 object-cover rounded-2xl shadow-2xl border border-white/10"
              alt={movie.name}
            />
            <div className="flex-1">
              <div className="flex gap-2 mb-2">
                 <span className="px-2 py-1 rounded bg-carnival-primary/20 text-carnival-primary text-[10px] font-bold uppercase">
                   {movie.language}
                 </span>
                 <span className="px-2 py-1 rounded bg-white/10 text-white/70 text-[10px] font-bold">
                   {movie.duration}
                 </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black uppercase italic tracking-tighter">
                {movie.name}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THEATRE LISTING SECTION */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Date Selector Placeholder (Crucial for UX) */}
        <div className="flex gap-3 mb-10 overflow-x-auto pb-2 scrollbar-hide">
          {['Today', 'Tomorrow', '18 Feb'].map((date, i) => (
            <button key={i} className={`flex-shrink-0 px-6 py-3 rounded-2xl border transition-all ${
              i === 0 ? 'bg-carnival-primary border-carnival-primary text-black font-bold' : 'bg-white/5 border-white/10 text-white/50'
            }`}>
              <p className="text-[10px] uppercase tracking-widest">{i === 0 ? 'Feb' : 'Feb'}</p>
              <p className="text-lg">{date}</p>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4">
          <h2 className="text-sm font-bold text-white/40 tracking-[0.2em] uppercase mb-2">Available Venues</h2>
          
          {theatres.length === 0 ? (
            <div className="bg-white/5 rounded-3xl p-12 text-center border border-dashed border-white/10">
              <Info className="mx-auto mb-4 text-white/20" size={40} />
              <p className="text-white/40 italic">No screenings scheduled for this date.</p>
            </div>
          ) : (
            theatres.map((t) => {
              const totalSeats = t.seats?.flat().length || 0;
              const bookedCount = t.bookedSeats?.length || 0;
              const available = totalSeats - bookedCount;
              const occupancyPercent = (bookedCount / totalSeats) * 100;

              return (
                <button
                  key={t._id}
                  onClick={() => navigate(`/movie/${movieId}/theatre/${t._id}/seats`)}
                  className="group relative w-full text-left bg-white/5 border border-white/10 rounded-3xl p-5 sm:p-7 hover:bg-white/[0.08] hover:border-carnival-primary/40 transition-all flex flex-col md:flex-row md:items-center gap-6"
                >
                  <div className="bg-carnival-primary/10 p-4 rounded-2xl text-carnival-primary group-hover:bg-carnival-primary group-hover:text-black transition-colors">
                    <MapPin size={24} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold">{t.name}</h3>
                      <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/40 font-mono italic">
                        4K • DOLBY 7.1
                      </span>
                    </div>
                    
                    {/* Occupancy Indicator */}
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${occupancyPercent > 80 ? 'bg-red-500' : 'bg-carnival-primary'}`}
                          style={{ width: `${occupancyPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-white/40 flex items-center gap-1">
                        <Users size={14} /> {available} seats left
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center justify-between md:justify-center gap-2 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8">
                    <div className="text-center">
                      <p className="text-[10px] uppercase text-white/30 font-bold tracking-tighter">Showtime</p>
                      <p className="text-xl font-black text-carnival-primary">{movie.showTime || "06:00 PM"}</p>
                    </div>
                    <ChevronRight className="text-white/20 group-hover:text-carnival-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-components for clean code
function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b]">
       <div className="w-16 h-16 border-4 border-carnival-primary/20 border-t-carnival-primary rounded-full animate-spin" />
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-red-500/10 border border-red-500/50 rounded-3xl p-8 text-center">
        <h2 className="text-xl font-bold text-red-500 mb-2">Oops!</h2>
        <p className="text-white/60 mb-6">{message || "Something went wrong while fetching the schedule."}</p>
        <button onClick={() => window.location.reload()} className="bg-white text-black px-6 py-2 rounded-full font-bold">Try Again</button>
      </div>
    </div>
  );
}