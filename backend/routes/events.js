const express = require('express');
const router = express.Router();
const { getEvents, getEventById, getShowSeats, getCategories } = require('../controllers/eventController');

router.get('/categories', getCategories);
router.get('/events', getEvents);
router.get('/events/:id', getEventById);
router.get('/shows/:showId/seats', getShowSeats);

module.exports = router;
