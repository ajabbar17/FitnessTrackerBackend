// routes/nutritionRoutes.js
const express = require('express');
const router = express.Router();
const nutritionController = require('../controllers/nutritionDashboard');

// Add a new meal
router.post('/meals', nutritionController.addMeal);

// Get all meals
router.get('/meals', nutritionController.getMeals);

// Get meals for a specific date
router.get('/meals/:date', nutritionController.getMealsByDate);

// Get daily totals for a specific date
router.get('/daily-totals/:date', nutritionController.getDailyTotals);
router.get('/weekly-totals', nutritionController.getWeeklyTotals);
router.get('/mealsToday', nutritionController.getMealsGroupedByTypeToday);

module.exports = router;