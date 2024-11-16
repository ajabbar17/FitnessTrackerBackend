const express = require('express');
const router = express.Router();
const nutritionController = require('../controllers/nutritionDashboard');

// Add a new meal for a specific user
router.post('/meals/:userId', nutritionController.addMeal);

// Get all meals for a specific user
router.get('/meals/:userId', nutritionController.getMeals);

// Get meals for a specific user on a specific date
router.get('/meals/:userId/:date', nutritionController.getMealsByDate);

// Get daily totals for a specific user on a specific date
router.get('/daily-totals/:userId/:date', nutritionController.getDailyTotals);

// Get weekly totals for a specific user
router.get('/weekly-totals/:userId', nutritionController.getWeeklyTotals);

// Get today's meals grouped by type for a specific user
router.get('/mealsToday/:userId', nutritionController.getMealsGroupedByTypeToday);

module.exports = router;
