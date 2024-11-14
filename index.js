const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
const port = 3001;

// Middleware setup
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true, // Enable cookies to be sent
}));
app.use(cookieParser()); // Enables parsing of cookies

// Routes
const userAuth = require("./routes/userAuthRoute");
app.use("/auth", userAuth);

const workouts = require("./routes/workoutsRoutes");
app.use("/workouts", workouts);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
