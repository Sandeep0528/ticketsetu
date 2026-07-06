import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const justBooked = location.state?.justBooked;

  const load = () => {
    api.get('/bookings/my').then((res) => setBookings(res.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    await api.post(`/bookings/${id}/cancel`);
    load();
  };

  if (loading) return <p className="text-center mt-10 text-gray-400">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold mb-6">My Bookings</h1>
      {justBooked && (
        <p className="bg-green-50 text-green-700 text-sm p-3 rounded mb-4">
          🎉 Booking confirmed! Reference: {justBooked}
        </p>
      )}
      {bookings.length === 0 ? (
        <p className="text-gray-400">No bookings yet.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <p className="font-semibold">{b.title}</p>
                <p className="text-sm text-gray-500">{b.venue_name}, {b.city}</p>
                <p className="text-sm text-gray-500">
                  {new Date(b.show_date).toLocaleDateString('en-IN')} • {b.show_time?.slice(0, 5)}
                </p>
                <p className="text-sm mt-1">
                  Ref: <span className="font-mono">{b.booking_ref}</span> • ₹{b.total_amount}
                </p>
                <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                  b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                  b.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {b.status}
                </span>
              </div>
              {b.qr_code && b.status === 'confirmed' && (
                <img src={b.qr_code} alt="Ticket QR" className="w-24 h-24" />
              )}
              {b.status === 'confirmed' && (
                <button
                  onClick={() => handleCancel(b.id)}
                  className="text-sm text-red-600 border border-red-200 rounded-md px-3 py-1.5 hover:bg-red-50"
                >
                  Cancel
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
