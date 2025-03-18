const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const Imap = require("imap");
const { simpleParser } = require("mailparser");
const { emailUser, emailPassword } = require("./emailCredentials");

// IMAP Configuration (Replace with your details)
const imapConfig = {
    user: emailUser,
    password: emailPassword,
    host: "imap.gmail.com", // Update as per your email provider
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }, // 👈 Ignores SSL errors

};

const LOG_FOLDER = path.join(__dirname, "Admin Log");
const LOG_FILE_PATH = path.join(LOG_FOLDER, "industry_admin_log.xlsx");

// Ensure the log folder exists
if (!fs.existsSync(LOG_FOLDER)) {
    fs.mkdirSync(LOG_FOLDER, { recursive: true });
}

// Function to get employee ID dynamically
const getEmployeeIdField = (employee) => {
    const possibleKeys = ["ID", "Id", "id", "Employee ID", "Emp ID", "EmpID", "Employee Id", "employee_id"];
    for (const key of possibleKeys) {
        if (employee[key]) {
            return employee[key].toString().trim();
        }
    }
    return "N/A";
};

// Function to log email details
const logEmailDetails = (logData) => {
    let workbook, worksheet;

    // Check if the log file exists; if not, create a new workbook
    if (fs.existsSync(LOG_FILE_PATH)) {
        try {
            workbook = XLSX.readFile(LOG_FILE_PATH);
            worksheet = workbook.Sheets[workbook.SheetNames[0]];
        } catch (error) {
            console.error("❌ Error reading the log file:", error);
            return;
        }
    } else {
        console.warn("⚠️ Activity log file not found. Creating a new one...");
        workbook = XLSX.utils.book_new();
        worksheet = XLSX.utils.json_to_sheet([]);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Log");
        XLSX.writeFile(workbook, LOG_FILE_PATH);
    }

    // Convert worksheet to JSON format
    let logEntries = XLSX.utils.sheet_to_json(worksheet) || [];

    // Find if the employee email exists in the log
    let entryIndex = logEntries.findIndex(entry => entry["Employee Email"] === logData.employeeEmail);

    // Determine Employee Response and Response Received status
    const employeeResponse = logData.employeeResponse && logData.employeeResponse.trim() !== "" ? logData.employeeResponse : "N/A";
    const responseReceived = employeeResponse !== "N/A" && employeeResponse.trim().toLowerCase() !== "n/a" ? "Yes" : "No";

    if (entryIndex !== -1) {
        logEntries[entryIndex]["Employee Response"] = employeeResponse;
        logEntries[entryIndex]["Response Received"] = responseReceived;
        logEntries[entryIndex]["Response Received Date"] = responseReceived === "Yes" ? (logData.responseReceivedDate || new Date().toISOString().split("T")[0]) : "N/A";
        logEntries[entryIndex]["Response Received Time"] = responseReceived === "Yes" ? (logData.responseReceivedTime || new Date().toLocaleTimeString()) : "N/A";
    } else {
        // Append new log entry if not found
        logEntries.push({
            "Organization Name": logData.organizationName,
            "Organization Email": logData.organizationEmail,
            "Employee Name": logData.employeeName,
            "Employee Email": logData.employeeEmail,
            "Employee ID": logData.employeeId || "N/A",
            "Questions Sent": logData.questionsSent.join(" | "),
            "Sending Date": logData.sendingDate,
            "Sending Time": logData.sendingTime,
            "Employee Response": employeeResponse,
            "Response Received": responseReceived,
            "Response Received Date": responseReceived === "Yes" ? logData.responseReceivedDate || new Date().toISOString().split("T")[0] : "N/A",
            "Response Received Time": responseReceived === "Yes" ? logData.responseReceivedTime || new Date().toLocaleTimeString() : "N/A",
            "Score": logData.score || "Pending"
        });
    }

    // Convert JSON back to worksheet
    const newWorksheet = XLSX.utils.json_to_sheet(logEntries, {
        header: [
            "Organization Name", "Organization Email", "Employee Name",
            "Employee Email", "Employee ID", "Questions Sent",
            "Sending Date", "Sending Time", "Employee Response", "Response Received",
            "Response Received Date", "Response Received Time", "Score"
        ],
    });

    // Update the workbook and save it
    workbook.Sheets[workbook.SheetNames[0]] = newWorksheet;
    XLSX.writeFile(workbook, LOG_FILE_PATH);

    console.log(`✅ Log updated for ${logData.employeeEmail}`);
};

// Function to fetch email responses via IMAP
const fetchEmailResponses = () => {
    const imap = new Imap(imapConfig);

    imap.once("ready", () => {
        imap.openBox("INBOX", false, (err, box) => {
            if (err) throw err;

            // Search for unread emails
            imap.search(["UNSEEN"], (err, results) => {
                if (err || !results.length) {
                    console.log("📭 No new emails.");
                    imap.end();
                    return;
                }

                const fetchEmails = imap.fetch(results, { bodies: "", markSeen: true });

                fetchEmails.on("message", (msg, seqno) => {
                    msg.on("body", async (stream) => {
                        const parsedEmail = await simpleParser(stream);
                        const senderEmail = parsedEmail.from.value[0].address;
                        const emailBody = parsedEmail.text || parsedEmail.html;

                        console.log(`📩 New email from: ${senderEmail}`);

                        // Log response into the Excel file
                        logEmailDetails({
                            employeeEmail: senderEmail,
                            employeeResponse: emailBody,
                            responseReceived: true,
                            responseReceivedDate: new Date().toISOString().split("T")[0],
                            responseReceivedTime: new Date().toLocaleTimeString()
                        });
                    });
                });

                fetchEmails.once("end", () => {
                    console.log("✅ Email processing done.");
                    imap.end();
                });
            });
        });
    });

    imap.once("error", (err) => {
        console.error("❌ IMAP error:", err);
    });

    imap.once("end", () => {
        console.log("📤 Disconnected from mail server.");
    });

    imap.connect();
};

// Run email fetching periodically
setInterval(fetchEmailResponses, 60000); // Checks for new emails every 60 seconds

module.exports = { logEmailDetails, getEmployeeIdField, fetchEmailResponses };
