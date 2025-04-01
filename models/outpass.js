const mongoose = require("mongoose");

const outpassSchema = new mongoose.Schema({
  registerNumber: { type: String, required: true },  // ✅ Added
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },  // ✅ Renamed from 'email'
  department: { type: String, required: true },  // ✅ Added
  year: { type: String, required: true },  // ✅ Added
  semester: { type: String, required: true },  // ✅ Added
  reason: { type: String, required: true },
  date: { type: Date, required: true },  // ✅ Changed from 'dateOfLeave' to 'date'
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  approvedBy: { type: String },
});

const Outpass = mongoose.model("Outpass", outpassSchema);

module.exports = Outpass;
