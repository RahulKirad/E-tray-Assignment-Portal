import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import './StudentForm.css';
import ENDPOINTS from "./endpoint";

const IndustryForm = () => {
    const [formData, setFormData] = useState({
        organizationName: '',
        employeeName: '',
        employeeId: '',
    });

    const [employeeData, setEmployeeData] = useState([]);

    const parameters = {
        organizationName: 'Organization Name',
        employeeName: 'Organazation Employee Name',
        employeeId: 'Organization Employee ID',
        employeenumber: 'Organization Phone Number',
        fileUploadLabel: 'Upload Employee File:',
        tableHeading: 'Employee List',
        tableHeaders: ['Organization Employee Name', 'Organtization Employee ID', 'Organization Phone Number', 'Organization Email Id', 'Response Received'],
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
                setEmployeeData(jsonData);
            } catch (error) {
                alert('Error reading the Excel file. Please check the file format.');
            }
        };

        reader.readAsArrayBuffer(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(ENDPOINTS.SUBMIT_INDUSTRY, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    employeeData,
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
            <h2>Industry Assignment Portal</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="left-section">
                        <div className="name-email">
                            <div>
                                <label htmlFor="organizationName">{parameters.organizationName}:</label>
                                <input
                                    type="text"
                                    id="organizationName"
                                    name="organizationName"
                                    value={formData.organizationName}
                                    onChange={handleChange}
                                    required
                                    placeholder="Organization Name"
                                />
                            </div>

                            <div>
                                <label htmlFor="employeeName">{parameters.employeeName}:</label>
                                <input
                                    type="text"
                                    id="employeeName"
                                    name="employeeName"
                                    value={formData.employeeName}
                                    onChange={handleChange}
                                    required
                                    placeholder="Employee Name"
                                />
                            </div>

                            <div>
                                <label htmlFor="employeeId">{parameters.employeeId}:</label>
                                <input
                                    type="text"
                                    id="employeeId"
                                    name="employeeId"
                                    value={formData.employeeId}
                                    onChange={handleChange}
                                    required
                                    placeholder="Employee ID"
                                />
                            </div>
                            <div>
                                <label htmlFor="employeenumber">{parameters.employeenumber}:</label>
                                <input
                                    type="text"
                                    id="employeenumber"
                                    name="employeenumber"
                                    value={formData.employeenumber} // Fixed: Now using the correct state
                                    onChange={(e) => {
                                        const onlyNumbers = e.target.value.replace(/\D/g, ''); // Restricts input to numbers only
                                        setFormData({ ...formData, employeenumber: onlyNumbers });
                                    }}
                                    maxLength="10"
                                    required
                                    placeholder="Organization phone number"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="right-section">
                        <div>
                            <label htmlFor="file">{parameters.fileUploadLabel}</label>
                            <input type="file" onChange={readExcel} />
                        </div>
                    </div>
                </div>

                <div className="button-center">
                    <button type="submit">Send Assignments</button>
                </div>
            </form>

            {employeeData.length > 0 && (
                <div>
                    <h3>{parameters.tableHeading}</h3>
                    <table>
                        <thead>
                            <tr>
                                {parameters.tableHeaders.map((header, index) => (
                                    <th key={index}>{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {employeeData.map((row, index) => (
                                <tr key={index}>
                                    {Object.keys(row).map((key, i) => (
                                        <td key={i}>{row[key]}</td>
                                    ))}
                                    <td>
                                        <input type="checkbox" />
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
