const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ✅ POST /api/auth/register (FIXED)
router.post('/register', async (req, res) => {
  const { name, password, role } = req.body;


  try {

    if (!name || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ name });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user
    const newUser = new User({ name, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    console.error('🔥 Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { name, password } = req.body;
  console.log(password);
  try {

    const user = await User.findOne({ name });


    if (!user) {
      return res.status(400).json({ message: 'Invalid name or password' });
    }


    if (!user.password) {
      return res.status(400).json({ message: 'Invalid name or password' });
    }

    console.log(password, user.password);

    const isMatch = await bcrypt.compare(password, user.password);


    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid name or password' });
    }

    const jwtSecret = "kows_secret";
    const token = jwt.sign({ userId: user._id, role: user.role }, jwtSecret, { expiresIn: '1h' });

    res.status(200).json({
      message: `Login successful as ${user.role}`,
      user: {
        name: user.name,
        role: user.role,
        jk: token,
      }
    });

  } catch (error) {
    console.error('🔥 Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
