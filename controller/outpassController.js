const Outpass = require("../models/outpass");
const generateOutpassPDF = require("../utils/outpassHandler"); // ✅ Import PDF generator 

// ✅ 1. Student Requests an Outpass
const requestOutpass = async (req, res) => {
  console.log("Received Data:", req.body);

  try {
    // ✅ Destructure all required fields
    const { registerNumber, studentName, email, department, year, semester, reason, date } = req.body;

    // ✅ Ensure all fields are present
    if (!registerNumber || !studentName || !email || !department || !year || !semester || !reason || !date) {
      return res.status(400).json({ message: "⚠️ All fields are required!" });
    }

    // ✅ Save new outpass request
    const newOutpass = new Outpass({
      registerNumber,
      studentName,
      studentEmail: email, // ✅ Ensure backend uses 'studentEmail'
      department,
      year,
      semester,
      reason,
      date,
      status: "Pending",
      role: "Student",
    });

    await newOutpass.save();

    res.status(201).json({ message: "✅ Outpass request submitted!", outpass: newOutpass });
  } catch (error) {
    console.error("❌ Error requesting outpass:", error);
    res.status(500).json({ message: "❌ Server error. Try again later." });
  }
};

// ✅ 2. Fetch Outpass History
const fetchOutpassHistory = async (req, res) => {
  try {
    const userRole = req.query.role;
    let outpassHistory;

    if (userRole === "student") {
      outpassHistory = await Outpass.find({ studentEmail: req.query.email });
    } else if (userRole === "staff" || userRole === "hod") {
      outpassHistory = await Outpass.find({});
    } else {
      return res.status(403).json({ message: "⚠️ Unauthorized access!" });
    }

    res.status(200).json(outpassHistory);
  } catch (error) {
    console.error("❌ Error fetching history:", error);
    res.status(500).json({ message: "❌ Server error. Try again later." });
  }
};

// ✅ 3. Staff/HOD Approve or Reject Outpass
const approveOutpass = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (req.user.role !== "Staff" && req.user.role !== "HOD") {
      return res.status(403).json({ message: "⚠️ Only Staff or HOD can approve outpasses!" });
    }

    const outpass = await Outpass.findById(id);
    if (!outpass) {
      return res.status(404).json({ message: "⚠️ Outpass not found!" });
    }

    outpass.status = status;
    outpass.approvedBy = req.user.name;
    await outpass.save();

    if (status === "Approved") {
      // ✅ Generate PDF
      const pdfPath = await generateOutpassPDF(outpass);

      // ✅ Send Email with PDF
      await sendEmail(outpass.studentEmail, pdfPath);
    }

    res.status(200).json({ message: `✅ Outpass ${status}!`, outpass });
  } catch (error) {
    console.error("❌ Error updating outpass:", error);
    res.status(500).json({ message: "❌ Server error. Try again later." });
  }
};

module.exports = { requestOutpass, fetchOutpassHistory, approveOutpass };
