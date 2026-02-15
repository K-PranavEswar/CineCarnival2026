import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { theatresAPI, moviesAPI, bookingsAPI } from '../services/api';
import { ChevronLeft, Armchair, IndianRupee, Info } from 'lucide-react';

export default function SeatSelection() {
  const { movieId, theatreId } = useParams();
  const navigate = useNavigate();
  
  // --- STATE ---
  const [movie, setMovie] = useState(null);
  const [theatre, setTheatre] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');

  // --- DATA INITIALIZATION ---
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const [moviesRes, theatreRes] = await Promise.all([
          moviesAPI.getAll(),
          theatresAPI.getByMovie(movieId)
        ]);
        if (!cancelled) {
          const currentMovie = moviesRes.data.find((m) => m._id === movieId);
          const currentTheatre = theatreRes.data.find((t) => t._id === theatreId);
          setMovie(currentMovie || null);
          setTheatre(currentTheatre || null);
        }
      } catch (err) {
        if (!cancelled) setError('Failed to load auditorium layout.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [movieId, theatreId]);

  const bookedSet = new Set(theatre?.bookedSeats || []);
  const seatsGrid = theatre?.seats || []; 
  const ticketPrice = movie?.ticketPrice ?? 150;

  // --- HANDLERS ---
  const toggleSeat = (seatId) => {
    if (bookedSet.has(seatId)) return;
    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((s) => s !== seatId) : [...prev, seatId]
    );
  };

  const handleBook = async () => {
    if (selectedSeats.length === 0) return;
    setError('');
    setBookingLoading(true);

    const loadScript = (src) => new Promise((resolve) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

    try {
      const { data } = await bookingsAPI.createOrder({ movieId, theatreId, seats: selectedSeats });
      const { order, bookingId } = data;

      const ok = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!ok) throw new Error('Payment gateway failed to load.');

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
        amount: order.amount,
        currency: order.currency,
        name: 'Cine Carnival',
        description: `${movie?.name} - ${selectedSeats.length} Tickets`,
        order_id: order.id,
        handler: async function (response) {
          try {
            setBookingLoading(true);
            const verifyRes = await bookingsAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId,
            });
            navigate(`/ticket/${verifyRes.data._id}`, { 
              replace: true, 
              state: { booking: verifyRes.data } 
            });
          } catch (err) {
            setError('Payment verification failed. Check "My Tickets".');
          } finally {
            setBookingLoading(false);
          }
        },
        prefill: {
          email: JSON.parse(localStorage.getItem('user'))?.email || '',
        },
        theme: { color: '#F97316' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.message || 'Failed to initiate booking.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#0a0a0b]">
      <div className="w-10 h-10 border-4 border-carnival-primary/20 border-t-carnival-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white flex flex-col font-sans">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#0a0a0b]/90 backdrop-blur-xl border-b border-white/5 p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 className="font-black text-lg uppercase italic tracking-tight">{movie?.name}</h1>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{theatre?.name}</p>
            </div>
          </div>
          <div className="text-right">
             <p className="text-carnival-primary font-black text-xl leading-none">₹{ticketPrice}</p>
             <p className="text-[8px] text-white/30 uppercase mt-1">Per Ticket</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pt-10 pb-40 px-4">
        {/* CINEMATIC SCREEN */}
        <div className="max-w-3xl mx-auto mb-20 relative">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[90%] h-24 bg-carnival-primary/10 blur-[80px] rounded-[100%] opacity-50" />
          <svg className="w-full h-8 drop-shadow-[0_0_15px_rgba(249,115,22,0.8)]" viewBox="0 0 400 20">
            <path d="M 30 20 Q 200 0 370 20" fill="none" stroke="#F97316" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <p className="text-center text-[10px] tracking-[1em] text-white/20 mt-6 uppercase font-black">All eyes this way</p>
        </div>

        {/* 9+9 SEAT GRID */}
        
        <div className="overflow-x-auto pb-10 scrollbar-hide">
          <div className="inline-flex flex-col gap-3 min-w-full items-center px-10">
            {seatsGrid.map((row, rowIndex) => {
              // Exact 9-seat split logic
              const leftBlock = row.slice(0, 9);
              const rightBlock = row.slice(9, 18);

              return (
                <div key={rowIndex} className="flex items-center group">
                  {/* Left Row Identifier */}
                  <span className="w-8 text-[11px] font-black text-white/10 group-hover:text-carnival-primary transition-colors text-right mr-4">
                    {String.fromCharCode(65 + rowIndex)}
                  </span>
                  
                  {/* LEFT WING */}
                  <div className="flex gap-2">
                    {leftBlock.map((seatId) => (
                      <SeatItem key={seatId} seatId={seatId} isBooked={bookedSet.has(seatId)} isSelected={selectedSeats.includes(seatId)} onToggle={toggleSeat} />
                    ))}
                  </div>

                  {/* CENTRAL AISLE (BLACK SPACE) */}
                  <div className="w-12 sm:w-24 h-10 flex items-center justify-center">
                    <div className="w-px h-full bg-white/5" />
                  </div>

                  {/* RIGHT WING */}
                  <div className="flex gap-2">
                    {rightBlock.map((seatId) => (
                      <SeatItem key={seatId} seatId={seatId} isBooked={bookedSet.has(seatId)} isSelected={selectedSeats.includes(seatId)} onToggle={toggleSeat} />
                    ))}
                  </div>

                  {/* Right Row Identifier */}
                  <span className="w-8 text-[11px] font-black text-white/10 group-hover:text-carnival-primary transition-colors ml-4">
                    {String.fromCharCode(65 + rowIndex)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* LEGEND */}
        <div className="flex justify-center flex-wrap gap-8 text-[10px] uppercase font-bold tracking-widest text-white/30 pt-12 border-t border-white/5 mt-10">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-white/10 rounded-md border border-white/5" /> <span>Available</span>
          </div>
          <div className="flex items-center gap-3 text-white/80">
            <div className="w-4 h-4 bg-carnival-primary rounded-md shadow-[0_0_10px_rgba(249,115,22,0.4)]" /> <span>Selected</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-white/5 rounded-md flex items-center justify-center">
               <Armchair size={10} className="opacity-10" />
            </div> <span>Sold Out</span>
          </div>
        </div>
      </main>

      {/* STICKY FOOTER */}
      <div className="fixed bottom-0 inset-x-0 bg-[#0a0a0b]/95 backdrop-blur-3xl border-t border-white/5 p-5 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-white/40 text-[10px] uppercase font-black tracking-widest mb-1">Tickets: {selectedSeats.length}</p>
            <h3 className="text-sm font-bold text-carnival-primary truncate">
              {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Pick your seats'}
            </h3>
          </div>
          
          <div className="text-right mr-6 shrink-0">
            <p className="text-white/40 text-[10px] uppercase font-black tracking-tighter">Amount Payable</p>
            <div className="flex items-center text-2xl font-black italic text-white leading-none">
              <IndianRupee size={20} strokeWidth={3} />
              <span>{selectedSeats.length * ticketPrice}</span>
            </div>
          </div>

          <button
            onClick={handleBook}
            disabled={selectedSeats.length === 0 || bookingLoading}
            className={`
              px-12 h-14 rounded-2xl font-black text-lg uppercase tracking-tight transition-all active:scale-95
              ${selectedSeats.length > 0 
                ? 'bg-carnival-primary text-black shadow-2xl shadow-carnival-primary/20 hover:brightness-110' 
                : 'bg-white/5 text-white/10 cursor-not-allowed'}
            `}
          >
            {bookingLoading ? (
              <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              'Confirm'
            )}
          </button>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full text-xs font-bold z-[100] shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-4">
          <Info size={14} /> {error}
          <button onClick={() => setError('')} className="ml-3 hover:opacity-70">✕</button>
        </div>
      )}
    </div>
  );
}

// SEAT COMPONENT
function SeatItem({ seatId, isBooked, isSelected, onToggle }) {
  return (
    <button
      disabled={isBooked}
      onClick={() => onToggle(seatId)}
      className={`
        relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 border border-white/5
        ${isBooked 
          ? 'bg-white/5 text-transparent cursor-not-allowed' 
          : isSelected 
            ? 'bg-carnival-primary text-black shadow-[0_0_20px_rgba(249,115,22,0.4)] scale-110 z-10 border-transparent' 
            : 'bg-white/10 hover:bg-white/20 text-white/20 hover:scale-105'
        }
      `}
    >
      <Armchair size={16} className={isBooked ? 'opacity-5' : 'opacity-100'} />
      {isSelected && (
        <span className="absolute -top-9 bg-carnival-primary text-black text-[9px] font-black px-2 py-1 rounded shadow-xl whitespace-nowrap animate-in slide-in-from-bottom-2">
          {seatId}
        </span>
      )}
    </button>
  );
}