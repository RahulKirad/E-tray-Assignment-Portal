const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const nodemailer = require("nodemailer");
const fs = require("fs");
const { emailUser, emailPassword } = require("./emailCredentials");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// ✅ Nodemailer Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPassword, // Use generated App Password
  },
});

// ✅ Function to Read Excel Files
const readExcelFile = (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet);
};

// ✅ Updated Route with Case-Insensitive Email Handling
router.post("/submit-skillwise", upload.fields([{ name: "students" }, { name: "questions" }]), async (req, res) => {
  try {
    if (!req.files || !req.files.students || !req.files.questions) {
      return res.status(400).json({ message: "Please upload both student and question files." });
    }

    const studentFilePath = req.files.students[0].path;
    const questionFilePath = req.files.questions[0].path;

    const studentData = readExcelFile(studentFilePath);
    const questionData = readExcelFile(questionFilePath);

    console.log("✅ Student Data:", studentData); // Debug student data
    console.log("✅ Question Data:", questionData); // Debug question data

    // ✅ Extract Questions
    const questions = questionData.map(q => q.Question).join("\n");

    // ✅ Detect Email Column (Handles case variations)
    const emailColumn = Object.keys(studentData[0]).find(
      key => key.toLowerCase() === "email"
    );

    if (!emailColumn) {
      console.log("❌ No 'email' column found in the student file.");
      return res.status(400).json({ message: "Email column missing in student file" });
    }

    // ✅ Extract Student Emails
    const emailPromises = studentData.map(student => {
      const studentEmail = student[emailColumn]?.trim(); // Use detected column

      if (!studentEmail) {
        console.log(`❌ Missing email for student: ${student.Name}`);
        return Promise.resolve(); // Skip invalid email
      }

      console.log(`📩 Sending email to: ${studentEmail}`); // Debug emails

      const mailOptions = {
        from: emailUser,
        to: studentEmail,
        subject: "Your Skill-Wise Assignment Questions",
        text: `Dear ${student.Name},\n\nHere are your assignment questions:\n\n${questions}\n\nBest regards,\nYour College`,
      };

      return transporter.sendMail(mailOptions)
        .then(info => console.log(`✅ Email sent: ${info.response}`))
        .catch(err => console.log(`❌ Email failed: ${err.message}`));
    });

    // ✅ Send All Emails
    await Promise.all(emailPromises);

  

    res.json({ message: "Emails sent successfully!" });
  } catch (error) {
    console.error("Error sending emails:", error);
    res.status(500).json({ message: "Error sending emails", error: error.message });
  }
});

module.exports = router;
