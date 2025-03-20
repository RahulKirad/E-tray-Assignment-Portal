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

  return (



    <div className="container-fluid">
      <Navbar />

      <h1 className={selectedMenu ? 'moved-to-top' : 'centered'}>
        E-Tray Assignment Portal
        <img src={require("./images/etray.webp")} alt="Company Logo" className="smalllogo" />

      </h1>


      {/* Sidebar Menu */}
      <Menu setSelectedMenu={setSelectedMenu} selectedMenu={selectedMenu} />

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
