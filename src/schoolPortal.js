import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import './StudentForm.css';
import ENDPOINTS from "./endpoint";


const SchoolPortal = () => {
  const [formData, setFormData] = useState({
    course: '',
    year: '',
    semester: '',
    senderName: '',
    senderEmail: '',
  });

  const [studentData, setStudentData] = useState([]);

  const parameters = {
    course: {
      label: 'Subject',
      options: [
        'Maths',
        'Science',
        'Computer',
        'Physics',
        'Chemistry',
        'History ',
        'Geography',
        'Biology',
        'English',
        'Marathi',
        'Hindi',
      ],
    },
    year: {
      label: 'Standard',
      options: ['1st ', '2nd ', '3rd ', '4th', '5th', '6th', '7th', '8th', '9th', '10th'],
    },
    semester: {
      label: 'Semester',
      options: ['Sem 1', 'Sem 2',],
    },
    studentListHeading: 'School Assignment Portal ',
    StudentTableHeading: 'Student List',
    studentTableHeaders: ['Name', 'Roll No.', 'Standard', 'Email Id', 'Response Received'],
    fileUploadLabel: 'Upload Student File:',
  };

  const updateResponse = async (email, isChecked) => {
    try {
      const response = await fetch(ENDPOINTS.UPDATE_RESPONSE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, responseReceived: isChecked }),
      });

      const result = await response.json();
      if (response.ok) {
        alert(result.message || 'Response updated successfully!');
      } else {
        throw new Error(result.message || 'Failed to update response.');
      }
    } catch (error) {
      alert(`Error updating response: ${error.message}`);
    }
  };

  const handleResponseChange = (e, email) => {
    const isChecked = e.target.checked;
    updateResponse(email, isChecked);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const readExcel = (e) => {
    const file = e.target.files[0];
    if (!file) {
      alert('Please upload a valid Excel file.');
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        setStudentData(jsonData);
      } catch (error) {
        alert('Error reading the Excel file. Please check the file format.');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(ENDPOINTS.SUBMIT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          studentData,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        alert(result.message);
      } else {
        throw new Error(result.message || 'An error occurred while submitting the form.');
      }
    } catch (error) {
      alert(`Submission failed: ${error.message}`);
    }
  };

  return (
    <div className="form-container">
      <h2>{parameters.studentListHeading}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="left-section">
            <div className="name-email">
              <div>
                <label htmlFor="senderName">School Name:</label>
                <input
                  type="text"
                  id="senderName"
                  name="senderName"
                  value={formData.senderName}
                  onChange={handleChange}
                  required
                  placeholder="School Name"
                />
              </div>

              <div>
                <label htmlFor="senderEmail">School Email Id:</label>
                <input
                  type="email"
                  id="senderEmail"
                  name="senderEmail"
                  value={formData.senderEmail}
                  onChange={handleChange}
                  required
                  placeholder=" School Email Id"
                />
              </div>
              {/* Added College ID Field */}
              <div>
                <label htmlFor="collegeId">School ID:</label>
                <input
                  type="text"
                  id="collegeId"
                  name="collegeId"
                  value={formData.collegeId}
                  onChange={handleChange}
                  required
                  placeholder="School ID"
                />
              </div>

              {/* Added College Phone Number Field */}
              <div>
                <label htmlFor="collegenumber">School Phone Number:</label>
                <input
                  type="text"
                  id="collegenumber"
                  name="collegenumber"
                  value={formData.collegenumber}
                  onChange={(e) => {
                    const onlyNumbers = e.target.value.replace(/\D/g, ''); // Remove non-numeric characters
                    setFormData({ ...formData, collegenumber: onlyNumbers });
                  }}
                  maxLength="10"
                  required
                  placeholder="School Phone Number"
                />
              </div>
            </div>
          </div>

          <div className="right-section">
            <div>
              <label htmlFor="course">{parameters.course.label}:</label>
              <select id="course" name="course" value={formData.course} onChange={handleChange}>
                {parameters.course.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="year">{parameters.year.label}:</label>
              <select id="year" name="year" value={formData.year} onChange={handleChange}>
                {parameters.year.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="semester">{parameters.semester.label}:</label>
              <select id="semester" name="semester" value={formData.semester} onChange={handleChange}>
                {parameters.semester.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="file">{parameters.fileUploadLabel}</label>
              <input type="file" onChange={readExcel} />
            </div>
            <div>
              <label htmlFor="questionFile">Upload Question File:</label>
              <input type="file" id="questionFile" name="questionFile" />
            </div>

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
              {studentData.map((row, index) => (
                <tr key={index}>
                  {Object.keys(row).map((key, i) => (
                    <td key={i}>{row[key]}</td>
                  ))}

                  <td>
                    <input
                      type="checkbox"
                      onChange={(e) => handleResponseChange(e, row.email)}
                    />
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

export default SchoolPortal;
