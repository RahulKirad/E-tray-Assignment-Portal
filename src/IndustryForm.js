import React, { useState } from "react";
import * as XLSX from "xlsx";
import "./StudentForm.css";
import ENDPOINTS from "./endpoint";

const IndustryForm = () => {
    const [formData, setFormData] = useState({
        senderName: "",
        senderEmail: "",
        organizationId: "",
        organizationPhoneNumber: "",
    });

    // eslint-disable-next-line no-unused-vars
    const [employeeData, setEmployeeData] = useState([]);

    // eslint-disable-next-line no-unused-vars
    const [questionData, setQuestionData] = useState([]);

    const [employeeFile, setEmployeeFile] = useState(null);
    const [questionFile, setQuestionFile] = useState(null);

    const parameters = {
        employeeListHeading: "Assignment Portal (Skill Wise)",
        EmployeeTableHeading: "Employee List",
        employeeTableHeaders: ["Name", "Employee Id", "Skills", "Email Id", "Response Received"],
        fileUploadLabel: "Upload Employee File:",
        questionUploadLabel: "Upload Question File:",
        employeeIdLabel: "Employee ID:",
        employeePhoneNumberLabel: "Employee Phone Number:",
    };

    const handleResponseChange = async (e, email) => {
        const isChecked = e.target.checked;

        console.log("Sending request to:", ENDPOINTS.UPDATE_INDUSTRY_RESPONSE);
        console.log("Payload:", { email, responseReceived: isChecked });

        try {
            const response = await fetch(ENDPOINTS.UPDATE_INDUSTRY_RESPONSE, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, responseReceived: isChecked }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server Error: ${response.status} - ${errorText}`);
            }

            const result = await response.json();

            setEmployeeData((prev) =>
                prev.map((employee) =>
                    employee.Email === email ? { ...employee, Response: isChecked } : employee
                )
            );

            alert(result.message || "Response updated successfully!");
        } catch (error) {
            console.error("Error:", error);
            alert(`Error updating response: ${error.message}`);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNumberChange = (e) => {
        const onlyNumbers = e.target.value.replace(/\D/g, "");
        setFormData({ ...formData, [e.target.name]: onlyNumbers });
    };

    const handleFileUpload = (e, type) => {
        const file = e.target.files[0];
        if (!file) return alert("Please select a valid Excel file.");

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: "array" });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                let jsonData = XLSX.utils.sheet_to_json(sheet);

                if (jsonData.length === 0) return alert("Uploaded file is empty.");

                if (type === "employees") {
                    jsonData = jsonData.map((row) => ({
                        Name: row["Name"] || row["name"] || row["NAME"] || "",
                        EmployeeId: row["Employee Id"] || row["EmployeeId"] || row["EMPLOYEE ID"] || "",
                        Skills: row["Skills"] || row["skills"] || row["SKILLS"] || "",
                        Email: row["Email Id"] || row["Email"] || row["EMAIL"] || row["email"] || "",
                        Response: row["Response Received"] || row["Response"] || false,
                    }));

                    setEmployeeFile(file);
                    setEmployeeData(jsonData);
                } else if (type === "questions") {
                    jsonData = jsonData.map((row) => ({
                        Question: row["Question"] || row["question"] || row["QUESTION"] || "",
                    }));

                    setQuestionFile(file);
                    setQuestionData(jsonData);
                }
            } catch (error) {
                alert("Error reading the Excel file. Please check the file format.");
            }
        };

        reader.readAsArrayBuffer(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!employeeFile || !questionFile) {
            return alert("Please upload both employee and question files.");
        }
    
        const formDataPayload = new FormData();
        formDataPayload.append("employees", employeeFile);
        formDataPayload.append("questions", questionFile);
        formDataPayload.append("senderName", formData.senderName);
        formDataPayload.append("organizationId", formData.organizationId);
        formDataPayload.append("organizationPhoneNumber", formData.organizationPhoneNumber);
    
        console.log("Submitting data to:", ENDPOINTS.SUBMIT_INDUSTRY);
    
        try {
            const response = await fetch(ENDPOINTS.SUBMIT_INDUSTRY, {
                method: "POST",
                body: formDataPayload,
            });
    
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Failed to send emails.");
    
            alert(result.message || "Emails sent successfully!");
    
            
        } catch (error) {
            console.error("Error:", error);
            alert(`Error: ${error.message}`);
        }
    };
    

    return (
        <div className="form-container">
            <h2>{parameters.employeeListHeading}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="left-section">
                        <label htmlFor="senderName">Organization Name:</label>
                        <input
                            type="text"
                            id="senderName"
                            name="senderName"
                            value={formData.senderName}
                            onChange={handleChange}
                            required
                            placeholder="Organization Name"
                        />

                        <label htmlFor="senderEmail">Organization Email:</label>
                        <input
                            type="email"
                            id="senderEmail"
                            name="senderEmail"
                            value={formData.senderEmail}
                            onChange={handleChange}
                            required
                            placeholder="Organization Email Id"
                        />

                        <label htmlFor="organizationId">Organization ID:</label>
                        <input
                            type="text"
                            id="organizationId"
                            name="organizationId"
                            value={formData.organizationId}
                            onChange={handleChange}
                            required
                            placeholder="Organization ID"
                        />

                        <label htmlFor="organizationPhoneNumber">Organization Phone Number:</label>
                        <input
                            type="text"
                            id="organizationPhoneNumber"
                            name="organizationPhoneNumber"
                            value={formData.organizationPhoneNumber}
                            onChange={handleNumberChange}
                            maxLength="10"
                            required
                            placeholder="Organization Phone Number"
                        />
                    </div>

                    <div className="right-section">
                        <label>{parameters.fileUploadLabel}</label>
                        <input type="file" accept=".xls,.xlsx" onChange={(e) => handleFileUpload(e, "employees")} />

                        <label>{parameters.questionUploadLabel}</label>
                        <input type="file" accept=".xls,.xlsx" onChange={(e) => handleFileUpload(e, "questions")} />
                    </div>
                </div>

                <div className="button-center">
                    <button type="submit">Send Questions</button>
                </div>
            </form>

            {employeeData.length > 0 && (
                <div>
                    <h3>{parameters.EmployeeTableHeading}</h3>
                    <table>
                        <thead>
                            <tr>
                                {parameters.employeeTableHeaders.map((header, index) => (
                                    <th key={index}>{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {employeeData.map((employee, index) => (
                                <tr key={index}>
                                    <td>{employee.Name}</td>
                                    <td>{employee.EmployeeId}</td>
                                    <td>{employee.Skills}</td>
                                    <td>{employee.Email}</td>
                                    <td>
                                        <input type="checkbox" checked={employee.Response} onChange={(e) => handleResponseChange(e, employee.Email)} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default IndustryForm;
