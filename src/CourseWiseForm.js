import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import './StudentForm.css';
import ENDPOINTS from "./endpoint";


const CourseWiseForm = () => {
  const [formData, setFormData] = useState({
    course: 'Computer Science',
    year: '1st Year',
    semester: 'Sem 1',
    senderName: '',
    senderEmail: '',
  });

  const [studentData, setStudentData] = useState([]);

  const parameters = {
    course: {
      label: 'Course',
      options: [
        'Computer Science',
        'Data Science and Artificial Intelligence',
        'Information Technology',
      ],
    },
    year: {
      label: 'Year',
      options: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
    },
    semester: {
      label: 'Semester',
      options: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'],
    },
    studentListHeading: 'Assignment Portal (Course Wise)',
    StudentTableHeading: 'Student List',
    studentTableHeaders: ['Name', 'Roll No.', 'Skills', 'Email Id', 'Response Received'],
    fileUploadLabel: 'Upload Student File:',
  };

  const updateResponse = async (email, isChecked) => {
    try {
      const response = await fetch( ENDPOINTS.UPDATE_RESPONSE, {
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
              </div>

              <div>
                <label htmlFor="senderEmail">College Email Id:</label>
                <input
                  type="email"
                  id="senderEmail"
                  name="senderEmail"
                  value={formData.senderEmail}
                  onChange={handleChange}
                  required
                  placeholder="Email Id"
                />
              </div>
              {/* Added College ID Field */}
              <div>
                <label htmlFor="collegeId">College ID:</label>
                <input
                  type="text"
                  id="collegeId"
                  name="collegeId"
                  value={formData.collegeId}
                  onChange={handleChange}
                  required
                  placeholder="College ID"
                />
              </div>

              {/* Added College Phone Number Field */}
              <div>
                <label htmlFor="collegenumber">College Phone Number:</label>
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
                  placeholder="College Phone Number"
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

export default CourseWiseForm;
