const express = require('express');
const connectDB = require('./db/mongodb');
const authRoutes = require('./routes/auth');

const app = express();
app.use(express.json());

// Connect MongoDB
connectDB();

// Routes
app.use('/api', authRoutes);

app.listen(5000, () => {
  console.log('🚀 Server running at http://localhost:5000');
});
