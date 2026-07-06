const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { createEvent, createShow, getAllBookings } = require('../controllers/adminController');

router.post('/events', verifyToken, verifyAdmin, createEvent);
router.post('/shows', verifyToken, verifyAdmin, createShow);
router.get('/bookings', verifyToken, verifyAdmin, getAllBookings);

module.exports = router;
