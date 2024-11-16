// controllers/nutritionController.js
const { Pool } = require('pg');

const pool = require("../db");


const createTableQuery = `
  CREATE TABLE IF NOT EXISTS meals (
    id SERIAL PRIMARY KEY,
    food_name VARCHAR(255) NOT NULL,
    calories NUMERIC,
    protein_g NUMERIC,
    carbohydrates_g NUMERIC,
    fat_g NUMERIC,
    weight_kg NUMERIC,
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

pool.query(createTableQuery)
  .then(() => console.log('Meals table created successfully'))
  .catch(err => console.error('Error creating table:', err));

  const addMeal = async (req, res) => {
    const {
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
          (food_name, calories, protein_g, carbohydrates_g, fat_g, weight_kg, meal_type)
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
      `;
  
      const values = [
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
  try {
    const result = await pool.query('SELECT * FROM meals ORDER BY date_added DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting meals:', error);
    res.status(500).json({ error: 'Failed to get meals' });
  }
};

const getMealsByDate = async (req, res) => {
  const { date } = req.params;
  
  try {
    const query = `
      SELECT * FROM meals 
      WHERE DATE(date_added) = $1 
      ORDER BY date_added DESC
    `;
    
    const result = await pool.query(query, [date]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting meals by date:', error);
    res.status(500).json({ error: 'Failed to get meals' });
  }
};

const getDailyTotals = async (req, res) => {
  try {
    const query = `
      SELECT 
        CURRENT_DATE AS date, -- Use the current date
        COALESCE(SUM(calories), 0) AS total_calories, -- Sum of calories
        COALESCE(SUM(protein_g), 0) AS total_protein -- Sum of protein_g
      FROM meals
      WHERE date_added::DATE = CURRENT_DATE -- Match only the current date
    `;

    const result = await pool.query(query);

    res.json(
      result.rows[0] || {
        date: new Date().toISOString().split('T')[0], // Return today's date in ISO format
        total_calories: 0,
        total_protein: 0,
      }
    );
  } catch (error) {
    console.error('Error getting daily totals:', error);
    res.status(500).json({ error: 'Failed to get daily totals' });
  }
};

const getWeeklyTotals = async (req, res) => {
  try {
    const today = new Date();
    const dates = [];
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    // Format last 7 days as 'YYYY-MM-DD'
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(sevenDaysAgo.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    console.log('Fetching data for dates:', dates);

    // First, let's debug what data exists in the meals table
    const debugQuery = `
      SELECT 
        date_added,
        DATE(date_added) as formatted_date,
        calories,
        protein_g
      FROM meals
      WHERE date_added >= $1::date
      ORDER BY date_added DESC;
    `;
    
    const debugResult = await pool.query(debugQuery, [dates[0]]);
    console.log('Debug - Available data:', debugResult.rows);

    // Main query with fixed date handling
    const query = `
      WITH date_series AS (
        SELECT unnest($1::date[]) as series_date
      )
      SELECT 
        ds.series_date as date,
        COALESCE(SUM(m.calories), 0) AS total_calories,
        COALESCE(SUM(m.protein_g), 0) AS total_protein
      FROM date_series ds
      LEFT JOIN meals m 
        ON DATE(m.date_added) = ds.series_date
      GROUP BY ds.series_date
      ORDER BY ds.series_date DESC;
    `;

    const result = await pool.query(query, [dates]);
    console.log('Query result:', result.rows);

    // Format the response data
    const resultData = dates.map(date => {
      const data = result.rows.find(
        row => row.date.toISOString().split('T')[0] === date
      );
      return {
        date,
        total_calories: data ? parseFloat(data.total_calories) : 0,
        total_protein: data ? parseFloat(data.total_protein) : 0,
      };
    });

    res.json(resultData);
  } catch (error) {
    console.error('Error fetching weekly totals:', error);
    // Log more detailed error information
    if (error.query) {
      console.error('Failed query:', error.query);
    }
    if (error.parameters) {
      console.error('Query parameters:', error.parameters);
    }
    res.status(500).json({ error: 'Failed to get weekly totals' });
  }
};

const getMealsGroupedByTypeToday = async (req, res) => {
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
      WHERE DATE(date_added) = CURRENT_DATE
      ORDER BY date_added;
    `;

    const result = await pool.query(query);
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