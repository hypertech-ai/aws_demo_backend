require('dotenv').config();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const fetchuser = (req, res, next) => {
  // Get the user from the jwt token and add id to req object
  const token = req.header('auth-token') || req.header('Authorization');

  if (!token) {
    return res.status(401).json({ error: "Please authenticate using a valid token" });
  }

  try {
    // If token comes with "Bearer " prefix, remove it
    const actualToken = token.startsWith("Bearer ") ? token.split(" ")[1] : token;

    const data = jwt.verify(actualToken, JWT_SECRET);
    req.user = data.user; // attaches user payload to request

    next(); // move to next middleware/controller
  } catch (error) {
    console.error("JWT verification error:", error.message);
    return res.status(401).json({ error: "Please authenticate using a valid token" });
  }
};

module.exports = fetchuser;
