import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import SeatMap from '../components/SeatMap';
import { useAuth } from '../context/AuthContext';

export default function SeatSelection() {
  const { showId } = useParams();
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/shows/${showId}/seats`).then((res) => setData(res.data)).catch(console.error);
  }, [showId]);

  const toggleSeat = (seat) => {
    setSelected((prev) =>
      prev.includes(seat.id) ? prev.filter((id) => id !== seat.id) : [...prev, seat.id]
    );
  };

  const totalAmount = data
    ? data.seats.filter((s) => selected.includes(s.id)).reduce((sum, s) => sum + parseFloat(s.price), 0)
    : 0;

  const handleBook = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (selected.length === 0) {
      setError('Please select at least one seat');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post('/bookings', { showId: Number(showId), seatIds: selected });
      navigate(`/payment/${res.data.bookingId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!data) return <p className="text-center mt-10 text-gray-400">Loading seats...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold">{data.show.title}</h1>
      <p className="text-sm text-gray-500 mb-6">
        {data.show.venue_name} • {new Date(data.show.show_date).toLocaleDateString('en-IN')} • {data.show.show_time.slice(0, 5)}
      </p>

      <SeatMap seats={data.seats} selectedSeats={selected} onToggleSeat={toggleSeat} />

      {error && <p className="text-red-600 text-sm text-center mt-4">{error}</p>}

      <div className="mt-8 border-t pt-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{selected.length} seat(s) selected</p>
          <p className="text-lg font-bold">₹{totalAmount.toFixed(2)}</p>
        </div>
        <button
          onClick={handleBook}
          disabled={submitting || selected.length === 0}
          className="bg-saffron text-white px-6 py-3 rounded-md font-medium hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? 'Booking...' : 'Proceed to Pay'}
        </button>
      </div>
    </div>
  );
}
