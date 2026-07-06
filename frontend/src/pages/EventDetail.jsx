import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/events/${id}`).then((res) => setEvent(res.data)).catch(console.error);
  }, [id]);

  if (!event) return <p className="text-center mt-10 text-gray-400">Loading...</p>;

  const isTravel = event.category_name === 'bus' || event.category_name === 'train';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {event.image_url && (
          <img src={event.image_url} alt={event.title} className="w-full md:w-64 rounded-lg object-cover" />
        )}
        <div>
          <span className="text-xs uppercase font-semibold text-indiagreen">{event.category_name}</span>
          <h1 className="text-2xl font-bold">{event.title}</h1>
          {isTravel && <p className="text-gray-600 mt-1">{event.source} → {event.destination}</p>}
          {event.language && <p className="text-gray-500 text-sm">Language: {event.language}</p>}
          {event.duration_minutes && (
            <p className="text-gray-500 text-sm">Duration: {Math.floor(event.duration_minutes / 60)}h {event.duration_minutes % 60}m</p>
          )}
          <p className="text-gray-600 mt-2">{event.description}</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold mt-8 mb-3">Select a Showtime</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {event.shows.map((show) => (
          <button
            key={show.id}
            onClick={() => navigate(`/seats/${show.id}`)}
            className="border rounded-lg p-4 text-left hover:border-saffron hover:shadow"
          >
            <p className="font-medium">{show.venue_name}</p>
            <p className="text-sm text-gray-500">
              {new Date(show.show_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
              {' • '}{show.show_time.slice(0, 5)}
            </p>
            <p className="text-sm text-saffron font-semibold mt-1">From ₹{show.base_price}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
