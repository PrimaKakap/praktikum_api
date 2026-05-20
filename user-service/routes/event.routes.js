const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');

// Harus POST dan jalurnya harus /api/events sesuai yang ditembak oleh Event Bus tadi
router.post('/', eventController.event);

module.exports = router;