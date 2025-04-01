const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config(); 

const app = express();
const PORT = 5002;

// ✅ Middleware
app.use(express.json());
app.use(cors());

console.log(process.env.MONGO_URI);
console.log(process.env.JK)

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ Define User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ["Student", "admin", "Staff", "HOD"] },
});

const User = mongoose.model("User", userSchema);

// ✅ User Registration Route
app.post("/api/auth/register", async (req, res) => {
  const { name, password, role } = req.body;

  if (!name || !password || !role) {
    return res.status(400).json({ message: "⚠️ Name, password, and role are required!" });
  }

  try {
    const existingUser = await User.findOne({ name });
    if (existingUser) {
      return res.status(400).json({ message: "⚠️ Name already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: "✅ User registered successfully!" });
  } catch (error) {
    console.error("❌ Error during registration:", error);
    res.status(500).json({ message: "❌ Server error. Try again later." });
  }
});

// ✅ User Login Route
app.post("/api/auth/login", async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).json({ message: "⚠️ Name and password are required!" });
  }

  try {
    const user = await User.findOne({ name });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "⚠️ Invalid name or password!" });
    }

    // ✅ Generate JWT Token
    const token = jwt.sign({ userId: user._id, name: user.name, role: user.role }, process.env.Token, { expiresIn: "1h" });

    res.json({ 
      message: "✅ Login successful!", 
      user: { name: user.name, role: user.role }, 
      token: token 
    });
  } catch (error) {
    console.error("❌ Error during login:", error);
    res.status(500).json({ message: "❌ Server error. Try again later." });
  }
});

// ✅ Import Routes
app.use("/api/outpass", require("./routes/outpass"));

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
