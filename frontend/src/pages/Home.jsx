import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import EventCard from '../components/EventCard';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/events')
      .then((res) => setEvents(res.data.slice(0, 8)))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    { key: 'movie', label: 'Movies', emoji: '🎬' },
    { key: 'bus', label: 'Buses', emoji: '🚌' },
    { key: 'train', label: 'Trains', emoji: '🚆' },
    { key: 'event', label: 'Events', emoji: '🎤' }
  ];

  return (
    <div>
      <div className="bg-gradient-to-r from-saffron to-indiagreen text-white py-16 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Book Your Next Journey or Show</h1>
        <p className="text-white/90">Movies, Buses, Trains & Events — all in one place.</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-lg shadow-lg grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
          {categories.map((c) => (
            <Link
              key={c.key}
              to={`/events?category=${c.key}`}
              className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50"
            >
              <span className="text-3xl">{c.emoji}</span>
              <span className="font-medium">{c.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-xl font-semibold mb-4">Popular Right Now</h2>
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {events.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
        )}
      </div>
    </div>
  );
}
