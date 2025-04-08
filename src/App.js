import React, { useState } from 'react';
import CourseWiseForm from './CourseWiseForm';
import SkillWiseForm from './SkillWiseForm';
import IndustryForm from './IndustryForm';
import Navbar from './Navbar';
import Menu from './menu';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';


const App = () => {
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [fadeOut, setFadeOut] = useState(false);

  const handleMenuSelect = (menu) => {
    setFadeOut(true); // Start fade-out

    setTimeout(() => {
      setSelectedMenu(menu); // Update menu after fade-out
      setFadeOut(false); // Reset fade effect
    }, 500); // Delay matches transition duration
  };

  return (
    <div className="container-fluid">
      <Navbar />

      <h1 className={`${selectedMenu ? "moved-to-top" : "centered"} ${fadeOut ? "fade-out" : ""}`}>
        E-Tray Assignment Portal
        <img src={require("./images/etray.webp")} alt="Company Logo" className="smalllogo" />
      </h1>

      {/* Sidebar Menu */}
      <Menu setSelectedMenu={handleMenuSelect} selectedMenu={selectedMenu} />


      {/* Content Section */}
      <div className="content-container">
        {selectedMenu === 'course' && <CourseWiseForm />}
        {selectedMenu === 'skills' && <SkillWiseForm />}
        {selectedMenu === 'industry' && <IndustryForm />}
      </div>
    </div>
  );
};

export default App;
