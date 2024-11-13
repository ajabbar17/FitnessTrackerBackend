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



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
