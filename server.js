const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const dotenv = require("dotenv");
const sequelize = require("./db");

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/auth'))

sequelize.sync({ alter: true })  // creates table if not exists
  .then(() => console.log("MySQL Database synced"))
  .catch(err => console.error("DB sync error:", err));

app.get("/", (req, res) => {
  res.send("Express server is running!");
});


app.get("/health", (req, res) => {
  const uptimeSeconds = process.uptime();
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = Math.floor(uptimeSeconds % 60);
  
  res.status(200).json({
    status: "ok",
    uptime: `${hours}h ${minutes}m ${seconds}s`,
    timestamp: new Date().toLocaleString(),
  });
})


// Use a higher port number to avoid permission issues
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API endpoint: http://localhost:${PORT}/`);
});
