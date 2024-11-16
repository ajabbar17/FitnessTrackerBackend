const express = require("express");
const cors = require("cors");

const app = express();
const port = 3001;
app.use(express.json());
app.use(cors());

const userAuth = require("./routes/userAuthRoute");
app.use("/auth", userAuth);

const workouts = require("./routes/workoutsRoutes");
app.use("/workouts", workouts);

const nutrition = require("./routes/nutritionTrackingRoute");
app.use('/nutrition', nutrition);

const nutritionDashboard = require("./routes/nutritionDashboardRoute");
app.use('/nutritionDash', nutritionDashboard);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
