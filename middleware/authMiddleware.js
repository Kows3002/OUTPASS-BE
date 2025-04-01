const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  console.log("🔍 Incoming request headers:", req.headers); // Debugging

  // Extract Authorization Header
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("🚨 No valid Authorization header found!");
    return res.status(401).json({ message: "⚠️ Access denied. No token provided!" });
  }

  // Extract Token
  const token = authHeader.split(" ")[1];
  console.log("🛠️ Extracted Token:", token); // Debugging

  try {
    // Verify Token
    const decoded = jwt.verify(token, "kows_secret"); 
    console.log("✅ Decoded Token:", decoded); // Debugging

    req.user = decoded; // Attach user data to request
    next(); // Continue to next middleware
  } catch (error) {
    console.log(error)
    console.log("🚨 JWT Verification Error:", error.message); // Debugging
    return res.status(403).json({ message: "⚠️ Invalid token!" });
  }
};

module.exports = authMiddleware;
