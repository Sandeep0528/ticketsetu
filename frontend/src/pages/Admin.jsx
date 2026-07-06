import React, { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Admin() {
  const [categories, setCategories] = useState([]);
  const [eventForm, setEventForm] = useState({
    category_id: '', title: '', description: '', image_url: '',
    source: '', destination: '', language: '', duration_minutes: '', city: ''
  });
  const [showForm, setShowForm] = useState({
    event_id: '', venue_name: '', show_date: '', show_time: '', base_price: '', total_seats: 40
  });
  const [message, setMessage] = useState('');
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data));
    api.get('/admin/bookings').then((res) => setBookings(res.data)).catch(() => {});
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await api.post('/admin/events', eventForm);
      setMessage(`Event created (ID: ${res.data.eventId}). Use this ID to add a showtime below.`);
      setShowForm((f) => ({ ...f, event_id: res.data.eventId }));
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create event');
    }
  };

  const handleCreateShow = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/admin/shows', showForm);
      setMessage('Showtime created with seats generated automatically.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create show');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      {message && <p className="bg-blue-50 text-blue-700 text-sm p-3 rounded">{message}</p>}

      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="font-semibold mb-4">1. Add a New Listing</h2>
        <form onSubmit={handleCreateEvent} className="grid sm:grid-cols-2 gap-3">
          <select
            required
            className="border rounded-md px-3 py-2"
            value={eventForm.category_id}
            onChange={(e) => setEventForm({ ...eventForm, category_id: e.target.value })}
          >
            <option value="">Category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input placeholder="Title" required className="border rounded-md px-3 py-2"
            value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} />
          <input placeholder="City" required className="border rounded-md px-3 py-2"
            value={eventForm.city} onChange={(e) => setEventForm({ ...eventForm, city: e.target.value })} />
          <input placeholder="Image URL" className="border rounded-md px-3 py-2"
            value={eventForm.image_url} onChange={(e) => setEventForm({ ...eventForm, image_url: e.target.value })} />
          <input placeholder="Source (bus/train only)" className="border rounded-md px-3 py-2"
            value={eventForm.source} onChange={(e) => setEventForm({ ...eventForm, source: e.target.value })} />
          <input placeholder="Destination (bus/train only)" className="border rounded-md px-3 py-2"
            value={eventForm.destination} onChange={(e) => setEventForm({ ...eventForm, destination: e.target.value })} />
          <input placeholder="Language (movie only)" className="border rounded-md px-3 py-2"
            value={eventForm.language} onChange={(e) => setEventForm({ ...eventForm, language: e.target.value })} />
          <input placeholder="Duration (minutes)" type="number" className="border rounded-md px-3 py-2"
            value={eventForm.duration_minutes} onChange={(e) => setEventForm({ ...eventForm, duration_minutes: e.target.value })} />
          <textarea placeholder="Description" className="border rounded-md px-3 py-2 sm:col-span-2"
            value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} />
          <button className="sm:col-span-2 bg-saffron text-white py-2 rounded-md font-medium">Create Listing</button>
        </form>
      </section>

      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="font-semibold mb-4">2. Add a Showtime / Slot</h2>
        <form onSubmit={handleCreateShow} className="grid sm:grid-cols-2 gap-3">
          <input placeholder="Event ID" type="number" required className="border rounded-md px-3 py-2"
            value={showForm.event_id} onChange={(e) => setShowForm({ ...showForm, event_id: e.target.value })} />
          <input placeholder="Venue Name" required className="border rounded-md px-3 py-2"
            value={showForm.venue_name} onChange={(e) => setShowForm({ ...showForm, venue_name: e.target.value })} />
          <input type="date" required className="border rounded-md px-3 py-2"
            value={showForm.show_date} onChange={(e) => setShowForm({ ...showForm, show_date: e.target.value })} />
          <input type="time" required className="border rounded-md px-3 py-2"
            value={showForm.show_time} onChange={(e) => setShowForm({ ...showForm, show_time: e.target.value })} />
          <input placeholder="Base Price (₹)" type="number" required className="border rounded-md px-3 py-2"
            value={showForm.base_price} onChange={(e) => setShowForm({ ...showForm, base_price: e.target.value })} />
          <input placeholder="Total Seats" type="number" required className="border rounded-md px-3 py-2"
            value={showForm.total_seats} onChange={(e) => setShowForm({ ...showForm, total_seats: e.target.value })} />
          <button className="sm:col-span-2 bg-indiagreen text-white py-2 rounded-md font-medium">Create Showtime</button>
        </form>
      </section>

      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="font-semibold mb-4">All Bookings ({bookings.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-500 border-b">
              <tr><th className="py-2">Ref</th><th>User</th><th>Event</th><th>Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b">
                  <td className="py-2 font-mono">{b.booking_ref}</td>
                  <td>{b.user_name}</td>
                  <td>{b.title}</td>
                  <td>₹{b.total_amount}</td>
                  <td>{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
