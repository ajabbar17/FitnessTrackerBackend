const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutsController'); 

router.get('/:userId', workoutController.getWorkouts);
router.post('/add', workoutController.addWorkout);
router.delete('/delete/:id', workoutController.deleteWorkout);




module.exports = router;
