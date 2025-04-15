import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import Slideshow from './slideshow';
import { Link } from 'react-router-dom'; // at the top


const LandingPage = () => {
  const navigate = useNavigate();

  const handleEnterPortal = () => {
    navigate('/portal');
  };

  return (
    <div className="landing-container">
      <nav className="navbar">
        <div className="nav-left">
          <img
            src={require('./images/logo.jpeg')}
            alt="PassionIT Infotech"
            className="nav-logo"
          />
          <div className="nav-brand">
            <p className="company-name-line1">Passion IT Infotech</p>
            <p className="company-name-line2">Pvt Ltd</p>
          </div>
        </div>

        <h1 className="nav-center-title">Welcome to Passion IT Framework</h1>

        <ul className="nav-links">
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about" >About Us</Link></li>
            <li><Link to="/services">Services</Link></li>
          </ul>
        </ul>
      </nav>

      {/* SLIDESHOW SECTION */}
      <div className="section header">
        <Slideshow />
        <button onClick={handleEnterPortal} className="enter-btn">
          Go to E-Tray Assignment Portal
        </button>
      </div>

      <footer className="footer">
        <address>
          <p>
            Office #5, Block 1, Lloyds Chambers, Mangalwar Peth, Near Ambedkar
            Bavan, Pune – 411011
          </p>
          <p>+91 8390234456</p>
        </address>
        <p>
          © 2025 Passionit.com All rights reserved. Privacy-Policy | Terms and
          Conditions | Children’s Terms and Conditions
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
