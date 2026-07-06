const pool = require('../config/db');

// GET /api/events?category=movie&city=Hyderabad
exports.getEvents = async (req, res) => {
  try {
    const { category, city, search } = req.query;
    let query = `
      SELECT e.*, c.name AS category_name
      FROM events e
      JOIN categories c ON e.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      query += ' AND c.name = ?';
      params.push(category);
    }
    if (city) {
      query += ' AND e.city = ?';
      params.push(city);
    }
    if (search) {
      query += ' AND e.title LIKE ?';
      params.push(`%${search}%`);
    }
    query += ' ORDER BY e.created_at DESC';

    const [events] = await pool.query(query, params);
    console.log('DB_NAME being used:', process.env.DB_NAME);
    console.log('Query:', query);
    console.log('Params:', params);
    console.log('Rows returned:', events.length)
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
};

// GET /api/events/:id  -> event details + its shows
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const [events] = await pool.query(
      `SELECT e.*, c.name AS category_name FROM events e
       JOIN categories c ON e.category_id = c.id WHERE e.id = ?`,
      [id]
    );
    if (events.length === 0) return res.status(404).json({ message: 'Event not found' });

    const [shows] = await pool.query(
      `SELECT * FROM shows WHERE event_id = ? ORDER BY show_date, show_time`,
      [id]
    );

    res.json({ ...events[0], shows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch event details' });
  }
};

// GET /api/shows/:showId/seats
exports.getShowSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    const [show] = await pool.query(
      `SELECT s.*, e.title, e.city FROM shows s JOIN events e ON s.event_id = e.id WHERE s.id = ?`,
      [showId]
    );
    if (show.length === 0) return res.status(404).json({ message: 'Show not found' });

    const [seats] = await pool.query(
      'SELECT id, seat_number, seat_type, price, is_booked FROM seats WHERE show_id = ? ORDER BY seat_number',
      [showId]
    );

    res.json({ show: show[0], seats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch seats' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM categories');
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};
