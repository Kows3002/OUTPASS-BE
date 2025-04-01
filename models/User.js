const mongoose = require('mongoose');

// Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Store password as plain text (not recommended)
  role: { type: String, required: true }
});

// Compare password for login (optional, since no hashing is used)
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return enteredPassword === this.password; // Direct comparison since no hashing
};

module.exports = mongoose.model('User', UserSchema);
