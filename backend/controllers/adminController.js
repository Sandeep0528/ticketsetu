const pool = require('../config/db');

// POST /api/admin/events
exports.createEvent = async (req, res) => {
  try {
    const { category_id, title, description, image_url, source, destination, language, duration_minutes, city } = req.body;
    if (!category_id || !title || !city) {
      return res.status(400).json({ message: 'category_id, title, and city are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO events (category_id, title, description, image_url, source, destination, language, duration_minutes, city)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [category_id, title, description || null, image_url || null, source || null, destination || null, language || null, duration_minutes || null, city]
    );

    res.status(201).json({ message: 'Event created', eventId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create event' });
  }
};

// POST /api/admin/shows  { event_id, venue_name, show_date, show_time, base_price, total_seats, premium_rows }
// Auto-generates seat rows A-Z as needed.
exports.createShow = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { event_id, venue_name, show_date, show_time, base_price, total_seats } = req.body;
    if (!event_id || !venue_name || !show_date || !show_time || !base_price || !total_seats) {
      connection.release();
      return res.status(400).json({ message: 'All show fields are required' });
    }

    await connection.beginTransaction();

    const [showResult] = await connection.query(
      `INSERT INTO shows (event_id, venue_name, show_date, show_time, base_price, total_seats)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [event_id, venue_name, show_date, show_time, base_price, total_seats]
    );
    const showId = showResult.insertId;

    // Auto-generate seats: first 20% premium (1.5x price), rest normal
    const seatsPerRow = 10;
    const premiumCutoff = Math.ceil(total_seats * 0.2);
    for (let i = 0; i < total_seats; i++) {
      const rowLetter = String.fromCharCode(65 + Math.floor(i / seatsPerRow));
      const seatNum = (i % seatsPerRow) + 1;
      const seatNumber = `${rowLetter}${seatNum}`;
      const isPremium = i < premiumCutoff;
      const price = isPremium ? (base_price * 1.5).toFixed(2) : base_price;
      const seatType = isPremium ? 'premium' : 'normal';
      await connection.query(
        'INSERT INTO seats (show_id, seat_number, seat_type, price) VALUES (?, ?, ?, ?)',
        [showId, seatNumber, seatType, price]
      );
    }

    await connection.commit();
    connection.release();

    res.status(201).json({ message: 'Show created with seats', showId });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error(err);
    res.status(500).json({ message: 'Failed to create show' });
  }
};

// GET /api/admin/bookings - overview of all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const [bookings] = await pool.query(
      `SELECT b.id, b.booking_ref, b.total_amount, b.status, u.name AS user_name, u.email,
              e.title, s.show_date, s.show_time
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN shows s ON b.show_id = s.id
       JOIN events e ON s.event_id = e.id
       ORDER BY b.created_at DESC`
    );
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};
