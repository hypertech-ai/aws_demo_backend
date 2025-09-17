require('dotenv').config();
const jwt = require('jsonwebtoken');

const fetchuser = (req, res, next) => {
  // Get the user from the jwt token and add id to req object
  const token = req.header('auth-token') || req.header('Authorization');
  
  console.log(" Token received:", token ? "Present" : "Missing");
  console.log(" JWT_SECRET:", process.env.JWT_SECRET ? "Loaded" : "Missing");

  if (!token) {
    return res.status(401).json({ 
      success: false,
      error: "Please authenticate using a valid token" 
    });
  }

  try {
    // If token comes with "Bearer " prefix, remove it
    const actualToken = token.startsWith("Bearer ") ? token.split(" ")[1] : token;
    console.log(" Verifying token....");
    
    if (!process.env.JWT_SECRET) {
      console.error(" JWT_SECRET is not defined in environment variables");
      return res.status(500).json({ 
        success: false,
        error: "Server configuration error" 
      });
    }
    
    const data = jwt.verify(actualToken, process.env.JWT_SECRET);
    console.log(" Token verified successfully:", data);
    
    // Check if the payload has the expected structure
    if (!data.user || !data.user.id) {
      console.error(" Invalid token payload structure:", data);
      return res.status(401).json({ 
        success: false,
        error: "Invalid token format" 
      });
    }
    
    req.user = data.user; // attaches user payload to request
    console.log("👤 User attached to request:", req.user);
    next(); // move to next middleware/controller
  } catch (error) {
    console.error("❌ JWT verification error:", error.message);
    return res.status(401).json({ 
      success: false,
      error: "Please authenticate using a valid token" 
    });
  }
};

module.exports = fetchuser;
