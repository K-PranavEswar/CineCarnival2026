import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { theatresAPI, moviesAPI } from "../services/api";
import { MapPin, Info, ChevronRight, Sparkles, Clock } from "lucide-react";

export default function TheatreSelection() {
  const { movieId } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [theatres, setTheatres] = useState([]);
  const [selectedDate, setSelectedDate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      moviesAPI.getAll().then((r) => r.data.find((m) => m._id === movieId)),
      theatresAPI.getByMovie(movieId).then((r) => r.data),
    ])
      .then(([m, t]) => {
        if (cancelled) return;
        setMovie(m || null);
        setTheatres(t || []);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.response?.data?.message || "Failed to load");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => (cancelled = true);
  }, [movieId]);

  if (loading) return <LoadingState />;
  if (error || !movie) return <ErrorState message={error} />;

  return (
    <div className="min-h-screen bg-[#060607] text-white font-sans">
      {/* HERO SECTION - Responsive height and padding */}
      <section className="relative h-[45vh] md:h-[60vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/60 to-[#060607] z-10" />

        <img
          src={movie.banner || movie.poster}
          className="w-full h-full object-cover opacity-30 blur-xl scale-110"
          alt="background"
        />

        <div className="absolute bottom-6 md:bottom-12 left-0 right-0 z-20 max-w-6xl mx-auto px-4 md:px-6 flex gap-4 md:gap-8 items-end">
          {/* Desktop Poster */}
          <div className="hidden md:block relative shrink-0">
            <img
              src={movie.poster}
              className="w-40 lg:w-48 h-60 lg:h-72 object-cover rounded-2xl border border-white/10 shadow-2xl"
              alt="poster"
            />
            <div className="absolute -top-3 -right-3 bg-[#e11d48] text-black p-2 rounded-xl">
              <Sparkles size={18} />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex gap-2 mb-2 md:mb-4 flex-wrap">
              <Badge text={movie.language} primary />
              <Badge text={movie.duration} icon={<Clock size={12} />} />
              <Badge text="2D" />
            </div>

            {/* Title: Smaller on mobile, massive on desktop */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black italic uppercase leading-none truncate">
              {movie.name}
            </h1>

            <p className="mt-2 md:mt-4 text-slate-400 max-w-xl text-xs md:text-sm line-clamp-2 md:line-clamp-none">
              {movie.description}
            </p>
          </div>
        </div>
      </section>

      {/* CAST SECTION - 3 items per row on mobile */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <h2 className="text-lg md:text-xl font-bold mb-6 flex items-center gap-2 md:gap-3 uppercase tracking-wider">
          <span className="w-1.5 h-6 md:w-2 md:h-8 bg-[#e11d48] rounded-full" />
          Cast
        </h2>

        {movie.cast && movie.cast.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-6">
            {movie.cast.map((c, i) => (
              <div key={i} className="group">
                <div className="overflow-hidden rounded-xl md:rounded-2xl border border-white/5 aspect-[3/4] bg-white/5">
                  <img
                    src={c.image}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    alt={c.name}
                  />
                </div>
                <p className="mt-2 font-bold text-[11px] md:text-sm truncate">
                  {c.name}
                </p>
                <p className="text-[10px] md:text-xs text-slate-500 truncate">
                  {c.role}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No cast information available</p>
        )}
      </section>

      {/* STICKY DATE SELECTOR - Responsive sizing */}
      <nav className="sticky top-0 bg-[#060607]/90 backdrop-blur-md border-y border-white/5 z-40">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4 flex gap-2 md:gap-4 overflow-x-auto no-scrollbar">
          {["Today", "Tomorrow", "18 Feb", "19 Feb", "20 Feb"].map((d, i) => (
            <button
              key={i}
              onClick={() => setSelectedDate(i)}
              className={`px-4 md:px-6 py-2 md:py-3 rounded-xl border text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
                selectedDate === i
                  ? "bg-[#e11d48] text-white border-[#e11d48]"
                  : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </nav>

      {/* THEATRE LIST */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="flex justify-between items-end mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-bold flex gap-2 md:gap-3 items-center uppercase tracking-wider">
            <span className="w-1.5 h-6 md:w-2 md:h-8 bg-[#e11d48] rounded-full" />
            Theatres
          </h2>
          <span className="text-gray-500 text-[10px] md:text-sm font-medium">
            Found {theatres.length} venues
          </span>
        </div>

        {theatres.length === 0 ? (
          <div className="text-center text-gray-500 py-20 border border-dashed border-white/10 rounded-3xl">
            No shows available for this date
          </div>
        ) : (
          <div className="grid gap-4 md:gap-6">
            {theatres.map((t) => {
              const total = t.seats?.flat().length || 100;
              const booked = t.bookedSeats?.length || 0;
              const available = total - booked;
              const percent = (booked / total) * 100;

              return (
                <TheatreCard
                  key={t._id}
                  theatre={t}
                  available={available}
                  percent={percent}
                  showTime={movie.showTime}
                  onClick={() => navigate(`/movie/${movieId}/theatre/${t._id}/seats`)}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function Badge({ text, primary, icon }) {
  return (
    <span
      className={`flex items-center gap-1 px-2 md:px-3 py-1 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider ${
        primary
          ? "bg-[#e11d48] text-white"
          : "bg-white/10 text-white/70 border border-white/10"
      }`}
    >
      {icon}
      {text}
    </span>
  );
}

function TheatreCard({ theatre, available, percent, showTime, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 hover:bg-white/[0.08] hover:border-[#e11d48]/50 transition-all"
    >
      <div className="flex items-center gap-4 md:gap-6">
        <div className="p-3 md:p-4 bg-white/5 rounded-2xl text-[#e11d48] group-hover:scale-110 transition">
          <MapPin size={20} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base md:text-2xl font-bold truncate group-hover:text-[#e11d48] transition">
            {theatre.name}
          </h3>
          <p className="text-[10px] md:text-sm text-gray-500 mt-0.5 md:mt-1 font-medium">
            {available} seats available
          </p>
          <div className="w-full h-1.5 md:h-2 bg-white/10 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-[#e11d48] rounded-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="text-[9px] md:text-xs text-gray-500 uppercase font-bold tracking-tighter">
            Standard
          </p>
          <p className="text-lg md:text-2xl font-black text-white">
            {showTime || "10:30 AM"}
          </p>
        </div>

        <ChevronRight className="text-gray-600 hidden sm:block" />
      </div>
    </button>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-[#060607] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#e11d48] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="min-h-screen bg-[#060607] flex flex-col items-center justify-center text-[#e11d48] p-6 text-center">
      <Info size={48} className="mb-4 opacity-50" />
      <p className="text-xl font-bold">{message || "Something went wrong"}</p>
      <button 
        onClick={() => window.location.reload()}
        className="mt-6 px-6 py-2 bg-white/10 text-white rounded-xl text-sm"
      >
        Try Again
      </button>
    </div>
  );
}