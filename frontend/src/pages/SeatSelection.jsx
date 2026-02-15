import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { theatresAPI } from '../services/api';
import { moviesAPI } from '../services/api';
import { bookingsAPI } from '../services/api';

export default function SeatSelection() {
  const { movieId, theatreId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [theatre, setTheatre] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      moviesAPI.getAll().then(({ data }) => data.find((m) => m._id === movieId)),
      theatresAPI.getByMovie(movieId).then(({ data }) => data.find((t) => t._id === theatreId)),
    ])
      .then(([m, t]) => {
        if (!cancelled) {
          setMovie(m || null);
          setTheatre(t || null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [movieId, theatreId]);

  const bookedSet = new Set(theatre?.bookedSeats || []);
  const seatsGrid = theatre?.seats || [];

  const toggleSeat = (seatId) => {
    if (bookedSet.has(seatId)) return;
    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((s) => s !== seatId) : [...prev, seatId]
    );
  };

  const handleBook = async () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat.');
      return;
    }
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
      if (!ok) {
        setError('Failed to load payment gateway.');
        setBookingLoading(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
        amount: order.amount,
        currency: order.currency,
        name: movie?.name || 'Cine Carnival',
        description: `${selectedSeats.length} ticket(s)`,
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
            navigate(`/ticket/${verifyRes.data._id}`, { replace: true, state: { booking: verifyRes.data } });
          } catch (err) {
            setError(err.response?.data?.message || 'Payment verification failed.');
          } finally {
            setBookingLoading(false);
          }
        },
        prefill: {
          email: (JSON.parse(localStorage.getItem('user') || 'null') || {}).email || '',
        },
        theme: { color: '#F97316' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate payment.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex justify-center">
        <div className="w-12 h-12 border-2 border-carnival-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !bookingLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-red-500/20 text-red-400 rounded-xl p-4">
          {error}
        </div>
      </div>
    );
  }

  if (!movie || !theatre) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-red-500/20 text-red-400 rounded-xl p-4">Theatre not found.</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-bold">{movie.name}</h1>
          {movie.showOrder === 1 && <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded">First Show</span>}
          {movie.showOrder === 2 && <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded">Second Show</span>}
        </div>
        <p className="text-white/60 text-sm sm:text-base">{theatre.name}</p>
        {movie.showTime && <p className="text-amber-400/90 text-sm mt-1">Show: {movie.showTime}</p>}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 sm:gap-6 mb-4 sm:mb-6 text-xs sm:text-sm">
        <span className="flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-green-600" /> Available
        </span>
        <span className="flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-red-600 opacity-60" /> Booked
        </span>
        <span className="flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-amber-500" /> Selected
        </span>
      </div>

      {/* Screen */}
      <div className="text-center mb-4">
        <div className="inline-block px-8 py-2 bg-white/10 rounded-t-lg text-white/70 text-sm">
          SCREEN
        </div>
      </div>

      {/* Seat grid - touch-friendly seat size on mobile */}
      <div className="flex flex-col items-center gap-1.5 sm:gap-2 mb-6 sm:mb-8 overflow-x-auto max-w-full">
        {seatsGrid.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1.5 sm:gap-2 flex-wrap justify-center">
            {row.map((seatId) => {
              const isBooked = bookedSet.has(seatId);
              const isSelected = selectedSeats.includes(seatId);
              return (
                <button
                  key={seatId}
                  type="button"
                  onClick={() => toggleSeat(seatId)}
                  disabled={isBooked}
                  className={`
                    w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] rounded-lg text-[10px] sm:text-xs font-medium transition touch-manipulation
                    ${isBooked ? 'bg-red-600/60 cursor-not-allowed text-white/50' : ''}
                    ${!isBooked && !isSelected ? 'bg-green-600 hover:bg-green-500 text-white' : ''}
                    ${isSelected ? 'bg-amber-500 text-black' : ''}
                  `}
                >
                  {seatId}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {error && bookingLoading === false && (
        <div className="mb-3 sm:mb-4 p-3 rounded-lg bg-red-500/20 text-red-400 text-xs sm:text-sm">{error}</div>
      )}

      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <p className="text-white/80 text-sm sm:text-base truncate">
            Selected: <strong>{selectedSeats.length}</strong> seat(s) — {selectedSeats.join(', ') || '—'}
          </p>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            ₹{movie?.ticketPrice ?? 69} per ticket • Total: <strong>₹{selectedSeats.length * (movie?.ticketPrice ?? 69)}</strong>
          </p>
        </div>
        <button
          onClick={handleBook}
          disabled={bookingLoading || selectedSeats.length === 0}
          className="px-6 sm:px-8 py-3 rounded-lg bg-carnival-primary font-semibold text-white hover:bg-red-600 transition disabled:opacity-50 touch-manipulation min-h-[44px]"
        >
          {bookingLoading ? 'Booking...' : 'Book Now'}
        </button>
      </div>
    </div>
  );
}
