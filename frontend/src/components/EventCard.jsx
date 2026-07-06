import React from 'react';
import { Link } from 'react-router-dom';

export default function EventCard({ event }) {
  const subtitle =
    event.category_name === 'bus' || event.category_name === 'train'
      ? `${event.source} → ${event.destination}`
      : event.language || event.city;

  return (
    <Link
      to={`/event/${event.id}`}
      className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden block"
    >
      <img
        src={event.image_url || `https://picsum.photos/seed/${event.id}/300/400`}
        className="w-full h-48 object-cover"
      />
      <div className="p-3">
        <span className="text-xs uppercase font-semibold text-indiagreen">{event.category_name}</span>
        <h3 className="font-semibold text-gray-800 truncate">{event.title}</h3>
        <p className="text-sm text-gray-500">{subtitle}</p>
        <p className="text-xs text-gray-400 mt-1">{event.city}</p>
      </div>
    </Link>
  );
}
