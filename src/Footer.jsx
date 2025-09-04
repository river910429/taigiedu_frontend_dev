import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-buttons">
        <button className="footer-button">Our team</button>
        <button className="footer-button">Terms</button>
        <button className="footer-button">Policy</button>
        <button className="footer-button">Admin Login</button>
      </div>
      <div className="footer-text">
        © 2024 台語文教學共備平台 All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;