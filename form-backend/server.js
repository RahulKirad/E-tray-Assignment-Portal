const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");
const imap = require("imap");
const { simpleParser } = require("mailparser");
const { emailUser, emailPassword } = require('./emailCredentials');
const skillwiseRoutes = require("./skillwiseRoutes"); 


console.log(emailUser, emailPassword);


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
require('dotenv').config();
app.use(express.urlencoded({ extended: true }));
app.use("/api", skillwiseRoutes);


/**
 * Fetch student responses from the sender's mailbox
 * @param {string} senderEmail - Sender's email address
 * @param {string} senderPassword - Sender's email password or app-specific password
 * @returns {Promise<Array>}
 */
function fetchStudentResponses() {
    return new Promise((resolve, reject) => {
        const client = new imap({
            user:emailUser,
            password: emailPassword, 
            host: "imap.gmail.com",
            port: 993,
            tls: true,
            tlsOptions: { rejectUnauthorized: false },
        });

        const responses = [];

        client.once("ready", () => {
            console.log("✅ IMAP client is ready.");

            client.openBox("INBOX", false, (err, box) => {
                if (err) {
                    console.error("❌ Error opening inbox:", err);
                    return reject(err);
                }

                console.log(`📂 Inbox opened. Total messages: ${box.messages.total}`);

                const searchCriteria = ["ALL"]; // Fetch all emails
                const fetchOptions = { bodies: "", markSeen: false };

                client.search(searchCriteria, (err, results) => {
                    if (err) {
                        console.error("❌ Error searching emails:", err);
                        return reject(err);
                    }

                    if (!results.length) {
                        console.log("📭 No new emails found.");
                        client.end();
                        return resolve(responses);
                    }

                    console.log(`📩 Found ${results.length} emails. Fetching...`);

                    const f = client.fetch(results, fetchOptions);
                    let emailPromises = [];

                    f.on("message", (msg) => {
                        let emailPromise = new Promise((resolveEmail) => {
                            let buffer = "";

                            msg.on("body", (stream) => {
                                stream.on("data", (chunk) => {
                                    buffer += chunk.toString("utf8");
                                });

                                stream.on("end", async () => {
                                    try {
                                        const parsed = await simpleParser(buffer);
                                        const fromEmail = parsed.from.text.match(/<([^>]+)>/)?.[1] || parsed.from.text;
                                        const emailData = {
                                            fromEmail: fromEmail.trim().toLowerCase(),
                                            content: parsed.text.trim(),
                                        };

                                        console.log("📧 Parsed Email:", emailData);

                                        responses.push(emailData);
                                        resolveEmail();
                                    } catch (err) {
                                        console.error("❌ Error parsing email:", err);
                                        resolveEmail(); // Resolve to avoid blocking
                                    }
                                });
                            });

                            msg.once("end", () => {
                                console.log("✅ Email message processed.");
                            });
                        });

                        emailPromises.push(emailPromise);
                    });

                    f.once("error", (err) => {
                        console.error("❌ IMAP fetch error:", err);
                        reject(err);
                    });

                    f.once("end", async () => {
                        console.log("✅ Email fetching completed.");
                        await Promise.all(emailPromises); // Wait for all parsing to complete
                        client.end();
                        resolve(responses);
                    });
                });
            });
        });

        client.once("error", (err) => {
            console.error("❌ IMAP connection error:", err);
            reject(err);
        });

        client.once("end", () => {
            console.log("🔌 IMAP connection ended.");
        });

        client.connect();
    });
}


/**
 * Adjust column widths for proper spacing in an Excel sheet
 * @param {Object} worksheet - The worksheet object
 */
function adjustColumnWidths(worksheet) {
    const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    const columnWidths = rows.reduce((widths, row) => {
        row.forEach((cell, index) => {
            const cellLength = cell ? cell.toString().length : 10;
            widths[index] = Math.max(widths[index] || 0, cellLength);
        });
        return widths;
    }, []);
    worksheet["!cols"] = columnWidths.map((width) => ({ width }));
}

/**
 * Retrieve questions from all sheets in an Excel file
 * @param {string} filePath - Path to the Excel file
 * @returns {Array} Array of questions grouped by subject
 */
function getQuestionsFromAllSheets(filePath) {
    const workbook = xlsx.readFile(filePath);
    const allQuestions = [];

    workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        if (data.length > 0) {
            const shuffled = data.sort(() => Math.random() - 0.5);
            const selectedQuestions = shuffled.slice(0, 2);

            allQuestions.push({
                subject: sheetName,
                questions: selectedQuestions.map((q) => q.Question || "No Question Found"),
            });
        }
    });

    return allQuestions;
}

/**
 * Log admin activity to an Excel file
 * @param {string} adminName - Name of the admin
 * @param {Array} students - List of students
 * @param {string} senderName - Name of the sender
 * @param {string} senderEmail - Email of the sender
 * @param {Array} allQuestions - List of questions sent
 * @param {string} date - Date of the activity
 * @param {string} time - Time of the activity
 */
function logAdminActivity(adminName, students, senderName, senderEmail, allQuestions, date, time) {
    const logFilePath = path.join(__dirname, "./admin_activity_log.xlsx");
    const logEntries = students.map((student) => ({
        Admin: adminName,
        "Sender Name": senderName,
        "Sender Email": senderEmail,
        "Recipient Name": student.name,
        "Recipient Email": student.email,
        "Reception Date": date,
        "Reception Time": time,
        "Questions Sent": allQuestions
            .map(({ subject, questions }) => {
                const questionList = questions
                    .map((q, index) => `${index + 1}. ${q}`)
                    .join("\n\n");
                return `\n${subject}:\n${questionList}`;
            })
            .join("\n\n"),
        "Response Received": student.response ? "Yes" : "No",
        "Response of Student": student.response ? student.response : "No Response", // New column

    }));

    let workbook, worksheet;

    if (fs.existsSync(logFilePath)) {
        workbook = xlsx.readFile(logFilePath);
        worksheet = workbook.Sheets["Log"] || xlsx.utils.json_to_sheet([]);
        const existingData = xlsx.utils.sheet_to_json(worksheet);
        const updatedData = existingData.concat(logEntries);
        worksheet = xlsx.utils.json_to_sheet(updatedData);
        workbook.Sheets["Log"] = worksheet;
    } else {
        workbook = xlsx.utils.book_new();
        worksheet = xlsx.utils.json_to_sheet(logEntries);
        xlsx.utils.book_append_sheet(workbook, worksheet, "Log");
    }

    adjustColumnWidths(worksheet);
    xlsx.writeFile(workbook, logFilePath);
}

/**
 * Update log with student responses
 * @param {Array} responses - List of responses mapped to student emails
 */
function updateLogWithResponses(responses) {
    const logFilePath = path.join(__dirname, "./admin_activity_log.xlsx");

    if (!fs.existsSync(logFilePath)) {
        console.error("❌ Activity log file not found.");
        return;
    }

    console.log("📄 Reading admin activity log...");
    const workbook = xlsx.readFile(logFilePath);
    const worksheet = workbook.Sheets["Log"];
    const data = xlsx.utils.sheet_to_json(worksheet, { defval: "" });

    console.log(`✅ Loaded ${data.length} rows from the log file.`);

    const updatedData = data.map((row, index) => {
        const recipientEmail = row["Recipient Email"].trim().toLowerCase();

        console.log(`🔍 Checking responses for: ${recipientEmail} (Row ${index + 2})`);

        // Find email matching recipient email
        const matchingEmail = responses.find((r) => {
            const fromEmail = r.fromEmail.trim().toLowerCase();
            const emailAddress = fromEmail.match(/<([^>]+)>/)?.[1] || fromEmail;
            return emailAddress.includes(recipientEmail);
        });

        if (matchingEmail && matchingEmail.content) {
            let studentResponse = matchingEmail.content.trim();

            if (studentResponse) {
                console.log(`📩 Response found from ${recipientEmail}: "${studentResponse}"`);
                row["Response Received"] = "Yes";
                row["Response of Student"] = studentResponse;
            } else {
                console.log(`⚠️ Empty response from ${recipientEmail}, marking as 'No Response'`);
                row["Response Received"] = "No";
                row["Response of Student"] = "No Response";
            }
        } else {
            console.log(`🚫 No response from ${recipientEmail}`);
            row["Response Received"] = "No";
            row["Response of Student"] = "No Response";
        }

        return row;
    });

    console.log("📝 Updating Excel log file...");

    // Convert updated data to worksheet format
    const updatedWorksheet = xlsx.utils.json_to_sheet(updatedData);
    workbook.Sheets["Log"] = updatedWorksheet;

    // Adjust column widths for better readability
    adjustColumnWidths(updatedWorksheet);

    // Save updated Excel file
    xlsx.writeFile(workbook, logFilePath);
    console.log("✅ Student responses successfully logged in Excel!");

    // Debugging: Show the first 5 rows of final data
    console.log("📊 Final Data Preview:", updatedData.slice(0, 5));
}




// Example usage: Fetch student responses and update the log
const senderEmail = process.env.EMAIL_USER;
const senderPassword = process.env.EMAIL_PASSWORD; // Replace with secure credential management

// Fetch and update responses every 10 minutes (for example)
setInterval(() => {
    fetchStudentResponses(senderEmail, senderPassword)
        .then((responses) => {
            updateLogWithResponses(responses);
        })
        .catch((err) => {
            console.error("Error fetching student responses:", err);
        });
}, 60000); // 600000 milliseconds = 10 minutes
/**
 * Update response received for a student in the admin activity log
 */
app.post("/api/update-response", async (req, res) => {
    const { email, responseReceived } = req.body;

    try {
        const logFilePath = path.join(__dirname, "./admin_activity_log.xlsx");

        if (!fs.existsSync(logFilePath)) {
            return res.status(404).json({ message: "Activity log file not found." });
        }

        const workbook = xlsx.readFile(logFilePath);
        const worksheet = workbook.Sheets["Log"];
        const data = xlsx.utils.sheet_to_json(worksheet, { defval: "" });

        const updatedData = data.map((row) => {
            if (row["Recipient Email"] === email) {
                return { ...row, "Response Received": responseReceived ? "Yes" : "No" };
            }
            return row;
        });

        const updatedWorksheet = xlsx.utils.json_to_sheet(updatedData);
        workbook.Sheets["Log"] = updatedWorksheet;
        adjustColumnWidths(updatedWorksheet);
        xlsx.writeFile(workbook, logFilePath);

        res.status(200).json({ message: "Response updated successfully." });
    } catch (error) {
        console.error("Error updating response:", error);
        res.status(500).json({ message: "Failed to update response.", error });
    }
});




app.post("/api/submit", async (req, res) => {
    try {
        const { course, year, semester, studentData, senderName, senderEmail, adminName = "CollegeAdminName" } = req.body;

        const directoryPath = path.join(__dirname, "./Questions");
        const folderName = `${course} ${year}`.toLowerCase();
        const sanitizedSemester = semester.replace(/^Sem\s*/, "").trim().toLowerCase();
        const fileName = `sem ${sanitizedSemester}.xlsx`;
        const filePath = path.join(directoryPath, folderName, fileName);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                message: `File not found for course: "${course}", year: "${year}", semester: "${semester}" at ${filePath}`,
            });
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: emailUser,
                pass: emailPassword, // Replace with a secure method for credentials
            },
        });

        const allQuestions = getQuestionsFromAllSheets(filePath);
        const timestamp = new Date();
        const date = timestamp.toISOString().split("T")[0];
        const time = timestamp.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true });

        for (const student of studentData) {
            const { email, name } = student;

            let emailContent = `
                <p>Hi <b>${name}</b>,</p>
                <p>We hope you're doing well!</p>
                <p>You have been assigned the following E-Tray Assignment for:</p>
                <ul>
                    <li><b>Course:</b> ${course}</li>
                    <li><b>Year:</b> ${year}</li>
                    <li><b>Semester:</b> ${semester}</li>
                </ul>
                <p style="color: red; font-weight: bold;">Questions:</p>
            `;

            allQuestions.forEach(({ subject, questions }) => {
                emailContent += `<h3>Subject: ${subject}:</h3><ul>`;
                emailContent += questions.map((q) => `<li>${q}</li>`).join("");
                emailContent += "</ul>";
            });

            emailContent += `
                <p>Best regards,</p>
                <p>${adminName}</p>
            `;

            try {
                await transporter.sendMail({
                    from: senderEmail,
                    to: email,
                    subject: `E-Tray Assignment: ${course}`,
                    html: emailContent,
                });
                console.log(`Email sent to ${email}`);
            } catch (error) {
                console.error(`Error sending email to ${email}:`, error);
            }
        }

        logAdminActivity(adminName, studentData, senderName, senderEmail, allQuestions, date, time);
        res.status(200).json({ message: "Emails sent and logged successfully!" });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "An error occurred. Ensure the Excel file is closed and try again." });
    }
});

// Start the server
const port = process.env.PORT || 2024;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});