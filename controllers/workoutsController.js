const pool = require("../db");

const getWorkouts = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT id, user_id, planned_date, status, title, description 
       FROM UserWorkouts 
       WHERE user_id = $1 
       ORDER BY planned_date ASC`,
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching workouts:", error);
    res.status(500).json({ error: "Failed to fetch user workouts" });
  }
};

const addWorkout = async (req, res) => {
  const { userId,  plannedDate, status, title, description } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO UserWorkouts (user_id,  planned_date, status, title, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId,  plannedDate, status || 'planned', title, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding workout:", error);
    res.status(500).json({ error: "Failed to add workout" });
  }
};

const deleteWorkout = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM UserWorkouts WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Workout not found" });
    }

    res.status(200).json({ message: "Workout deleted successfully" });
  } catch (error) {
    console.error("Error deleting workout:", error);
    res.status(500).json({ error: "Failed to delete workout" });
  }
};

module.exports = {
  getWorkouts,
  addWorkout,
  deleteWorkout,
};
