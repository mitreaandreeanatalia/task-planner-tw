// Punctul de pornire al aplicației backend

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const sequelize = require("./sequelize");

// Încarcă modelele Sequelize
require("./models/User");
require("./models/Task");

// Încarcă serviciile (rutele API)
const authService = require("./services/authService");
const userService = require("./services/userService");
const taskService = require("./services/taskService");

const app = express();

// Permite accesul frontend-ului și request-uri JSON
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Endpoint simplu pentru verificarea serverului
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Înregistrează rutele API
app.use("/api", authService);
app.use("/api", userService);
app.use("/api", taskService);

// Pornește serverul și verifică conexiunea la baza de date
const PORT = process.env.PORT || 7000;
app.listen(PORT, async () => {
  console.log("Server started on https://task-planner-tw-1.onrender.com");
  try {
    await sequelize.authenticate();
    console.log("DB connected");
  } catch (e) {
    console.error("DB connect error:", e);
  }
});
