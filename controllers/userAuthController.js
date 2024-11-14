const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pool = require("../db");

// Login controller
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM Users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];
    if (!user) return res.status(400).send("Invalid email or password.");

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword)
      return res.status(400).send("Invalid email or password.");

    // Generate JWT token with user ID in the payload
    const accessToken = jwt.sign(
      { id: user.id },
      process.env.ACCESS_CUSTOMER_TOKEN_SECRET, // Token name
      { expiresIn: "1h" } // Optional: Set token expiry
    );

    // Set token as HTTP-only cookie
    res.cookie("authToken", accessToken, {
      httpOnly: true, // Prevent access via JavaScript
      secure: process.env.NODE_ENV === "production", // Ensure secure in production
      sameSite: "strict", // Prevent CSRF attacks
      maxAge: 3600000, // 1 hour in milliseconds
    });

    res.status(200).send({mesaage: "Login successful", userId: user.id});
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Signup controller
exports.signup = async (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  const query = `
        INSERT INTO Users (email, password_hash, first_name, last_name)
        VALUES ($1, $2, $3, $4) RETURNING id`;
  const password_hash = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(query, [
      email,
      password_hash,
      firstname,
      lastname,
    ]);
    res.status(201).send("User added successfully");
  } catch (error) {
    console.log(error);
    if (error.code === "23505") {
      if (error.constraint === "users_email_key") {
        return res
          .status(409)
          .send("A user with the same email already exists.");
      }
    }
    res.status(500).send("Internal Server Error");
  }
};

// Check for duplicate email controller
exports.checkDuplicateEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const result = await pool.query("SELECT * FROM Users WHERE email = $1", [
      email,
    ]);
    const existingUser = result.rows[0];
    if (existingUser) return res.status(400).send("Email already exists.");

    res.status(200).send("Email available.");
  } catch (error) {
    console.error("Error checking duplicate email:", error);
    res.status(500).send("Internal Server Error");
  }
};
