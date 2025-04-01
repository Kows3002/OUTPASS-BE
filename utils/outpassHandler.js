const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

// ✅ Email Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "kecoutpass2108@gmail.com",
    pass: "mkddppvlxvtvgkre", // ✅ Your App Password
  },
});

// ✅ Generate Outpass PDF Function
const generateOutpassPDF = (outpass, callback) => {
  try {
    const outpassDir = path.join(__dirname, "../outpasses");
    if (!fs.existsSync(outpassDir)) {
      fs.mkdirSync(outpassDir, { recursive: true });
    }

    const filePath = path.join(outpassDir, `outpass_${outpass.registerNumber}.pdf`);
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // ✅ Set Background Image (College Building)
    const buildingImagePath = path.join(__dirname, 'images', "kings-campus.png");
    doc.image(buildingImagePath, 0, 0, { width: doc.page.width, height: doc.page.height, opacity: 0.0 });

    // ✅ College Logo at the Top
    const logoPath = path.join(__dirname, 'images', "kings-logo.png");
    doc.image(logoPath, 40, 40, { width: 100 });

    // ✅ College Name & Address (White Text for Visibility)
    doc.fillColor("black") 
      .fontSize(18)
      .text("Kings Engineering College", 150, 60)
      .fontSize(15)
      .text("Kancheepuram, sriperumbadur, Tamilnadu", 150, 80)
      .moveDown(2);

    // ✅ Title Section (Gold Color)
    doc.fillColor("#1B2945")
      .fontSize(23)
      .text("Outpass Details", { align: "center", underline: true })
      .moveDown(1);

    // ✅ Table Header (Gold Background)
    const tableTop = doc.y;
    doc.fillColor("#D9A520")
      .rect(40, tableTop, 520, 30)
      .fill();

    doc.fillColor("#1B2945")
      .fontSize(15)
      .text("Field", 50, tableTop + 8, { width: 200, align: "center" })
      .text("Details", 250, tableTop + 8, { width: 300, align: "center" });

    // ✅ Table Data (Alternate Row Colors)
    const tableData = [
      ["Student Name", outpass.studentName],
      ["Register Number", outpass.registerNumber],
      ["Email", outpass.email],
      ["Department", outpass.department],
      ["Year", outpass.year],
      ["Semester", outpass.semester],
      ["Date", outpass.date],
      ["Reason", outpass.reason],
      ["Status", outpass.status],
    ];

    if (outpass.approvedBy) {
      tableData.push(["✅ Approved By", outpass.approvedBy]);
    }

    let yPosition = tableTop + 30;
    doc.fillColor("#1B2945");

    tableData.forEach((row, index) => {
      // Draw table row background
      doc.fillColor("#e6e6e6").rect(40, yPosition, 520, 30).fill();
    
      // Set text color and font size
      doc.fillColor("#1B2945").fontSize(15);
    
      // Draw table text in respective columns
      doc.text(row[0], 50, yPosition + 8, { width: 200, align: "center" });
      doc.text(row[1], 250, yPosition + 8, { width: 300, align: "center" });
    
      // Draw black borders for table cells
      doc.strokeColor("#000000").lineWidth(1);
    
      // Left border
      doc.moveTo(40, yPosition).lineTo(40, yPosition + 30).stroke();
      
      // Middle border (between columns)
      doc.moveTo(250, yPosition).lineTo(250, yPosition + 30).stroke();
      
      // Right border
      doc.moveTo(560, yPosition).lineTo(560, yPosition + 30).stroke();
      
      // Bottom underline
      doc.moveTo(40, yPosition + 30).lineTo(560, yPosition + 30).stroke();
    
      // Move yPosition for next row
      yPosition += 30;
    });
    

    // ✅ Watermark Text (Light Gold)
    // doc.fillColor("#D9A520")
    //   .fontSize(60)
    //   .opacity(0.1)
    //   .text("Outpass", doc.page.width / 2 - 100, doc.page.height / 2, { align: "center" })
    //   .opacity(1); // Reset opacity

    // ❌ Removed Footer (Student Details)
    
    // ✅ Signatures Section (Only Teacher & HOD)
    // doc.fillColor("#1B2945")
    //   .fontSize(15)
    //   .text("Teacher's Signature: ____________  ✅", 40, doc.page.height - 80)
    //   .text("HOD's Signature: ____________  ✅", 40, doc.page.height - 60);

    // ✅ Finalize PDF
    doc.end();

    stream.on("finish", () => callback(null, filePath));
    stream.on("error", (error) => callback(error, null));
  } catch (error) {
    console.error("❌ Error generating PDF:", error);
    callback(error, null);
  }
};

// ✅ Email Sending Function
const sendOutpassEmail = (to, subject, text, attachmentPath) => {
  const mailOptions = {
    from: "kecoutpass2108@gmail.com",
    to,
    subject,
    text,
    attachments: [{ filename: "Outpass.pdf", path: attachmentPath }],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("❌ Error sending email:", error);
    } else {
      console.log("✅ Email sent:", info.response);
    }
  });
};

// ✅ Export Functions
module.exports = { generateOutpassPDF, sendOutpassEmail };
