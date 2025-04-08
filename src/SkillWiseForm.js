import React, { useState } from "react";
import * as XLSX from "xlsx";
import "./StudentForm.css";
import ENDPOINTS from "./endpoint";

const SkillWiseForm = () => {
  const [formData, setFormData] = useState({
    senderName: "",
    senderEmail: "",
    collegeId: "",
    collegePhoneNumber: "",
  });

  const [studentData, setStudentData] = useState([]);
  const [studentFile, setStudentFile] = useState(null);
  const [questionFile, setQuestionFile] = useState(null);
  const [questionData, setQuestionData] = useState([]); // Used for validation & optional UI display

  const parameters = {
    studentListHeading: "Assignment Portal (Skill Wise)",
    StudentTableHeading: "Student List",
    studentTableHeaders: [
      "Name",
      "Roll No.",
      "Skills",
      "Email Id",
      "Response Received",
    ],
    fileUploadLabel: "Upload Student File:",
    questionUploadLabel: "Upload Question File:",
    collegeIdLabel: "College ID:",
    collegePhoneNumberLabel: "College Phone Number:",
  };

  const handleResponseChange = async (e, email) => {
    const isChecked = e.target.checked;

    try {
      const response = await fetch(ENDPOINTS.UPDATE_SKILLWISE_RESPONSE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, responseReceived: isChecked }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Update failed");

      setStudentData((prev) =>
        prev.map((student) =>
          student.Email === email ? { ...student, Response: isChecked } : student
        )
      );
      alert(result.message || "Response updated successfully!");
    } catch (error) {
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

        if (type === "students") {
          // Normalize column names
          jsonData = jsonData.map((row) => ({
            Name: row["Name"] || row["name"] || row["NAME"] || "",
            RollNo: row["Roll No."] || row["RollNo"] || row["ROLL NO"] || "",
            Skills: row["Skills"] || row["skills"] || row["SKILLS"] || "",
            Email: row["Email Id"] || row["Email"] || row["EMAIL"] || row["email"] || "",
            Response: row["Response Received"] || row["Response"] || false,
          }));

          setStudentFile(file);
          setStudentData(jsonData);
        } else if (type === "questions") {
          // Ensure question column is correctly extracted
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
  
    if (!studentFile || !questionFile) {
      return alert("Please upload both student and question files.");
    }
  
    const formDataObj = new FormData();
    formDataObj.append("students", studentFile);
    formDataObj.append("questions", questionFile);
    formDataObj.append("collegeName", formData.senderName); // Adding college name
    formDataObj.append("collegeEmail", formData.senderEmail); // Adding college email
    formDataObj.append("collegeId", formData.collegeId); // Adding college ID
    formDataObj.append("collegePhoneNumber", formData.collegePhoneNumber); // Adding college ID

  
  
    try {
      const response = await fetch(ENDPOINTS.SUBMIT_SKILLWISE, {
        method: "POST",
        body: formDataObj, 
      });
  
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to send emails.");
  
      // ✅ Show success message
      alert(result.message || "Emails sent successfully!");
  
      
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };
  
  





  return (
    <div className="form-container">
      <h2>{parameters.studentListHeading}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="left-section">
            <label htmlFor="senderName">College Name:</label>
            <input
              type="text"
              id="senderName"
              name="senderName"
              value={formData.senderName}
              onChange={handleChange}
              required
              placeholder="Name"
            />

            <label htmlFor="senderEmail">College Email:</label>
            <input
              type="email"
              id="senderEmail"
              name="senderEmail"
              value={formData.senderEmail}
              onChange={handleChange}
              required
              placeholder="Email Id"
            />

            <label htmlFor="collegeId">{parameters.collegeIdLabel}</label>
            <input
              type="text"
              id="collegeId"
              name="collegeId"
              value={formData.collegeId}
              onChange={handleChange}
              required
              placeholder="College ID"
            />

            <label htmlFor="collegePhoneNumber">
              {parameters.collegePhoneNumberLabel}
            </label>
            <input
              type="text"
              id="collegePhoneNumber"
              name="collegePhoneNumber"
              value={formData.collegePhoneNumber}
              onChange={handleNumberChange}
              maxLength="10"
              required
              placeholder="College Phone Number"
            />
          </div>

          <div className="right-section">
            <label>{parameters.fileUploadLabel}</label>
            <input
              type="file"
              accept=".xls,.xlsx"
              onChange={(e) => handleFileUpload(e, "students")}
            />

            <label>{parameters.questionUploadLabel}</label>
            <input
              type="file"
              accept=".xls,.xlsx"
              onChange={(e) => handleFileUpload(e, "questions")}
            />
          </div>
        </div>

        <div className="button-center">
          <button type="submit">Send Questions</button>
        </div>
      </form>

      {studentData.length > 0 && (
        <div>
          <h3>{parameters.StudentTableHeading}</h3>
          <table>
            <thead>
              <tr>
                {parameters.studentTableHeaders.map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {studentData.map((student, index) => (
                <tr key={index}>
                  <td>{student.Name}</td>
                  <td>{student.RollNo}</td>
                  <td>{student.Skills}</td>
                  <td>{student.Email || student["Email Id"]}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={student.Response || false}
                      onChange={(e) => handleResponseChange(e, student.Email)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {questionData.length > 0 && (
        <div>
          <h3>Uploaded Questions</h3>
          <ul>
            {questionData.map((question, index) => (
              <li key={index}>{question.Question || "Invalid Question Format"}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SkillWiseForm;
