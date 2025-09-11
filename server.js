const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.get("/", (req, res) => {
  res.send("Express server is running!");
});

// Signup endpoint
app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  const sql = "INSERT INTO login (name, email, password) VALUES (?, ?, ?)";
  const values = [name, email, password]; // Destructure directly here

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error during signup:", err.message);
      return res.json({ success: false, message: "Signup failed" });
    }
    console.log("User signed up successfully");
    return res.json({ success: true, message: "Signup successful" });
  });
});

app.post("/login", (req, res) => {
  const sql = "SELECT * FROM login WHERE `email` = ? AND `password` = ?";
  db.query(sql, [req.body.email, req.body.password], (err, data) => {
    if (err) {
      return res.json("Error");
    }

    if (data.length > 0) {
      return res.json("Success");
    } else {
      return res.json("Fail");
    }
  });
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


app.listen(8081, () => {
  console.log("Server is listening on port 8081");
});
