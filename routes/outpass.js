const express = require("express");
const router = express.Router();
const { requestOutpass, fetchOutpassHistory, approveOutpass } = require("../controller/outpassController");
const { generateOutpassPDF, sendOutpassEmail } = require("../utils/outpassHandler");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ 1. Student Requests an Outpass
router.post("/request", requestOutpass);

// ✅ 2. Fetch Outpass History
router.get("/history", fetchOutpassHistory);

// ✅ 3. Staff/HOD Approve or Reject Outpass
router.put("/approve/:id", authMiddleware, approveOutpass);

// ✅ 4. Generate PDF & Send Email
router.post("/generate-pdf", (req, res) => {
  generateOutpassPDF(req.body, (error, filePath) => {
    if (error) {
      console.error("❌ Error generating PDF:", error);
      return res.status(500).json({ message: "❌ Failed to generate PDF." });
    }

    // ✅ Send PDF via Email
    sendOutpassEmail(req.body.email, "Your Outpass", "Attached is your outpass.", filePath);

    res.status(200).json({ message: "✅ PDF generated and emailed successfully!", filePath });
  });
});

module.exports = router;
