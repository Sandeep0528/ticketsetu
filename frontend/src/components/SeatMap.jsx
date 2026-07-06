import React from 'react';

export default function SeatMap({ seats, selectedSeats, onToggleSeat }) {
  // Group seats by row letter for grid layout
  const rows = {};
  seats.forEach((seat) => {
    const rowLetter = seat.seat_number.charAt(0);
    if (!rows[rowLetter]) rows[rowLetter] = [];
    rows[rowLetter].push(seat);
  });

  const getSeatClasses = (seat) => {
    if (seat.is_booked) return 'bg-gray-300 text-gray-400 cursor-not-allowed';
    if (selectedSeats.includes(seat.id)) return 'bg-indiagreen text-white';
    if (seat.seat_type === 'premium') return 'bg-yellow-100 border border-yellow-400 hover:bg-yellow-200';
    return 'bg-gray-50 border border-gray-300 hover:bg-saffron hover:text-white';
  };

  return (
    <div>
      <div className="flex justify-center mb-6">
        <div className="w-3/4 h-2 bg-gray-400 rounded-full" title="Screen / Front" />
      </div>
      <div className="space-y-2">
        {Object.keys(rows).sort().map((rowLetter) => (
          <div key={rowLetter} className="flex items-center gap-2 justify-center">
            <span className="w-5 text-xs text-gray-400">{rowLetter}</span>
            {rows[rowLetter].map((seat) => (
              <button
                key={seat.id}
                disabled={seat.is_booked}
                onClick={() => onToggleSeat(seat)}
                className={`w-8 h-8 text-xs rounded-md flex items-center justify-center transition ${getSeatClasses(seat)}`}
                title={`${seat.seat_number} - ₹${seat.price} (${seat.seat_type})`}
              >
                {seat.seat_number.slice(1)}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-6 mt-6 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-4 h-4 bg-gray-50 border border-gray-300 rounded" /> Available</span>
        <span className="flex items-center gap-1"><span className="w-4 h-4 bg-yellow-100 border border-yellow-400 rounded" /> Premium</span>
        <span className="flex items-center gap-1"><span className="w-4 h-4 bg-indiagreen rounded" /> Selected</span>
        <span className="flex items-center gap-1"><span className="w-4 h-4 bg-gray-300 rounded" /> Booked</span>
      </div>
    </div>
  );
}
