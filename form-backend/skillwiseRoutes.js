const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const Imap = require("imap")
const simpleParser = require("mailparser").simpleParser;
const { emailUser, emailPassword } = require("./emailCredentials");

const router = express.Router();
const upload = multer({ dest: "uploads/" });


const imapConfig = {
  user: emailUser,
  password: emailPassword,
  host: "imap.gmail.com", // Update as per your email provider
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }, // 👈 Ignores SSL errors

};

// Function to fetch and process emails
const fetchEmails = () => {
  const imap = new Imap(imapConfig);

  function openInbox(cb) {
    imap.openBox("INBOX", false, cb);
  }

  imap.once("ready", function () {
    console.log("✅ IMAP connection established.");
    openInbox((err, box) => {
      if (err) {
        console.error("❌ Error opening inbox:", err);
        imap.end();
        return;
      }

      imap.search(["UNSEEN"], (err, results) => {
        if (err) {
          console.error("❌ Error searching emails:", err);
          imap.end();
          return;
        }
        if (!results || results.length === 0) {
          console.log("📭 No new unread emails.");
          imap.end();
          return;
        }

        const fetchStream = imap.fetch(results, { bodies: "" });

        fetchStream.on("message", (msg, seqno) => {
          console.log(`📬 Processing email #${seqno}`);

          msg.on("body", (stream, info) => {
            simpleParser(stream, async (err, mail) => {
              if (err) {
                console.error("❌ Error parsing email:", err);
                return;
              }

              if (!mail.from || !mail.from.value || mail.from.value.length === 0) {
                console.log("❌ Skipping email: No sender found.");
                return;
              }

              const senderEmail = mail.from.value[0].address;
              const subject = mail.subject || "No Subject";
              const body = mail.text || "No Content";
              const receivedDate = new Date(mail.date).toISOString().split("T")[0];
              const receivedTime = new Date(mail.date).toLocaleTimeString();

              console.log(`📩 Processing email from: ${senderEmail}`);

              updateExcelWithResponse(senderEmail, body, receivedDate, receivedTime);
            });
          });
        });

        fetchStream.once("end", () => {
          console.log("🔌 IMAP fetch completed.");
          imap.end();
        });
      });
    });
  });

  imap.once("error", function (err) {
    console.error("❌ IMAP connection error:", err);
  });

  imap.once("end", function () {
    console.log("🔌 IMAP connection ended.");
  });

  imap.connect();
};

// ✅ Function to Log Admin Activity to Excel
const logAdminActivity = (collegeName, collegeEmail, studentEmail, studentName, studentSkills, questions, date, time) => {
  const logDir = path.join(__dirname, "Admin Log");
  const logFilePath = path.join(logDir, "skillwise_admin_activity_log.xlsx");

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  let workbook, worksheet, existingData;

  if (fs.existsSync(logFilePath)) {
    workbook = XLSX.readFile(logFilePath);
    worksheet = workbook.Sheets["Log"] || XLSX.utils.json_to_sheet([]);
    existingData = XLSX.utils.sheet_to_json(worksheet);
  } else {
    workbook = XLSX.utils.book_new();
    existingData = [];
  }

  // ✅ Check for duplicate email before inserting
  const isDuplicate = existingData.some(row => row["Recipient Email"] === studentEmail);
  if (isDuplicate) {
    console.log(`⚠️ Duplicate entry skipped for ${studentEmail}`);
    return;
  }

  const logEntry = {
    "College Name": collegeName,
    "College Email": collegeEmail,
    "Sending Date": date,
    "Sending Time": time,
    "Recipient Name": studentName,
    "Recipient Email": studentEmail,
    "Skills": studentSkills,
    "Assigned Questions": JSON.stringify(questions),
    "Response of Student": "",
    "Response Date": "",
    "Response Time": "",
    "Score": "",
  };

  existingData.push(logEntry);
  worksheet = XLSX.utils.json_to_sheet(existingData);
  adjustColumnWidths(worksheet);
  workbook.Sheets["Log"] = worksheet;

  if (workbook.SheetNames.length === 0) {
    XLSX.utils.book_append_sheet(workbook, worksheet, "Log");
  }

  XLSX.writeFile(workbook, logFilePath);
  console.log(`✅ Activity logged for ${studentEmail}`);
};

// ✅ Function to Adjust Column Widths for Readability
const adjustColumnWidths = (worksheet) => {
  worksheet["!cols"] = [
    { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 10 },
    { wch: 20 }, { wch: 25 }, { wch: 30 }, { wch: 50 },
    { wch: 15 }, { wch: 10 }, { wch: 10 }
  ];
};

// ✅ Function to Update Excel with Student Responses
const updateExcelWithResponse = (studentEmail, responseText, responseDate, responseTime) => {
  const logDir = path.join(__dirname, "Admin Log");
  const logFilePath = path.join(logDir, "skillwise_admin_activity_log.xlsx");

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  if (!fs.existsSync(logFilePath)) {
    console.log("⚠️ Log file missing. Creating a new one...");
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Log");
    XLSX.writeFile(workbook, logFilePath);
  }

  const workbook = XLSX.readFile(logFilePath);
  const worksheet = workbook.Sheets["Log"] || XLSX.utils.json_to_sheet([]);
  let data = XLSX.utils.sheet_to_json(worksheet);

  const rowIndex = data.findIndex(row => row["Recipient Email"] === studentEmail);

  if (rowIndex !== -1) {
    // ✅ Update existing entry while keeping previous data
    data[rowIndex]["Response of Student"] = responseText;
    data[rowIndex]["Response Date"] = responseDate;
    data[rowIndex]["Response Time"] = responseTime;
    data[rowIndex]["Response Received"] = "Yes";
  } else {
    // ✅ If email is not found, add a new entry while keeping all columns intact
    const newEntry = {
      "Recipient Email": studentEmail,
      "Response of Student": responseText,
      "Response Date": responseDate,
      "Response Time": responseTime,
      "Response Received": "Yes",
      "College Name": "Your College Name", // Ensure College Name is included
      "College Email": "example@example.com", // Update with actual email
      "Sending Date": new Date().toISOString().split("T")[0], // Auto-generate sending date
      "Sending Time": new Date().toLocaleTimeString(), // Auto-generate sending time
      "Skills": "Not Available", // Placeholder for skills
      "Assigned Questions": "Not Available",
      "Score": "",
    };
    data.push(newEntry);
  }

  const updatedWorksheet = XLSX.utils.json_to_sheet(data);
  adjustColumnWidths(updatedWorksheet);
  workbook.Sheets["Log"] = updatedWorksheet;
  XLSX.writeFile(workbook, logFilePath);

  console.log(`✅ Response logged for ${studentEmail}`);
};



// ✅ Set Interval to Run Every 5 Minutes (300000ms)
setInterval(fetchEmails, 5 * 60 * 1000);

// ✅ Initial Fetch
fetchEmails();

// ✅ Nodemailer Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPassword, // Use App Password for security
  },
});

// ✅ Function to Read Excel Files
const readExcelFile = (filePath) => {
  const workbook = XLSX.readFile(filePath);
  let sheets = {};

  workbook.SheetNames.forEach(sheetName => {
    sheets[sheetName.toLowerCase().replace(/[\s.-]/g, "")] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  });

  return sheets;
};




// ✅ Route to Handle Skill-Wise Question Assignment
router.post("/submit-skillwise", upload.fields([{ name: "students" }, { name: "questions" }]), async (req, res) => {
  try {
    if (!req.files || !req.files.students || !req.files.questions) {
      return res.status(400).json({ message: "Please upload both student and question files." });
    }

    const studentFilePath = req.files.students[0].path;
    const questionFilePath = req.files.questions[0].path;

    const studentData = readExcelFile(studentFilePath)["sheet1"]; // Assuming student data is in "Sheet1"
    const questionData = readExcelFile(questionFilePath); // All skill-based sheets

    console.log("✅ Student Data:", studentData);
    console.log("✅ Question Data Sheets:", Object.keys(questionData));

    // ✅ Detect Columns Dynamically (Handles case variations)
    const emailColumn = Object.keys(studentData[0]).find(key => key.toLowerCase() === "email");
    const skillColumn = Object.keys(studentData[0]).find(key => key.toLowerCase() === "skills");
    const nameColumn = Object.keys(studentData[0]).find(key => key.toLowerCase().includes("name"));

    if (!emailColumn || !skillColumn || !nameColumn) {
      console.log("❌ Required columns missing in student file.");
      return res.status(400).json({ message: "Email, Name, or Skills column missing in student file" });
    }

    const collegeName = "Your College Name"; // Replace with dynamic value if needed
    const collegeEmail = emailUser; // Replace if different admin emails are used
    const date = new Date().toISOString().split("T")[0];
    const time = new Date().toLocaleTimeString();

    // ✅ Process Students & Send Emails
    const emailPromises = studentData.map(student => {
      const studentEmail = student[emailColumn]?.trim();
      const studentName = student[nameColumn]?.trim();
      const studentSkills = student[skillColumn]?.split(",").map(skill => skill.trim().toLowerCase().replace(/[\s.-]/g, ""));

      if (!studentEmail || !studentName || !studentSkills.length) {
        console.log(`❌ Invalid data for student: ${studentName || "Unknown"}`);
        return Promise.resolve();
      }

      let studentQuestions = [];
      studentSkills.forEach(skill => {
        const matchedSheet = Object.keys(questionData).find(sheet => sheet.includes(skill));

        if (matchedSheet && questionData[matchedSheet].length >= 2) {
          const shuffledQuestions = questionData[matchedSheet].sort(() => 0.5 - Math.random()).slice(0, 2);
          studentQuestions.push({
            skillName: matchedSheet,
            questions: shuffledQuestions.map(q => q.Question),
          });
        }
      });

      if (!studentQuestions.length) {
        console.log(`❌ No matching questions found for ${studentName} (${studentSkills})`);
        return Promise.resolve();
      }

      // ✅ Log Activity in Excel
      logAdminActivity(collegeName, collegeEmail, studentEmail, studentName, student[skillColumn], studentQuestions, date, time);

      // ✅ Generate Email Content
      let emailContent = `
        <p>Hi <b>${studentName}</b>,</p>
        <p>We hope you're doing well!</p>
        <p>You have been assigned the following Skill-Wise E-Tray Assignment:</p>
        <ul>
          <li><b>Email:</b> ${studentEmail}</li>
          <li><b>Skills:</b> ${student[skillColumn]}</li>
        </ul>
        <p style="color: red; font-weight: bold;">Questions:</p>
      `;

      studentQuestions.forEach(skill => {
        emailContent += `<p><b>${skill.skillName} Questions:</b></p><ul>`;
        skill.questions.forEach(question => {
          emailContent += `<li>${question}</li>`;
        });
        emailContent += `</ul>`;
      });

      emailContent += `
        <p><b>Please complete your assignment on time.</b></p>
        <p>Best regards,</p>
        <p><b>Your College</b></p>
      `;

      // ✅ Configure Email
      const mailOptions = {
        from: emailUser,
        to: studentEmail,
        subject: `E-Tray Assignment for your skills of ${studentSkills}`,
        html: emailContent,
      };

      return transporter.sendMail(mailOptions)
        .then(info => console.log(`✅ Email sent to ${studentEmail}: ${info.response}`))
        .catch(err => console.log(`❌ Email failed to ${studentEmail}: ${err.message}`));
    });

    // ✅ Send All Emails
    await Promise.all(emailPromises);

    res.json({ message: "Emails sent and file logged successfully !" });

  } catch (error) {
    console.error("Error sending emails:", error);
    res.status(500).json({ message: "Error sending emails. Please check if the excel file is Closed ", error: error.message });
  }
});

module.exports = router;
