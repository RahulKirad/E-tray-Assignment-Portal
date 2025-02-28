import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark" style={{ width: '100%', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}>
      <div className="container">
        {/* Company Logo & Name */}
        <a className="navbar-brand d-flex align-items-center" href="/">
          <img src={require("./images/logo.jpeg")} alt="Company Logo" className="logo me-2" />
          <span className="navbar-text">
            Passion Infotech <br /> Pvt Ltd
          </span>
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
