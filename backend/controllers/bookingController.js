const pool = require('../config/db');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

function generateBookingRef() {
  return 'TS' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 90 + 10);
}

// POST /api/bookings  { showId, seatIds: [1,2] }
// Creates a pending booking and locks the chosen seats.
exports.createBooking = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const userId = req.user.id;
    const { showId, seatIds } = req.body;

    if (!showId || !Array.isArray(seatIds) || seatIds.length === 0) {
      connection.release();
      return res.status(400).json({ message: 'showId and at least one seatId are required' });
    }

    await connection.beginTransaction();

    // Lock rows to prevent double booking
    const [seats] = await connection.query(
      `SELECT id, price, is_booked FROM seats WHERE id IN (?) AND show_id = ? FOR UPDATE`,
      [seatIds, showId]
    );

    if (seats.length !== seatIds.length) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ message: 'One or more seats are invalid for this show' });
    }

    const alreadyBooked = seats.some((s) => s.is_booked);
    if (alreadyBooked) {
      await connection.rollback();
      connection.release();
      return res.status(409).json({ message: 'One or more selected seats are already booked' });
    }

    const totalAmount = seats.reduce((sum, s) => sum + parseFloat(s.price), 0);
    const bookingRef = generateBookingRef();

    const [bookingResult] = await connection.query(
      `INSERT INTO bookings (booking_ref, user_id, show_id, total_amount, status) VALUES (?, ?, ?, ?, 'pending')`,
      [bookingRef, userId, showId, totalAmount]
    );
    const bookingId = bookingResult.insertId;

    for (const seatId of seatIds) {
      await connection.query('INSERT INTO booking_seats (booking_id, seat_id) VALUES (?, ?)', [bookingId, seatId]);
      await connection.query('UPDATE seats SET is_booked = TRUE WHERE id = ?', [seatId]);
    }

    await connection.query(
      `INSERT INTO payments (booking_id, razorpay_order_id, amount, status) VALUES (?, ?, ?, 'created')`,
      [bookingId, 'order_' + uuidv4().slice(0, 12), totalAmount]
    );

    await connection.commit();
    connection.release();

    res.status(201).json({
      message: 'Booking created, proceed to payment',
      bookingId,
      bookingRef,
      totalAmount
    });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error(err);
    res.status(500).json({ message: 'Failed to create booking' });
  }
};

// POST /api/bookings/:id/confirm-payment
// Mock payment confirmation (swap this for real Razorpay verification in production).
exports.confirmPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [bookings] = await pool.query('SELECT * FROM bookings WHERE id = ? AND user_id = ?', [id, userId]);
    if (bookings.length === 0) return res.status(404).json({ message: 'Booking not found' });

    const booking = bookings[0];
    if (booking.status === 'confirmed') {
      return res.status(400).json({ message: 'Booking already confirmed' });
    }

    const qrPayload = JSON.stringify({
      bookingRef: booking.booking_ref,
      bookingId: booking.id,
      amount: booking.total_amount
    });
    const qrDataUrl = await QRCode.toDataURL(qrPayload);

    await pool.query('UPDATE bookings SET status = ?, qr_code = ? WHERE id = ?', ['confirmed', qrDataUrl, id]);
    await pool.query(
      `UPDATE payments SET status = 'paid', razorpay_payment_id = ? WHERE booking_id = ?`,
      ['pay_' + Date.now(), id]
    );

    res.json({ message: 'Payment confirmed, ticket generated', qrCode: qrDataUrl, bookingRef: booking.booking_ref });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to confirm payment' });
  }
};

// GET /api/bookings/my
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const [bookings] = await pool.query(
      `SELECT b.*, e.title, e.city, s.venue_name, s.show_date, s.show_time
       FROM bookings b
       JOIN shows s ON b.show_id = s.id
       JOIN events e ON s.event_id = e.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [userId]
    );
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};

// POST /api/bookings/:id/cancel
exports.cancelBooking = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await connection.beginTransaction();
    const [bookings] = await connection.query('SELECT * FROM bookings WHERE id = ? AND user_id = ?', [id, userId]);
    if (bookings.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ message: 'Booking not found' });
    }

    const [seatRows] = await connection.query('SELECT seat_id FROM booking_seats WHERE booking_id = ?', [id]);
    for (const row of seatRows) {
      await connection.query('UPDATE seats SET is_booked = FALSE WHERE id = ?', [row.seat_id]);
    }

    await connection.query('UPDATE bookings SET status = ? WHERE id = ?', ['cancelled', id]);
    await connection.commit();
    connection.release();

    res.json({ message: 'Booking cancelled and seats released' });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error(err);
    res.status(500).json({ message: 'Failed to cancel booking' });
  }
};
