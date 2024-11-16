const { Pool } = require('pg');
const pool = require("../db");

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS meals (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    food_name VARCHAR(255) NOT NULL,
    calories NUMERIC,
    protein_g NUMERIC,
    carbohydrates_g NUMERIC,
    fat_g NUMERIC,
    weight_kg NUMERIC,
    meal_type VARCHAR(50),
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

pool.query(createTableQuery)
  .then(() => console.log('Meals table created successfully'))
  .catch(err => console.error('Error creating table:', err));

const addMeal = async (req, res) => {
  const {userId }= req.params;
  const {
    // Ensure userId is sent in the body
    foodName,
    calories,
    protein_g,
    carbohydrates_total_g,
    fat_total_g,
    weight,
    mealType,
  } = req.body;

  try {
    const insertQuery = `
      INSERT INTO meals 
        (user_id, food_name, calories, protein_g, carbohydrates_g, fat_g, weight_kg, meal_type)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    const values = [
      userId,
      foodName,
      calories,
      protein_g,
      carbohydrates_total_g,
      fat_total_g,
      weight,
      mealType,
    ];

    const result = await pool.query(insertQuery, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding meal:', error);
    res.status(500).json({ error: 'Failed to add meal' });
  }
};

const getMeals = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM meals WHERE user_id = $1 ORDER BY date_added DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting meals:', error);
    res.status(500).json({ error: 'Failed to get meals' });
  }
};

const getMealsByDate = async (req, res) => {
  const { userId, date } = req.params;

  try {
    const query = `
      SELECT * FROM meals 
      WHERE user_id = $1 AND DATE(date_added) = $2 
      ORDER BY date_added DESC;
    `;
    
    const result = await pool.query(query, [userId, date]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting meals by date:', error);
    res.status(500).json({ error: 'Failed to get meals' });
  }
};

const getDailyTotals = async (req, res) => {
  const { userId } = req.params;

  try {
    const query = `
      SELECT 
        CURRENT_DATE AS date,
        COALESCE(SUM(calories), 0) AS total_calories,
        COALESCE(SUM(protein_g), 0) AS total_protein
      FROM meals
      WHERE user_id = $1 AND DATE(date_added) = CURRENT_DATE;
    `;

    const result = await pool.query(query, [userId]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting daily totals:', error);
    res.status(500).json({ error: 'Failed to get daily totals' });
  }
};

const getWeeklyTotals = async (req, res) => {
  const { userId } = req.params;
  console.log(userId);
  try {
    const query = `
      WITH date_series AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '6 days',
          CURRENT_DATE,
          '1 day'
        )::date AS series_date
      )
      SELECT 
        ds.series_date AS date,
        COALESCE(SUM(m.calories), 0) AS total_calories,
        COALESCE(SUM(m.protein_g), 0) AS total_protein
      FROM date_series ds
      LEFT JOIN meals m 
        ON DATE(m.date_added) = ds.series_date AND m.user_id = $1
      GROUP BY ds.series_date
      ORDER BY ds.series_date DESC;
    `;

    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching weekly totals:', error);
    res.status(500).json({ error: 'Failed to get weekly totals' });
  }
};

const getMealsGroupedByTypeToday = async (req, res) => {
  const { userId } = req.params;

  try {
    const query = `
      SELECT 
      id,
        meal_type,
        food_name,
        calories,
        protein_g,
        carbohydrates_g,
        fat_g,
        weight_kg,
        date_added
      FROM meals
      WHERE user_id = $1 AND DATE(date_added) = CURRENT_DATE
      ORDER BY date_added;
    `;

    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching today's meals:", error);
    res.status(500).json({ error: 'Failed to fetch meals' });
  }
};



module.exports = {
  addMeal,
  getMeals,
  getMealsByDate,
  getDailyTotals,
  getWeeklyTotals,
  getMealsGroupedByTypeToday
};
