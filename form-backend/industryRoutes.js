const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const nodemailer = require("nodemailer");
const router = express.Router();
const { emailUser, emailPassword } = require("./emailCredentials");
const { logEmailDetails, getEmployeeIdField } = require("./logEmailDetails");

// Multer storage configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Email configuration
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: emailUser,
        pass: emailPassword,
    },
});

// Helper function to normalize skill names
const normalizeSkillName = (skill) => {
    return skill.replace(/\s|\./g, "").toLowerCase();
};

// Function to extract a valid email field
const getEmailField = (employee) => {
    const possibleKeys = ["Email", "Email Id", "eemail", "email", '"email"'];
    for (const key of possibleKeys) {
        if (employee[key]) {
            return employee[key].toString().replace(/"/g, "").trim();
        }
    }
    return null;
};

// Function to get 2 random questions per skill
const getRandomQuestions = (questions, count = 2) => {
    if (questions.length <= count) return questions;
    const shuffled = questions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

// Route to handle industry form submission
router.post("/industry/submit", upload.fields([{ name: "employees" }, { name: "questions" }]), async (req, res) => {
    try {
        if (!req.files || !req.files["employees"] || !req.files["questions"]) {
            return res.status(400).json({ message: "Missing required files." });
        }

        // Parse employee file
        const employeeBuffer = req.files["employees"][0].buffer;
        const employeeWorkbook = XLSX.read(employeeBuffer, { type: "buffer" });
        const employeeSheet = employeeWorkbook.Sheets[employeeWorkbook.SheetNames[0]];
        const employees = XLSX.utils.sheet_to_json(employeeSheet);

        // Parse question file
        const questionBuffer = req.files["questions"][0].buffer;
        const questionWorkbook = XLSX.read(questionBuffer, { type: "buffer" });

        // Extract question sheets with skill names
        const questionSheets = {};
        questionWorkbook.SheetNames.forEach((sheetName) => {
            const normalizedSheetName = normalizeSkillName(sheetName);
            const sheet = questionWorkbook.Sheets[sheetName];
            const questions = XLSX.utils.sheet_to_json(sheet);
            questionSheets[normalizedSheetName] = questions;
        });

        let emailPromises = [];
        let emailSendCount = 0;
        let failedEmails = [];

        for (const employee of employees) {
            let employeeEmail = getEmailField(employee);
            let employeeName = employee["Name"] ? employee["Name"].trim() : null;
            let employeeSkills = employee["Skills"] ? employee["Skills"].split(",") : [];

            if (!employeeEmail || !employeeName || !employeeEmail.includes("@")) {
                console.warn(`⚠️ Skipping employee due to missing/invalid email or name: ${JSON.stringify(employee)}`);
                failedEmails.push(employee);
                continue;
            }

            let employeeQuestions = [];

            for (const skill of employeeSkills) {
                const normalizedSkill = normalizeSkillName(skill);
                if (questionSheets[normalizedSkill]) {
                    employeeQuestions.push({
                        skillName: skill.trim(),
                        questions: getRandomQuestions(questionSheets[normalizedSkill], 2).map(q => q.Question)
                    });
                }
            }

            if (employeeQuestions.length === 0) continue;

            const { senderName, organizationId, organizationPhoneNumber } = req.body;

            // Constructing the HTML email content
            let emailContent = `<p>Hi <b>${employeeName}</b>,</p>
    <p>We hope you're doing well!</p>
    <p>You have been assigned the following E-Tray Assignment from ${senderName}:</p>
    <ul>
        <li><b>Email:</b> ${employeeEmail}</li>
        <li><b>Skills:</b> ${employee["Skills"]}</li>
    </ul>
    <p style="color: red; font-weight: bold;">Questions:</p>`;

            employeeQuestions.forEach(skill => {
                emailContent += `<p><b>${skill.skillName} Questions:</b></p><ul>`;
                skill.questions.forEach(question => {
                    emailContent += `<li>${question}</li>`;
                });
                emailContent += `</ul>`;
            });

            emailContent += `
    <hr>
    <p><b>Organization Details:</b></p>
    <ul>
        <li><b>Organization Name:</b> ${senderName}</li>
        <li><b>Organization ID:</b> ${organizationId}</li>
        <li><b>Organization Phone:</b> ${organizationPhoneNumber}</li>
    </ul>
    <p><b>Please complete your assignment on time.</b></p>
    <p>Best regards,</p>
    <p><b>${senderName}</b></p>`;

            // Configure Email
            const mailOptions = {
                from: emailUser,
                to: employeeEmail,
                subject: `E-Tray Assignment for your skills of ${employeeSkills.join(", ")}`,
                html: emailContent,
            };

            emailPromises.push(
                transporter.sendMail(mailOptions)
                    .then(info => {
                        console.log(`✅ Email sent to ${employeeEmail}: ${info.response}`);
                        emailSendCount++;

                        logEmailDetails({
                            organizationName: senderName,
                            organizationEmail: emailUser,
                            employeeName: employeeName,
                            employeeEmail: employeeEmail,
                            employeeId: getEmployeeIdField(employee),  // Properly fetch employee ID
                            questionsSent: employeeQuestions.flatMap(skill => skill.questions),
                            sendingDate: new Date().toISOString().split("T")[0],
                            sendingTime: new Date().toLocaleTimeString(),
                            employeeResponse: "N/A",
                            responseReceived: false,
                            responseReceivedDate: "N/A",
                            responseReceivedTime: "N/A",
                            score: "Pending"
                        });
                        
                        
                    })
                    .catch(err => {
                        console.log(`❌ Email failed to ${employeeEmail}: ${err.message}`);
                        failedEmails.push(employeeEmail);
                    })
            );
        }

        await Promise.all(emailPromises);
        res.json({ message: `Emails sent successfully: ${emailSendCount}`, failedEmails });
    } catch (error) {
        console.error("Error sending emails:", error);
        res.status(500).json({ message: "Error sending emails. Please check if the Excel file is closed.", error: error.message });
    }
});

module.exports = router;
