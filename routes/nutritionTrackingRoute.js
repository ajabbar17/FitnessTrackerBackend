const express = require('express');
const { getNutrition } = require('../controllers/nutritionTracking'); // Import controller
const router = express.Router();

// Define route for fetching nutrition info
router.get('/food', getNutrition);

module.exports = router;
