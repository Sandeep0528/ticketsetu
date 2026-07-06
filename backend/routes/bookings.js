const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  createBooking,
  confirmPayment,
  getMyBookings,
  cancelBooking
} = require('../controllers/bookingController');

router.post('/', verifyToken, createBooking);
router.post('/:id/confirm-payment', verifyToken, confirmPayment);
router.get('/my', verifyToken, getMyBookings);
router.post('/:id/cancel', verifyToken, cancelBooking);

module.exports = router;
