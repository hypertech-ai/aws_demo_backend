const express = require("express");
require("dotenv").config();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");
const User = require("../models/User");
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

console.log("JWT_SECRET:",JWT_SECRET);

// ROUTE 1: Create a User
router.post("/createuser", [
  body("name", "Enter a valid name").isLength({ min: 3 }),
  body("email", "Enter a valid email").isEmail(),
  body("password", "Password must be at least 5 characters").isLength({ min: 5 }),
], async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }

  try {
    let user = await User.findOne({ where: { email: req.body.email } });
    if (user) {
      return res.status(400).json({ success, error: "User with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);

    user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: secPass,
    });

    const data = { user: { id: user.id } };
    console.log("data:",data);
    const authtoken = jwt.sign(data, JWT_SECRET, { expiresIn: "1h" });

    success = true;
    res.json({ success, authtoken });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// ROUTE 2: Login
router.post("/login", [
  body("email", "Enter a valid email").isEmail(),
  body("password", "Password cannot be blank").exists(),
], async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ success, error: "Invalid credentials" });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(400).json({ success, error: "Invalid credentials" });
    }

    const data = { user: { id: user.id } };
    console.log("📝 Creating JWT with data:", data);
    console.log("🔑 Using JWT_SECRET:", JWT_SECRET ? "Present" : "Missing");
    
    if (!JWT_SECRET) {
      console.error("❌ JWT_SECRET is not defined in environment variables");
      return res.status(500).json({ 
        success: false, 
        error: "Server configuration error" 
      });
    }
    
    const authtoken = jwt.sign(data, JWT_SECRET, { expiresIn: "1h" });
    success = true;
    res.json({ success, authtoken });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// ROUTE 3: Get User (Login Required)
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, { attributes: { exclude: ["password"] } });
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
